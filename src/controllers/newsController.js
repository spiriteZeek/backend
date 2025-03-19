import { createNews, getNewsById } from "../services/newsService.js";
import { createNewsAudioInDB } from "../dal/newsDal.js";
import testToSpeechService from "../services/ttsService.js";
import GitUploader from "../utils/gitUploader.js";
import { GITHUB_CONFIG } from "../../config/config.js";
import path from "path";
import textToSpeechService from "../services/ttsService.js";

const Root = process.cwd();

const gitUploader = new GitUploader(
  Root,
  GITHUB_CONFIG.REPO_URL,
  GITHUB_CONFIG.BRANCH
);

// 新建新闻
const createNewsController = async (ctx) => {
  const newsData = ctx.request.body;
  try {
    const newNews = await createNews(newsData);
    ctx.status = 201;
    ctx.body = {
      message: "新闻创建成功",
      news: newNews,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "创建新闻时发生错误",
      error: error.message,
    };
  }
};

// 新闻语音化
const newsTextSpeechController = async (ctx) => {
  const { news_id } = ctx.request.body;
  try {
    const news = await getNewsById(news_id);
    if (!news) {
      ctx.status = 404;
      ctx.body = {
        message: "为找到该新闻",
      };
      return;
    }
    const newsContent = news.content;
    const saveDir = path.join(Root, "assets/audio");
    const { savePath, duration } = await textToSpeechService(
      newsContent,
      saveDir
    );

    const githubUrl = await gitUploader.uploadFile(savePath);
    // const newsAudioData = {}
    console.log('githubUrl:', githubUrl);
    await createNewsAudioInDB(news_id, githubUrl, duration)
    ctx.status = 200;
    ctx.body = {
      status: "success",
      message: "Text to speech successfully",
      url: githubUrl,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "新闻语音化时发生错误",
      error: error.message,
    };
  }
};

// 查询新闻控制器
const getNewsByIdController = async (ctx) => {
  const { news_id } = ctx.params;
  try {
    const news = await getNewsById(news_id);
    if (!news) {
      ctx.status = 404;
      ctx.body = {
        message: "未找到该新闻",
      };
    } else {
      ctx.status = 200;
      ctx.body = {
        message: "新闻查询成功",
        news: news,
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "查询新闻时发生错误",
      error: error.message,
    };
  }
};

export {
  createNewsController,
  newsTextSpeechController,
  getNewsByIdController,
};
