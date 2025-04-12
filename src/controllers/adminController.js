import adminService from '../services/adminService.js';
import { failure, success } from '../utils/responseHelper.js';

const register = async (ctx) => {
  const { username, password } = ctx.request.body;
  try{
    await adminService.registerAdmin(username, password);
    success(ctx, {status: 'success'}, 'Admin registered successfully');
  } catch (error) {
    failure(ctx, error, 400, error?.message);
  }
}

const login = async (ctx) => {
  const { username, password } = ctx.request.body;
  try {
    const result = await adminService.loginAdmin(username, password);
    success(ctx, result, '登录成功');
  } catch (error) {
    failure(ctx, error, 401, error.message || '登录失败');
  }
};

const getCurrentAdmin = async (ctx) => {
  const { admin_id, username, roles } = ctx.admin;

  ctx.body = {
    status: 'success',
    data: {
      admin_id,
      username,
      roles,
    },
  };
};

export {
  register,
  login,
  getCurrentAdmin
}