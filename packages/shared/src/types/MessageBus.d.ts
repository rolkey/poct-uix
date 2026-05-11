// 首先定义接口
interface IMessageBus extends Emitter<MessageBusEvents> {
  apiPath: string;
  download: (url: string, params?: any, filename?: string) => void;
  useAppStore: () => any;
  useUserStore: () => any;
  usePermissionStore: () => any;
  useDictStore: () => any;
  settingsStore: () => any;
  getToken: () => string | null;
  globalHeaders: () => any;

  all: Map<keyof MessageBusEvents, any[]>;
  on(type: string, handler: any): this;
  off(type: string, handler: any): this;
  emit(type: string, data?: any): this;
}
