import { Worker } from "bullmq";
import Redis from "ioredis";
import GitUploader from "../utils/gitUploader.js";
import { GITHUB_CONFIG } from "../../config/config.js";
import NewsService from "../services/newsService.js";
import logger from "../utils/logger.js";


const pub = new Redis();  // 用于发布任务状态
const connection = new Redis({maxRetriesPerRequest:null}); 
function publishStatusToRedis(clientId, jobId, news_id, status, message) {
  const payload = {
    clientId,
    jobId,
    news_id,
    status,
    message,
    timestamp: new Date().toISOString(),
  }
  pub.publish('tts_status_channel', JSON.stringify(payload));
}
const rootDir = process.cwd();
const gitUploader = new GitUploader(
  GITHUB_CONFIG.REPO_OWNER,
  GITHUB_CONFIG.REPO_NAME,
  GITHUB_CONFIG.ACCESS_TOKEN,
);

const ttsWorker = new Worker(
  "ttsQueue",
  async (job) => {
    const { news_id, clientId } = job.data;
    logger.info("[TTSWorker]接收到TTS任务", { news_id, jobId: job.id });

    try {
      await job.updateProgress(0);
      // 发布任务排队状态
      publishStatusToRedis(clientId, job.id, news_id, 'waiting', '任务排队中...');

      const news = await NewsService.getNewsById(news_id);
      if (!news) {
        const msg = "新闻不存在";
        logger.warn(`[TTSWorker] ${msg}`, { news_id });
        throw new Error(msg);
      }

      publishStatusToRedis(clientId, job.id, news_id, 'processing', '正在生成语音...')
      await job.updateProgress(20);

      const { savePath, duration } = await NewsService.generateTTS(news_id);
      await job.updateProgress(60);

      const githubUrl = await gitUploader.uploadFile(savePath);
      await job.updateProgress(90);

      await NewsService.createNewsAudio(news.id, githubUrl, duration);
      await job.updateProgress(100);

      const result = {
        news_id,
        url: githubUrl,
        duration,
      };

      // 发布任务完成状态
      publishStatusToRedis(clientId, job.id, news_id, 'done', '语音生成完成');
      logger.info("[TTSWorker]成功完成任务", result);
      return result;
    } catch (error) {
      logger.error("[TTSWorker]任务处理失败", {
        news_id,
        error: error.message,
      });
      // 发布任务失败状态
      publishStatusToRedis(clientId, 'failed', `语音生成失败: ${error.message}`)
      throw error;
    }
  },
  { connection }
);

// 状态事件监听
ttsWorker.on("completed", async (job) => {
  const news_id = job.data.news_id;
  logger.log(`[TTSWorker][完成] job ${job.id}`, job.returnvalue);
  await connection.del(`tts:job:${news_id}`); // 清理映射
});

ttsWorker.on("failed", async (job, err) => {
  const news_id = job.data.news_id;
  console.error(`[TTSWorker][失败] job ${job.id}`, err);
  await connection.del(`tts:job:${news_id}`);
});

ttsWorker.on("active", (job) => {
  logger.info(`[TTSWorker][激活] job ${job.id}`);
});

export default ttsWorker;
