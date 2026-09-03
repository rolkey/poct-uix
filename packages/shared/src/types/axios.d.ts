export {};
declare module 'axios' {
  // 泛型参数需与 axios 1.x 声明完全一致(H 为响应头泛型),否则接口合并失效
  interface AxiosResponse<T = any, D = any, H = {}> {
    code: number;
    msg: string;
    rows: T;
    total: number;
  }
}
