import Router from 'koa-router';
import { register, login, getCurrentAdmin } from '../controllers/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const adminRouter = new Router({ prefix: '/api/admin',});

adminRouter.post('/register', register);
adminRouter.post('/login', login);
adminRouter.get('/me', verifyToken, getCurrentAdmin);  //需要登录才能访问

export default adminRouter;