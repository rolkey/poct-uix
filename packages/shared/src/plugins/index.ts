import modal from "./modal";
// 预设动画
import animate from "../animate";
import download from "./download";

export default {
  install(app: any) {
    // 插件配置

    app.config.globalProperties.$modal = modal;
    app.config.globalProperties.animate = animate;
    app.config.globalProperties.$download = download;
  },
};
