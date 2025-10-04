/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: SSE消息推送服务
 */
import { Response } from "express";

interface SSEClient {
  id: string;
  response: Response;
  userUuid: string;
}

class SSEService {
  private clients: Map<string, SSEClient> = new Map();

  // 添加客户端连接
  addClient(userUuid: string, response: Response): string {
    const clientId = `${userUuid}_${Date.now()}`;
    
    // 设置SSE响应头
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // 发送初始连接消息
    response.write(`data: ${JSON.stringify({ type: 'connected', message: '连接成功' })}\n\n`);

    const client: SSEClient = {
      id: clientId,
      response,
      userUuid,
    };

    this.clients.set(clientId, client);

    // 处理客户端断开连接
    response.on('close', () => {
      this.removeClient(clientId);
    });

    // 定期发送心跳包
    const heartbeat = setInterval(() => {
      if (this.clients.has(clientId)) {
        try {
          response.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          console.log('心跳发送失败，移除客户端:', clientId);
          clearInterval(heartbeat);
          this.removeClient(clientId);
        }
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // 30秒心跳

    console.log(`SSE客户端连接: ${clientId}, 用户: ${userUuid}`);
    return clientId;
  }

  // 移除客户端连接
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.response.end();
      } catch (error) {
        console.log('关闭客户端连接异常:', error);
      }
      this.clients.delete(clientId);
      console.log(`SSE客户端断开: ${clientId}`);
    }
  }

  // 发送消息给特定用户
  sendToUser(userUuid: string, data: any): boolean {
    const userClients = Array.from(this.clients.values()).filter(
      client => client.userUuid === userUuid
    );

    if (userClients.length === 0) {
      console.log(`用户 ${userUuid} 没有活跃的SSE连接`);
      return false;
    }

    userClients.forEach(client => {
      try {
        client.response.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.log(`发送消息失败，移除客户端: ${client.id}`, error);
        this.removeClient(client.id);
      }
    });

    return true;
  }

  // 广播消息给所有用户
  broadcast(data: any): void {
    const deadClients: string[] = [];
    
    this.clients.forEach((client) => {
      try {
        client.response.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.log(`广播消息失败，标记移除客户端: ${client.id}`, error);
        deadClients.push(client.id);
      }
    });

    // 移除失效的客户端
    deadClients.forEach(clientId => {
      this.removeClient(clientId);
    });
  }

  // 获取在线用户数量
  getOnlineUsersCount(): number {
    const uniqueUsers = new Set(Array.from(this.clients.values()).map(client => client.userUuid));
    return uniqueUsers.size;
  }

  // 获取特定用户的连接数
  getUserConnectionsCount(userUuid: string): number {
    return Array.from(this.clients.values()).filter(
      client => client.userUuid === userUuid
    ).length;
  }

  // 获取所有在线用户UUID
  getOnlineUsers(): string[] {
    const uniqueUsers = new Set(Array.from(this.clients.values()).map(client => client.userUuid));
    return Array.from(uniqueUsers);
  }
}

// 导出单例实例
export const sseService = new SSEService();