import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserByUsername, getUserByEmail, insertUser } from './db.js';
import { sign, verify } from '../utils/token.js';


const router = new Router();

// TODO:level数据库设计


// TODO:注册接口
router.post('/api/users/register', async (ctx) => {
  const { username, email, password, isAdmin = false } = ctx.request.body;

  try {
    // 检查用户和邮箱是否已经存在
    const existingUser = await getUserByUsername(username);
    const existingEmail = await getUserByEmail(email);
    if (existingUser) {
      ctx.status = 400;
      ctx.body = { success: false, message: '用户名已存在' };
      return;
    }
    if (existingEmail) {
      ctx.status = 400;
      ctx.body = { success: false, message: '邮箱已存在' };
      return;
    }

    // 对密码进行加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    // 保存用户到数据库
    const userId = await insertUser(username, email, hashedPassword, isAdmin)
    console.log('成功注册用户：', userId, username, email);
    ctx.status = 201;
    ctx.body = { success: true, message: '注册成功', userId };
  } catch (error) {
    console.error('注册出错：', error);
    ctx.status = 500;
    ctx.body = { success: false, message: '注册失败' };
  }
});


// TODO:登录接口
router.post('/api/users/login', async (ctx) => {
  const { email, password } = ctx.request.body;
  console.log('body:', ctx.request.body);
  console.log('email:', email);
  console.log('password:', password);
  try {
    // TODO: 从数据库中查找用户
    const user = await getUserByEmail(email);
    if(!user) {
      ctx.status = 401;
      ctx.body = { success: false, message: '用户名不存在' };
      return;
    }
    // TODO: 用户存在
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      ctx.status = 401;
      ctx.body = { success: false, message: '密码错误' };
      return;
    }

    // TODO: 生成JWT令牌
    const payload = { userId: user.id, isAdmin: user.is_admin };
    const token = sign(payload);

    ctx.body = { success: true, message: '登录成功', token }
  } catch (error) {
    console.error('登录出错：',error);
    ctx.status = 500;
    ctx.body = { success: false, message: '登录失败' };
  }
})

// TODO:验证用户名或邮箱是否存在接口
router.post('/api/users/check_user_exists', async (ctx) => {
  const { value } = ctx.request.body;

  if (!value) {
    ctx.status = 400;
    ctx.body = { success: 'false', message: '请输入用户名或邮箱' };
    return;
  }

  // 先检查是否是邮箱格式
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  ctx.body = { exists: !!user };
});



export default router;