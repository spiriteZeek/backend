import { News, NewsAudio } from '../models/relations.js';

async function createNewsInDB(newsData) {
  try {
    const newNews = await News.create(newsData);
    return newNews;
  } catch (error) {
    console.error('数据库中创建新闻失败：', error);
    throw error;
  }
}

async function getNewsByIdFromDB(newsId) {
  try {
    const news = await News.findByPk(newsId);
    return news;
  } catch (error) {
    console.error('数据库中查询新闻失败：', error);
    throw error;
  }
}

async function createNewsAudioInDB(newsId, audioUrl, duration) {
  try {
    const newNewsAudio = await NewsAudio.create({
      news_id: newsId,
      audio_path: audioUrl,
      duration: duration,
    });
    return newNewsAudio;
  } catch (error) {
    console.error('数据库中创建语音新闻失败：', error);
    throw error;
  }
}

export {
  createNewsInDB,
  getNewsByIdFromDB,
  createNewsAudioInDB,
}