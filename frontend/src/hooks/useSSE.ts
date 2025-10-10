/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-27
 * @Description: 统一的SSE连接管理
 */
import type { SSEMessageData } from '@/api/system/notificationManage/types';
import { getApiUrl } from '@/utils/tool';

/**
 * SSE连接状态
 */
export enum SSEStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

// 全局SSE实例
let sseInstance: EventSource | null = null;
let isInitialized = false;

/**
 * 统一的SSE连接管理
 */
export function useSSE() {
  const accountStore = useAccountStore();

  /**
   * 连接状态
   */
  const status = ref<SSEStatus>(SSEStatus.DISCONNECTED);

  /**
   * 初始化SSE连接（全局只调用一次）
   */
  const initSSE = async () => {
    if (isInitialized || sseInstance) {
      console.log('SSE连接已初始化');
      return;
    }

    if (!accountStore.accessToken) {
      console.warn('用户未登录，无法建立SSE连接');
      return;
    }

    status.value = SSEStatus.CONNECTING;

    try {
      const sseUrl = getApiUrl(RequestPath.NOTIFICATION_CONNECT);

      // 使用 fetch 建立SSE连接
      const response = await fetch(sseUrl, {
        credentials: 'include',
        headers: {
          Accept: 'text/event-stream',
          Authorization: accountStore.accessToken,
          'Cache-Control': 'no-cache',
        },
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      // 连接成功
      status.value = SSEStatus.CONNECTED;
      isInitialized = true;

      console.log('SSE连接已建立');

      // 读取流数据
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('SSE连接已关闭');
              status.value = SSEStatus.DISCONNECTED;
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data.trim()) {
                  try {
                    const parsedData: SSEMessageData = JSON.parse(data);
                    handleMessage(parsedData);
                  } catch (error) {
                    console.error('解析SSE消息失败:', error);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('读取SSE流失败:', error);
          status.value = SSEStatus.ERROR;
        }
      };

      processStream();

      // 创建模拟的EventSource实例
      sseInstance = {
        CLOSED: 2,
        CONNECTING: 0,
        OPEN: 1,
        addEventListener: () => {},
        close: () => reader.cancel(),
        dispatchEvent: () => true,
        onerror: null,
        onmessage: null,
        onopen: null,
        readyState: 1,
        removeEventListener: () => {},
        url: sseUrl,
        withCredentials: false,
      } as unknown as EventSource;
    } catch (error) {
      console.error('创建SSE连接失败:', error);
      status.value = SSEStatus.ERROR;
    }
  };

  /**
   * 统一的消息处理函数
   */
  const handleMessage = (data: SSEMessageData) => {
    switch (data.type) {
      case 'connected':
        console.log('SSE连接确认:', data.message);
        break;

      case 'heartbeat':
        // 心跳消息，无需处理
        break;

      case 'notification':
        if (data.data) {
          // 分发通知事件
          window.dispatchEvent(
            new CustomEvent(ListenerEventEnum.NEW_NOTIFICATION, {
              detail: data.data,
            })
          );
        }
        break;

      default:
        console.log('未知SSE消息类型:', data);
        break;
    }
  };

  /**
   * 断开SSE连接
   */
  const disconnect = () => {
    if (sseInstance) {
      sseInstance.close();
      sseInstance = null;
      isInitialized = false;
      status.value = SSEStatus.DISCONNECTED;
      console.log('SSE连接已断开');
    }
  };

  /**
   * 监听特定类型的事件
   */
  const onEvent = (eventType: string, callback: (data: any) => void) => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      callback(customEvent.detail);
    };

    window.addEventListener(eventType, handler);

    // 返回清理函数
    return () => {
      window.removeEventListener(eventType, handler);
    };
  };

  /**
   * 组件卸载时断开连接
   */
  onUnmounted(() => {
    // 注意：这里不应该断开全局连接，只在App.vue中控制
  });

  return {
    disconnect,
    initSSE,
    isInitialized: readonly(ref(isInitialized)),
    onEvent,
    status: readonly(status),
  };
}
