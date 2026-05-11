const msgBus = (): IMessageBus => (window as any).__QIANKUN_MSG_BUS__ as IMessageBus;

export default {
  async oss(ossId: string | number) {
    msgBus().emit("m_oss", ossId);
  },
  async zip(url: string, name: string) {
    msgBus().emit("m_zip", { url, name });
  },
  async export(url: string, params: any, fileName?: string) {
    msgBus().emit("m_export", { url, params, fileName });
  },
};
