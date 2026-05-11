declare module "*.vue" {
  import { DefineComponent } from "vue";
  const Component: DefineComponent<{}, {}, any>;
  export default Component;
}

// 环境变量
interface ImportMetaEnv {
  readonly [key: string]: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
  // readonly glob: any;
}
