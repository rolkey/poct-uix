import { AxiosPromise } from "axios";

const msgBus = (): IMessageBus => (window as any).__QIANKUN_MSG_BUS__ as IMessageBus;

// 构建请求 Promise, 通过调用MsgBus来发送请求
function request<T = any>(options: RequestOptions): AxiosPromise<T> {
  // 生成一个随机数
  const requestId = Math.random().toString(36);
  options.requestId = requestId;
  return new Promise((resolve, reject) => {
    // 定义成功和失败的回调函数
    const successCallback = (res: any) => {
      // 移除监听器
      msgBus().off("c_response_" + requestId, successCallback);
      msgBus().off("c_response_fail_" + requestId, failCallback);
      resolve(res);
    };

    const failCallback = (res: any) => {
      // 移除监听器
      msgBus().off("c_response_" + requestId, successCallback);
      msgBus().off("c_response_fail_" + requestId, failCallback);
      reject(res);
    };

    // 注册监听器
    msgBus().on("c_response_" + requestId, successCallback);
    msgBus().on("c_response_fail_" + requestId, failCallback);
    msgBus().emit("m_request", options);
  });
}

export default request;
