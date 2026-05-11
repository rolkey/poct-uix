# 共享模块说明

## 调试子模块的方法

- 在debug中选择要调试的模块，然后启动

## Monorepo 配置详解

本项目的 Monorepo 基于 **pnpm workspace**，代码引用采用 **Vite alias 模式**（非 npm publish 模式），版本库用 **git submodule** 隔离团队权限。

---

### 1. 工作空间定义 — `pnpm-workspace.yaml`

```yaml
packages:
  - "packages/*"
```

pnpm 将 `packages/` 下所有子目录视为 workspace 包。`pnpm install` 后，workspace 内的包之间通过 symlink 互相引用，无须发布到 npm registry。

目录结构：

```
packages/
├── shared/      ← @poct/shared (主仓库自有代码)
├── lis/         ← @poct/lis    (submodule → poct-uix-lis.git)
├── person/      ← @poct/person (submodule → poct-uix-person.git)
└── qc/          ← @poct/qc     (submodule → poct-uix-qc.git)
```

---

### 2. 依赖管理 — `.npmrc`

```ini
shamefully-hoist=false
strict-peer-dependencies=false
```

| 配置                             | 作用                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `shamefully-hoist=false`         | pnpm 不提升依赖到根 `node_modules/`，保持严格的依赖隔离。子应用只能访问自己 `package.json` 声明的包              |
| `strict-peer-dependencies=false` | 允许 peerDependencies 未安装时 warning 而非 error。shared 包用 peerDependencies 声明 `vue`、`pinia` 等框架级依赖 |

**为什么不用 `shamefully-hoist=true`**：虽然可以解决所有模块都能访问所有包的问题，但会失去 pnpm 的依赖隔离优势（比如不同模块可以用不同版本的同一个包）。

**shared 的依赖策略**：

```json
{
  "dependencies": {
    "animate.css": "^4.1.1",
    "crypto-js": "^4.2.0",
    "jsencrypt": "^3.5.4",
    "vue-types": "^6.0.0",
    "@vueuse/core": "^14.2.1",
    "@element-plus/icons-vue": "2.3.2"
  },
  "peerDependencies": {
    "element-plus": "^2.11.0",
    "pinia": "^3.0.0",
    "vue": "^3.5.0",
    "vue-router": "^4.6.0",
    "vue-i18n": "^11.0.0"
  }
}
```

- **dependencies**：shared 源码直接 import 的运行时包（如 `crypto-js`），Vite 需要能解析它们
- **peerDependencies**：框架级依赖（`vue`、`pinia` 等），由消费模块提供，保证单例

---

### 3. 包引用方式 — `workspace:*`

子模块 `package.json` 中：

```json
"@poct/shared": "workspace:*"
```

pnpm 看到 `workspace:*` 时不会去 npm registry 查找，而是：

1. 在 workspace 中搜索 name 为 `@poct/shared` 的包
2. 在 `node_modules` 中创建 symlink：`@poct/shared → ../packages/shared`

这样安装后 `import { request } from "@poct/shared"` 直接解析到 `packages/shared/src/index.ts`。

---

### 4. 源码引用 — Vite `resolve.alias`（核心）

这是本项目的关键设计。shared 包不构建成 npm 包，而是通过 Vite alias **直接引用源码**：

```ts
// packages/lis/vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@poct/shared": path.resolve(__dirname, "../shared/src"),
  },
},
```

Vite 构建时，遇到 `import { request } from "@poct/shared"` 会：

```
@poct/shared  →  ../shared/src  →  packages/shared/src/index.ts
              →  index.ts 中 export * from "./utils"
              →  ./utils/index.ts 中 export { default as request } from "./request"
              →  最终 resolve 到 packages/shared/src/utils/request.ts
```

**效果**：

- shared 源码 **直接被打包进** 消费模块的 bundle，没有构建-发布-安装的步骤
- shared 代码修改后，**子应用热更新即时生效**（HMR 工作）
- 调试时可以直接在 shared 源码中设断点

---

### 5. TypeScript 路径映射 — `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@poct/shared": ["../shared/src"],
      "@poct/shared/*": ["../shared/src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/types/**/*.d.ts",
    "../shared/src/**/*.d.ts",
    "../shared/src/**/*.ts"     ← 让 TS 能找到 shared 的类型
  ]
}
```

这样 TypeScript 能在编辑器中正确解析 shared 的导入，提供类型检查和自动补全。

---

### 6. 共享 Barrel 出口 — `shared/src/index.ts`

```ts
// Utils（批量导出）
export * from "./utils";
// Plugins（命名导出）
export { default as plugins } from "./plugins";
export { default as ElementIcons } from "./plugins/svgicon";
// Store
export { default as store } from "./store";
export { useServiceStore } from "./store/modules/services";
// Components
export {
  Pagination,
  DictTag,
  FileUpload,
  RightToolbar,
  registerSharedComponents,
} from "./components";
// i18n, directive, enums, animate...
```

子应用 `main.ts` 从单一路径导入所有共享资源：

```ts
import {
  store,
  plugins,
  i18n,
  directive,
  ElementIcons,
  useDict,
  useServiceStore,
} from "@poct/shared";
```

---

### 7. 版本库隔离 — `.gitmodules`

```ini
[submodule "packages/lis"]
  path = packages/lis
  url = git@github.com:rolkey/poct-uix-lis.git
[submodule "packages/person"]
  path = packages/person
  url = git@github.com:rolkey/poct-uix-person.git
[submodule "packages/qc"]
  path = packages/qc
  url = git@github.com:rolkey/poct-uix-qc.git
```

主仓库 `poct-uix` 管理 shared + 配置 + 子模块引用。每个团队独立操作自己的子模块仓库，互不干扰。

主仓库只记录子模块的 commit SHA：

```
git log --oneline
  7685b69 fix: revert to per-module webRoot
  06196a9 fix: unified webRoot + broader source map path patterns
  754cdf2 chore: per-module debug configs with correct webRoot
  ...       packages/lis  (47fd992)       ← 子模块指向的 commit
  ...       packages/person (0116947)
  ...       packages/qc (6d73cab)
```

---

### 8. 根脚本 — `package.json`

```json
{
  "scripts": {
    "dev": "pnpm run --parallel dev:lis dev:person dev:qc",
    "dev:lis": "pnpm --filter @poct/lis dev",
    "dev:person": "pnpm --filter @poct/person dev",
    "dev:qc": "pnpm --filter @poct/qc dev",
    "build:lis": "pnpm --filter @poct/lis build",
    "build:person": "pnpm --filter @poct/person build",
    "build:qc": "pnpm --filter @poct/qc build"
  }
}
```

`pnpm --filter @poct/lis dev` 等价于进入 `packages/lis/` 执行 `pnpm dev`（即 `vite`）。

---

### 9. 全局组件注册 — `registerSharedComponents`

shared 组件（Pagination、DictTag、FileUpload、RightToolbar）原由各模块的 `unplugin-vue-components` 自动扫描 `src/components/` 注册，搬至 shared 后改为显式注册：

```ts
// shared/src/components/index.ts
export function registerSharedComponents(app: any) {
  app.component("Pagination", Pagination);
  app.component("DictTag", DictTag);
  app.component("FileUpload", FileUpload);
  app.component("RightToolbar", RightToolbar);
}
```

在 `main.ts` 中调用：

```ts
import { registerSharedComponents } from "@poct/shared";
const app = createApp(App);
registerSharedComponents(app);
```

---

### 配置全景示意

```
请求 @poct/shared
    │
    ├── pnpm-workspace.yaml ──→ 识别 packages/*
    ├── .npmrc ──→ shamefully-hoist=false
    │
    ├── packages/lis/package.json ──→ "@poct/shared": "workspace:*"
    ├── packages/lis/vite.config.ts ──→ alias: @poct/shared → ../shared/src
    ├── packages/lis/tsconfig.json ──→ paths: @poct/shared → ../shared/src
    │
    └── packages/shared/src/index.ts ──→ barrel export
                        └── utils/request.ts ──→ 最终代码
```

**关键设计决策**：Vite alias 模式 vs npm publish 模式

| 维度       | Vite alias（本项目）                     | npm publish                       |
| ---------- | ---------------------------------------- | --------------------------------- |
| 修改后生效 | 立即（HMR）                              | 需重新构建 + 发布 + 安装          |
| 调试       | 可直接在 shared 源码设断点               | 需 source map 映射到 node_modules |
| 独立版本   | shared 无独立版本号                      | 每个版本打 tag                    |
| 构建速度   | 共享代码随消费模块一起构建（无额外步骤） | shared 需独立构建                 |

本项目选择 alias 模式，因为三个子应用 shared 代码的同步修改频率高（"经常需要同时调整同个模块的代码"），即时生效和可直接调试的价值大于独立版本化的价值。

---
