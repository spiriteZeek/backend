export const success = (ctx, data = {}, message = "操作成功", status = 200) => {
  ctx.status = status;
  ctx.body = {
    status: 'success',
    message,
    data,
  };
};

export const failure = (ctx, error, status = 500, message = '服务器错误') => {
  ctx.status = status;
  ctx.body = {
    status: 'error',
    message,
    error: error?.message || error,
  }
}
