import Pagination from "./Pagination.vue";
import DictTag from "./DictTag.vue";
import FileUpload from "./FileUpload/index.vue";
import RightToolbar from "./RightToolbar/index.vue";

export { Pagination, DictTag, FileUpload, RightToolbar };

/** Globally register all shared components on a Vue app instance */
export function registerSharedComponents(app: any) {
  app.component("Pagination", Pagination);
  app.component("DictTag", DictTag);
  app.component("FileUpload", FileUpload);
  app.component("RightToolbar", RightToolbar);
}
