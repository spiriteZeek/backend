import Router from 'koa-router'
import newsRouter from './newsRoutes.js'
import adminRouter from './adminRoutes.js';

const router = new Router();

// 合并新闻路由和用户路由
router.use(newsRouter.routes());
router.use(adminRouter.routes());
export default router;