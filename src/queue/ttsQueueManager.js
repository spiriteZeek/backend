import { Queue, Job } from 'bullmq';
import IORedis from 'ioredis';
import NewsService from '../services/newsService.js';
import logger from '../utils/logger.js';


const connection = new IORedis(); // 默认连接本地Redis（localhost:6379）
const ttsQueue = new Queue('ttsQueue', { connection });

// Redis键前缀
const JOB_KEY_PREFIX = 'tts:job:';

function getJobKey(newsId) {
  return `${JOB_KEY_PREFIX}${newsId}`;
}

// 添加任务并记录jobId映射
export async function enqueueTTSJob(news_id, clientId) {
  logger.info('添加任务', news_id, clientId);
  const existiongJobId = await connection.get(getJobKey(news_id));
  if (existiongJobId) {
    const job = await Job.fromId(ttsQueue, existiongJobId);
    const state = await job?.getState();
    if (state && ['waiting', 'active'].includes(state)) {
      return job; //已存在任务，返回原有job
    }
  }
  const job = await ttsQueue.add('tts', { news_id, clientId });
  logger.info('[Queue] 已添加任务:', job.id)

  await connection.set(getJobKey(news_id), job.id); //写入Redis

  return job;
}


// 根据news_id查询任务状态
export async function getJobStatusByNewsId(news_id) {
  const newsAudio = await NewsService.getTTSStatus(news_id);
  if (newsAudio.status === 'done') return newsAudio;

  const jobId = await connection.get(getJobKey(news_id));
  if (!jobId) return { news_id, status: 'not_found' };

  const job = await Job.fromId(ttsQueue, jobId);
  if (!job) return { news_id, status: 'not_found' };

  const state = await job.getState(); // waiting | active | completed | failed

  return { news_id, status: state };
}