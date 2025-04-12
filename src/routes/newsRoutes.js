import Router from "koa-router";
import { 
  createNewsController, 
  newsTextSpeechController, 
  getNewsDetailsByIdController,
  getNewsListsController,
  updateNewsController,
  getAllCategoriesController,
  getTTSStatusController,
  createNewsFromJsonController,
} from "../controllers/newsController.js";

const newsRouter = new Router({ prefix: '/api/news'});

// 使用新闻控制器处理创建新闻的请求
newsRouter.post('/', createNewsController);
newsRouter.post('/import-json', createNewsFromJsonController);

newsRouter.get('/detail/:news_id', getNewsDetailsByIdController);

// 获取新闻列表（分页，搜索，分类，时间筛选）--untest
newsRouter.get('/', getNewsListsController);

// 获取新闻分类列表
newsRouter.get('/categories', getAllCategoriesController)

// 更新新闻
newsRouter.put('/:id', updateNewsController);

// 新闻语音化接口
newsRouter.post('/tts', newsTextSpeechController);

// 语音任务状态
newsRouter.get('/tts/status/:news_id', getTTSStatusController);

export default newsRouter