import { requestViaMitt } from "../utils/message";

const msgBus = (): IMessageBus => (window as any).__QIANKUN_MSG_BUS__ as IMessageBus;

const sessionCache = {
  set(key: string, value: any) {
    msgBus().emit("m_setSessionCache", { key, value });
  },
  async get(key: string): Promise<any> {
    return await requestViaMitt("m_getSessionCache", "m_getSessionCache_response", { key });
  },
  setJSON(key: string, jsonValue: any) {
    msgBus().emit("m_setSessionCache", { key, value: JSON.stringify(jsonValue) });
  },
  getJSON(key: string) {
    return this.get(key).then((res) => {
      if (res != null) {
        return JSON.parse(res);
      }
      return null;
    });
  },
  remove(key: string) {
    msgBus().emit("m_removeSessionCache", { key });
  },
};
const localCache = {
  set(key: string, value: any) {
    if (!localStorage) {
      return;
    }
    if (key != null && value != null) {
      localStorage.setItem(key, value);
    }
  },
  get(key: string) {
    if (!localStorage) {
      return null;
    }
    if (key == null) {
      return null;
    }
    return localStorage.getItem(key);
  },
  setJSON(key: string, jsonValue: any) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue));
    }
  },
  getJSON(key: string) {
    const value = this.get(key);
    if (value != null) {
      return JSON.parse(value);
    }
    return null;
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

export default {
  /**
   * 会话级缓存
   */
  session: sessionCache,
  /**
   * 本地缓存
   */
  local: localCache,
};
