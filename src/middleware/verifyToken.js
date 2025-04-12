import { verify } from '../utils/token.js'


export const verifyToken = async (ctx, next) => {
  const authHeader = ctx.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401
    ctx.body = { 
      status: 'error',
      message: '请提供有效的身份令牌 (Bearer Token)' 
    }
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verify(token)
    ctx.admin = decoded  // 可用于后续接口拿userId
    await next()
  } catch (err) {
    ctx.status = 401
    ctx.body = { message: 'token无效或已过期'}
  }
}