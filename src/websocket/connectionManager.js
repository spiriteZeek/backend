import logger from "../utils/logger.js";
// 管理连接池
const clientMap = new Map();  // clientId => ws

// 注册客户端连接
export function registerClient(clientId, ws) {
  const client = getClient(clientId);
  if (client) {
    logger.info(`[WebSocket] 已有clientId: ${clientId}, 注册失败`)
    return
  }
  // 注册新的连接
  clientMap.set(clientId, ws);
  logger.info(`[WebSocket] 注册新的 clientId: ${clientId}`);
}

// 注销客户端连接
export function unregisterClient(ws) {
  for (const [id, socket] of clientMap.entries()) {
    if (socket === ws) {
      clientMap.delete(id);
      logger.info(`[WebSocket] 注销 clientId: ${id}`);
      break;
    }
  }
}

// 获取指定clientId的WebSocket连接
export function getClient(clientId) {
  const client = clientMap.get(clientId);
  if (client) {
    logger.info(`[WebSocket] 获取到 clientId: ${clientId} 对应的连接`);
  } else {
    logger.info(`[WebSocket] 未找到 clientId: ${clientId} 对应的连接`)
  }
  return client;
}

// 清理无效连接
export function cleanupInactiveConnections() {
  for (const [clientId, ws] of clientMap.entries()) {
    if (ws.readyState !== ws.OPEN) {
      clientMap.delete(clientId);
      logger.info(`[WebSocket] 删除无效连接 clientId: ${clientId}`);
    }
  }
}

// 显示所有当前连接
export function showConnections() {
  console.log('展示所有client连接');
  clientMap.forEach((ws, clientId) => {
    logger.info(`[WebSocket] 当前连接 clientId: ${clientId}, 状态: ${ws.readyState}`);
  });
}