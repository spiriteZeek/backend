import { Op } from 'sequelize';
import { News, NewsAudio, NewsCategory, NewsCategoryRel } from '../models/relations.js';
import textToSpeech from './ttsService.js';
import path from 'path';

const root = process.cwd();

// TODO:缓存优化
class NewsService {
  static async createNews(newsData) {
    try {
      const { category_ids = [], ...baseData } = newsData;

      const newNews = await News.create(baseData);              // 1.创建主新闻
      await this._saveNewsCategories(newNews.id, category_ids)  // 2.添加分类关联
      return newNews;
    } catch (error) {
      console.error('数据库中创建新闻失败：', error);
      throw error;
    }
  }

  static async createNewsFromJson(data) {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(item => this._createNewsCore(item)));
    } else {
      return await this._createNewsCore(data);
    }
  }
  
  // 根据ID查询单个新闻
  static async getNewsById(newsId, includeAudio = false) {
    try {
      return await News.findByPk(newsId, {
        include: includeAudio
          ? [{ model: NewsAudio, attributes: ['audio_path'], required: false }]
          : [],
      });
    } catch (error) {
      console.error('数据库中查询新闻失败：', error);
      throw error;
    }
  }
  
  // 创建新闻音频
  static async createNewsAudio(newsId, audioUrl, duration) {
    try {
      return await NewsAudio.create({
        news_id: newsId,
        audio_path: audioUrl,
        duration,
      });
    } catch (error) {
      console.error('数据库中创建语音新闻失败：', error);
      throw error;
    }
  }

  // 获取新闻语音
  static async generateTTS(newsId) {
    try {
      const news = await News.findByPk(newsId);
      if (!news) throw new Error('新闻不存在');

      const content = news.content;
      const saveDir = path.join(root, 'assets/audio')
      const { savePath, duration } = await textToSpeech(content, saveDir);

      return { news, savePath, duration };
    } catch (error) {
      console.error("生成新闻语音失败", error)
    }
  }

  // 获取tts状态
  static async getTTSStatus(news_id) {
    const news = await News.findByPk(news_id);
    if (!news) {
      return { status: 'not_found' };
    }

    const audio = await NewsAudio.findOne({
      where: { news_id },
      attributes: ['audio_path', 'duration', 'created_at']
    });

    if (!audio) {
      return { status: 'pending' };
    }

    return {
      status: 'done',
      url: audio.audio_path,
      duration: audio.duration,
      created_at: audio.created_at
    };
  }

  // 获取所有新闻类别
  static async getAllCategories() {
    try {
      return await NewsCategory.findAll({
        attributes: ['id', 'category_name'],
        order: [['id', 'ASC']]
      })
    } catch (error) {
      console.error('查询所有新闻类别失败')
      throw new Error('Error fetch all categories')
    }
  }

  // 更新新闻内容
  static async updateNews(newsId, updateData) {
    try {
      const { title, content, author, source, is_breaking, category_ids = [] } = updateData;

      // 1.查找并更新主新闻
      const news = await News.findByPk(newsId);
      if (!news) {
        throw new Error('未找到该新闻')
      }
      await news.update({ title, content, author, source, is_breaking });
      await NewsService._saveNewsCategories(newsId, category_ids);

      return news;
    } catch (error) {
      console.error('更新新闻失败：', error);
      throw new Error('Error updating news');
    }
  }
  
  // 根据newsId查询音频url --untest
  static async getNewsAudioByNewsId(newsId) {
    try {
      const audio = await NewsAudio.findOne({
        where: { news_id: newsId },
        attributes: ['audio_path']  // 只查询audio_path字段
      });
      return audio ? audio.audio_path : null;
    } catch (error) {
      console.error('查询新闻音频失败：', error);
      throw new Error('Error fetching audio path');
    }
  }
  
  // 根据newsid关联查询news和newsAudio
  static async getNewsDetailsWithAudio(newsId) {
    try {
      const newsDetails = await News.findOne({
        where: { id: newsId },
        include: [{
          model: NewsAudio,
          attributes: ['audio_path'], // 获取audio_path
          required: false // 设置为false，即使没音频，也返回新闻。
        },
        {
          model: NewsCategoryRel,
          includ: {
            model: NewsCategory,
            attributes: ['id', 'category_name'],
          }
        }]
      });
  
      if (!newsDetails) {
        return null;
      }
  
      // 返回包含新闻和音频的详情
      return {
        title: newsDetails.title,
        content: newsDetails.content,
        publish_date: newsDetails.publish_date,
        category: newsDetails.category,
        audio_path: newsDetails.news_audio ? newsDetails.news_audio.audio_path : null,
      };
    } catch (error) {
      console.error('获取新闻及音频失败', error);
      throw new Error('Error fetching news and audio');
    }
  }
  
  // 批量查询新闻 --untest
  static async getNewsListByIds(newsIds) {
    try {
      const newsList = await News.findAll({
        where: { id: newsIds },
        include: [{
          model: NewsAudio,
          attributes: ['audio_path'],
          required: false,
        },
        {
          model: NewsCategoryRel,
          include: {
            model: NewsCategory,
            attributes: ['id', 'category_name'],
          },
          attributes: ['is_primary', 'source'],
          required: false,
        }]
      });
      
      return newsList.map(news => ({
        id: news.id,
        title: news.title,
        content: news_content,
        publish_date: news.publish_date,
        category: news.category,
        audio_path: news.news_audio ? news.news_audio.audio_path : null,
      }));
    } catch (error) {
      console.error('批量查询新闻失败:', error);
      throw new Error('Error fetching news list');
    }
  }

  // 分页查询（带搜索&事件筛选）
  static async getNewsList({
    page = 1,
    pageSize = 10,
    category_ids = [],
    keyword = '',
    startDate = null,
    endDate = null,
  }) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClause = {};
      
      // 模糊查询 title/content
      if (keyword) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } },
        ];
      }

      // 时间筛选
      if (startDate || endDate) {
        whereClause.publish_date = {};
        if (startDate) {
          whereClause.publish_date[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereClause.publish_date[Op.lte] = new Date(endDate);
        }
      }

      // 主查询 + 多对多分类过滤
      const includeConditions = [
        {
          model: NewsAudio,
          attributes: ['audio_path'],
          required: false,
        },
        {
          model: NewsCategoryRel,
          attributes: ['is_primary', 'source'],
          include: {
            model: NewsCategory,
            as: 'news_category',
            attributes: ['id', 'category_name'],
          },
          required: false,
        }
      ];

      if (category_ids.length > 0) {
        includeConditions[1].where = { 
          category_id: {
            [Op.in]: category_ids,
          } 
        }; // 分类筛选
        includeConditions[1].required = true; // inner join
      }

      const { rows: newsList, count: total } = await News.findAndCountAll({
        where: whereClause,
        include: includeConditions,
        order: [['publish_date', 'DESC']],
        limit: pageSize,
        offset,
      });
      
      const news = newsList.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        author: n.author,
        source: n.source,
        publish_date: n.publish_date,
        is_breaking: n.is_breaking,
        audio_path: n.news_audio?.audio_path || null,
        categories: n.news_category_rels?.map(rel => ({
          id: rel.news_category?.id,
          name: rel.news_category?.category_name,
          is_primary: rel.is_primary,
          source: rel.source,
        })) || []
      }));
      return {
        total,
        page,
        pageSize,
        news,
      };
    } catch (error) {
      console.error('高级新闻查询失败：', error);
      throw new Error('Error fetching advanced news list')
    }
  }

  // 私有逻辑
  // 添加分类关联
  static async _saveNewsCategories(newsId, category_ids = []) {
    await NewsCategoryRel.destroy({ where: { news_id: newsId } });

    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const relations = category_ids.map(categoryId => ({
        news_id: newsId,
        category_id: categoryId,
        is_primary: false,
      }));
      await NewsCategoryRel.bulkCreate(relations);
    }
  }

  // 核心创建新闻逻辑
  static async _createNewsCore({
    title, 
    content, 
    author, 
    source, 
    publish_date = new Date(),
    category_ids = [],
  }) {
    const news = await News.create({title, content, author, source, publish_date});
    await this._saveNewsCategories(news.id, category_ids);
    return news;
  }
}


export default NewsService;