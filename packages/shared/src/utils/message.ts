const msgBus = (): IMessageBus => (window as any).__QIANKUN_MSG_BUS__ as IMessageBus;

// 1. 定义一个辅助类型，用于存储 Promise 的 resolve 函数
export type ResolveFunction<T> = (value: T) => void;

// 2. 存储正在进行的请求 { requestId: resolve }
export const pendingRequests = new Map<string, ResolveFunction<any>>();

// 3. 辅助函数：生成唯一ID
export const generateId = (): string => Math.random().toString(36).substring(2, 15);

// 1. 定义事件类型
// 这里定义了你的业务事件名和对应的数据结构
type Events = {
  // 请求事件：发送数据
  "m_getSessionCache": { key: string; requestId: string };
  // 响应事件：返回数据
  "m_getSessionCache_response": { requestId: string; data: any; error?: any };

  // 你可以在这里添加更多事件对...
  // 'm_setSessionCache': { key: string; value: any; requestId: string };
  // 'm_setSessionCache_response': { requestId: string; success: boolean };
};

/**
 * 3. 封装通用的请求函数
 * @param emitEvent 发送的事件名
 * @param onEventName 监听的响应事件名
 * @param payload 发送的数据
 */
export async function requestViaMitt<T = any>(
  emitEvent: string,
  onEventName: string,
  payload: any,
): Promise<any> {
  return new Promise((resolve, reject) => {
    // 生成唯一ID
    const requestId = Math.random().toString(36).substring(2, 15);

    // 定义超时定时器（可选，防止请求挂起）
    const timer = setTimeout(() => {
      off(); // 最重要的：超时必须移除监听，防止内存泄漏
      reject(new Error(`Request timeout: ${String(emitEvent)}`));
    }, 5000);

    // 定义响应处理函数
    const handler = (res: any) => {
      // 严格匹配 requestId
      if (res.requestId === requestId) {
        off(); // 收到响应后，立即移除监听
        clearTimeout(timer); // 清除定时器

        if (res.error) {
          reject(res.error);
        } else {
          resolve(res.data);
        }
      }
    };

    // 注册监听
    // 注意：mitt 的 on 返回一个 off 函数，或者我们可以手动调用 emitter.off
    const off = () => {
      msgBus().off(onEventName, handler);
    };

    // 开始监听
    msgBus().on(onEventName, handler);

    // 发送请求
    // 注意：这里我们手动把 requestId 合并进 payload
    msgBus().emit(emitEvent, { ...payload, requestId });
  });
}
