// Utils
export * from "./utils";

// Plugins
export { default as sharedPlugins } from "./plugins";
export { default as svgicon } from "./plugins/svgicon";
// Short aliases for submodule main.ts imports
export { default as plugins } from "./plugins";
export { default as ElementIcons } from "./plugins/svgicon";
export { default as modal } from "./plugins/modal";

// Store
export { default as createSharedStore } from "./store";
export { default as store } from "./store";
export { useServiceStore } from "./store/modules/services";
export { useDictStore } from "./store/modules/dict";

// Enums
export * from "./enums";

// i18n
export { default as i18n, getLanguage } from "./lang";

// Directives
export { default as directive } from "./directive";

// Components
export { Pagination, DictTag, FileUpload, RightToolbar, registerSharedComponents } from "./components";

// Animate
export { default as animate } from "./animate";
