import { WebSocketServer } from "ws";
import { getClient, registerClient, unregisterClient } from "./connectionManager.js";
import logger from "../utils/logger.js";
import Redis from "ioredis";

// 创建Redis连接
const redis = new Redis();
export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        const { clientId } = data;

        if (clientId) {
          registerClient(clientId, ws);   // 注册WebSocket连接
          console.log(`[WebSocket] 已注册 clientId=${clientId}`);
        }
      } catch (err) {
        console.err(`[WebSocket] 非法消息:`, data)
      }

      ws.on('close', () => {
        unregisterClient(ws);   // 注销WebSocket连接
        console.log(`[WebSocket] 客户端断开连接`)
      });
    });
  });

  // 订阅Redis频道以接收任务状态更新
  redis.subscribe('tts_status_channel', (err, count) => {
    if (err) {
      logger.error('订阅Redis频道失败:', err);
    } else {
      logger.info('已订阅tts_status_channel频道')
    }
  });

  // 监听Redis频道消息并推送到前端
  redis.on('message', (channel, message) => {
    if (channel === 'tts_status_channel') {
      const { clientId, jobId, news_id, status, message: msg, timestamp } = JSON.parse(message);
      logger.info(`[WebSocket] 发送任务状态给 clientId=${clientId}, 状态=${status}`)

      const socket = getClient(clientId);   // 从连接池获取WebSocket连接
      if (socket && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({ jobId, news_id, status, message: msg, timestamp }));   // 推送信息
        logger.info(`[WebSocket] 向clientId=${clientId} 发送状态更新`)
      } else {
        logger.warn(`[WebSocket] clientId=${clientId} 没有连接或已关闭`)
      }
    }
  })

  logger.info('[WebSocket] 服务已启动')
}