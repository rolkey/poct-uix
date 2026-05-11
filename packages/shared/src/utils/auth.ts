import { useStorage } from "@vueuse/core";

const TokenKey = "Admin-Token";
const msgBus = (): IMessageBus => (window as any).__QIANKUN_MSG_BUS__ as IMessageBus;

const tokenStorage = useStorage<null | string>(TokenKey, null);

// export const getToken = () => tokenStorage.value;
export const getToken = () => msgBus().getToken();

export const setToken = (access_token: string) => (tokenStorage.value = access_token);

export const removeToken = () => (tokenStorage.value = null);
