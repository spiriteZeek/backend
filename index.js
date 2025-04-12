import Koa from 'koa';
import http from 'http';
import cors from '@koa/cors'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const koaBody = require('koa-body').default;

import router from './src/routes/index.js'
import { initWebSocket } from './src/websocket/index.js';
const app = new Koa()

app.use(cors());
// 使用中间件解析请求体
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 10 * 1024 * 1024, // 10MB，防止过大
  }
}));

// 主要路由
app.use(router.routes());
app.use(router.allowedMethods());

const server = http.createServer(app.callback());
initWebSocket(server);
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

