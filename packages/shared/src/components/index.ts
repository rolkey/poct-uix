export { default as Pagination } from "./Pagination.vue";
export { default as DictTag } from "./DictTag.vue";
export { default as FileUpload } from "./FileUpload/index.vue";
export { default as RightToolbar } from "./RightToolbar/index.vue";

/** Globally register all shared components on a Vue app instance */
export function registerSharedComponents(app: any) {
  app.component("Pagination", Pagination);
  app.component("DictTag", DictTag);
  app.component("FileUpload", FileUpload);
  app.component("RightToolbar", RightToolbar);
}
