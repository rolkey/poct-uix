<template>
  <div ref="selectContainerRef" class="custom-select-wrapper">
    <el-select
      v-model="selectVal"
      filterable
      remote
      ref="selectRef"
      :placeholder="props.placeholder"
      remote-show-suffix
      v-select-all-on-focus
      :disabled="props.readonly"
      default-first-option
      :clearable="props.clearable"
      :remote-method="remoteMethod"
      :loading="loading"
      popper-class="my-table-select-popper"
      :popper-container="selectContainerRef"
      @change="handleChange"
      @keyup.enter.prevent="handleEnter"
      @visibleChange="handVisibleChange"
    >
      <template #header>
        <slot name="header-content" />
        <div class="table-container" :style="tableContainerStyle">
          <div class="fixed-columns">
            <div
              v-for="field in props.queryFields.slice(0, 2)"
              :key="field.fieldName"
              :style="{ width: field.width + 'px' }"
              class="header-cell"
            >
              {{ field.title }}
            </div>
          </div>
          <div
            class="scrollable-columns"
            :style="{ ...scrollableColumnsStyle, transform: `translateX(-${scrollLeft}px)` }"
          >
            <div
              v-for="field in props.queryFields.slice(2)"
              :key="field.fieldName"
              :style="{ width: field.width + 'px' }"
              class="header-cell"
            >
              {{ field.title }}
            </div>
          </div>
        </div>
      </template>
      <el-option
        v-for="item in selectOptionList"
        :key="item[props.valueField]"
        :label="item[props.labelField]"
        :value="item[props.valueField]"
      >
        <div class="table-container" :style="tableContainerStyle">
          <div class="fixed-columns">
            <div
              v-for="field in props.queryFields.slice(0, 2)"
              :key="field.fieldName"
              :style="{ width: field.width + 'px' }"
              class="data-cell"
            >
              {{ item[field.fieldName] }}
            </div>
          </div>
          <div
            class="scrollable-columns"
            :style="{ ...scrollableColumnsStyle, transform: `translateX(-${scrollLeft}px)` }"
          >
            <div
              v-for="field in props.queryFields.slice(2)"
              :key="field.fieldName"
              :style="{ width: field.width + 'px' }"
              class="data-cell"
            >
              {{ item[field.fieldName] }}
            </div>
          </div>
        </div>
      </el-option>
      <template #footer>
        <div
          class="table-container"
          :style="{ ...tableContainerStyle, transform: 'translate(-4px, -6px)' }"
        >
          <div class="fixed-columns">
            <div
              v-for="field in props.queryFields.slice(0, 2)"
              :key="field.fieldName"
              :style="{ width: field.width + 'px' }"
            ></div>
          </div>
          <div id="scollable-div" :style="scrollableColumnsStyle" @scroll="syncScroll">
            <div
              v-for="field in props.queryFields.slice(2)"
              :key="field.fieldName"
              :style="{ width: field.width + 'px' }"
              class="data-cell"
            ></div>
          </div>
        </div>
        <div class="flex">
          <slot name="footer-content" />
          <pagination
            :total="rowTotal"
            class="flex-1"
            layout="total, prev, pager, next"
            :background="false"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </div>
      </template>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElSelect } from "element-plus";
import pagination from "../Pagination.vue";
import type { AutoInputProps, AutoInputQueryParams, AutoInputRow } from "./types";

const selectContainerRef = ref<HTMLElement>();

// 局部指令:聚焦时自动全选输入框文本(focusin 冒泡,可捕获 el-select 内部 input)
function handleFocusSelectAll(event: FocusEvent) {
  const target = event.target as HTMLElement;
  const input = target instanceof HTMLInputElement ? target : target.querySelector("input");
  input?.select();
}

const vSelectAllOnFocus = {
  mounted(el: HTMLElement) {
    el.addEventListener("focusin", handleFocusSelectAll);
  },
  unmounted(el: HTMLElement) {
    el.removeEventListener("focusin", handleFocusSelectAll);
  },
};

const props = withDefaults(defineProps<AutoInputProps>(), {
  selectRow: () => ({}),
  labelField: "",
  valueField: "",
  placeholder: "请选择",
  queryApi: async () => ({ pageData: [], total: 0 }),
  queryFields: () => [],
  clearable: false,
  readonly: false,
});

// 计算表格容器样式
const tableContainerStyle = computed(() => {
  return props.tableWidth ? { width: props.tableWidth + "px" } : {};
});

// 计算滚动列的样式
const scrollableColumnsStyle = computed(() => {
  const fixedColumnsWidth = props.queryFields
    .slice(0, 2)
    .reduce((sum, field) => sum + field.width, 0);
  const containerWidth = props.tableWidth || 100; // 如果没有设置tableWidth，使用默认值800px
  return {
    width: containerWidth - fixedColumnsWidth + "px",
  };
});

const emit = defineEmits<{
  "update:selectRow": [row?: AutoInputRow];
  "update:handVisibleChange": [visible?: boolean];
  handleEnter: [event: KeyboardEvent];
  /** 选中行提交(携带完整行数据;清空/未匹配时为 undefined) */
  select: [row?: AutoInputRow];
}>();

const selectVal = ref("");
const scrollLeft = ref(0);
const selectRef = ref<ElSelectInstance>();
const inputRef = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const selectOptionList = ref<AutoInputRow[]>([]);
const rowTotal = ref(0);
const queryParams = reactive<AutoInputQueryParams>({
  pageNum: 1,
  pageSize: 10,
  value: undefined,
});

// Enter 提交与 el-select 的 change 在同一时刻会各触发一次 handleChange,
// 用上一次提交的行做去重,保证 select 事件每次都只发一次
const noSelection: unique symbol = Symbol("noSelection");
let lastSelectedRow: AutoInputRow | undefined | typeof noSelection = noSelection;

function handleChange(val: string) {
  const selectRow = selectOptionList.value.find((item) => item[props.valueField] === val);
  if (selectRow === lastSelectedRow) return;
  lastSelectedRow = selectRow;

  emit("update:selectRow", selectRow);
  emit("select", selectRow);
}

const getList = async () => {
  const { pageData, total } = await props.queryApi(queryParams);
  if (typeof pageData !== "undefined" && !Array.isArray(pageData)) {
    console.error("类型不正确！", pageData);
    throw new Error("getList 类型不正确！");
  }
  selectOptionList.value = pageData || [];
  rowTotal.value = total;
};

const remoteMethod = (query: string) => {
  queryParams.value = query;
  queryParams.pageNum = 1;
  getList();
};

const handleEnter = (event: KeyboardEvent) => {
  emit("handleEnter", event);
  if (selectVal.value?.trim()) {
    handleChange(selectVal.value);
  }
};

const handVisibleChange = (value: boolean) => {
  emit("update:handVisibleChange", value);
};

/**
 * 用于解决没进行下拉时，显示原始值的问题
 *
 * @param dataRow
 */
const updateValue = (dataRow: AutoInputRow) => {
  setTimeout(() => {
    selectOptionList.value = [dataRow];
    selectVal.value = dataRow[props.valueField];
  }, 100);
};

function syncScroll(event: Event) {
  scrollLeft.value = (event.target as HTMLElement).scrollLeft;
}

function refreshData() {
  getList();
}

defineExpose({
  updateValue,
  refreshData,
});
</script>

<style scoped>
.custom-select-wrapper {
  width: 100%;
}
.custom-select-wrapper :deep(.el-select) {
  width: 100%;
}
/* ==========================================
   1. 组件基础样式 (Table & Scroll Header/Body)
   ========================================== */

/* 基础表格容器 */
.table-container {
  display: flex;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: transparent; /* 改为透明 */
}

/* 固定列区域 */
.fixed-columns {
  display: flex;
  position: sticky;
  left: 0;
  z-index: 2;
  flex-shrink: 0;
  background-color: transparent; /* 改为透明，跟随父级 item 高亮 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
}

/* 滚动列区域 */
.scrollable-columns {
  display: flex;
  flex: 1;
  background-color: transparent; /* 改为透明 */
}

/* 表头单元格 */
.header-cell {
  background-color: var(--el-table-header-bg-color, #f5f7fa) !important;
  border-bottom: 1px solid var(--el-table-border-color, #ebeef5) !important;
  border-right: 1px solid var(--el-table-border-color, #ebeef5) !important;
  padding: 4px 12px !important;
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 14px;
  height: 36px;
  line-height: 24px;
  box-sizing: border-box;
  flex-shrink: 0;
  text-align: left;
}

/* 数据单元格 */
.data-cell {
  padding: 4px 12px !important;
  border-bottom: 1px solid var(--el-table-border-color, #ebeef5) !important;
  border-right: 1px solid var(--el-table-border-color, #ebeef5) !important;
  height: 36px;
  line-height: 24px;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: var(--el-text-color-regular);
  background-color: transparent !important; /* 关键改动：移除 #fff，允许父级 hover/select 背景透出 */
}

/* 移除最后一列边框 */
.header-cell:last-child,
.data-cell:last-child {
  border-right: none !important;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown) {
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

:deep(.el-select-dropdown__wrap) {
  max-height: 360px;
}

/* 滚动条美化 */
#scollable-div::-webkit-scrollbar {
  height: 6px;
}

#scollable-div::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

#scollable-div::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

#scollable-div::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

/* footer中的占位单元格 */
#scollable-div .data-cell {
  height: 1px;
  border: none;
  padding: 0 !important;
}

/* ==========================================
   2. 下拉弹窗样式重写 (通过 :deep 穿透指定 Class)
   ========================================== */

/* 下拉面板外框边框与阴影 */
:deep(.my-table-select-popper.el-popper) {
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

/* 下拉菜单最大高度 */
:deep(.my-table-select-popper .el-select-dropdown__wrap) {
  max-height: 360px;
}

/* 下拉选项与列表默认内边距清除 */
:deep(.my-table-select-popper .el-select-dropdown__item) {
  padding: 0 !important;
  height: auto !important;
}

:deep(.my-table-select-popper .el-select-dropdown__wrap .el-select-dropdown__list) {
  padding: 0 !important;
}

/* Hover 与 选中态颜色重载 */
:deep(.my-table-select-popper .el-select-dropdown__item:hover) {
  background-color: var(--el-table-row-hover-bg-color, #f5f7fa) !important;
}

:deep(.my-table-select-popper .el-select-dropdown__item.is-selected) {
  background-color: var(--el-color-primary-light-9, #ecf5ff) !important;
  color: var(--el-color-primary, #b1b7ed) !important;
}

/* 关键修复：让自定义表格单元格背景透明，继承下拉项的背景色 */
:deep(.my-table-select-popper .el-select-dropdown__item .table-container),
:deep(.my-table-select-popper .el-select-dropdown__item .fixed-columns),
:deep(.my-table-select-popper .el-select-dropdown__item .scrollable-columns),
:deep(.my-table-select-popper .el-select-dropdown__item .data-cell) {
  background-color: transparent !important;
}
</style>

<!-- <style>
/* 不使用 scoped，直接全局覆盖 */
.el-select-dropdown__item {
  padding: 0 !important;
  height: auto !important;
}
.el-select-dropdown__wrap .el-select-dropdown__list {
  padding: 0 !important;
}

.el-select-dropdown__item:hover {
  background-color: var(--el-table-row-hover-bg-color, #f5f7fa) !important;
}

.el-select-dropdown__item.is-selected {
  background-color: var(--el-color-primary-light-9, #ecf5ff) !important;
  color: var(--el-color-primary, #b1b7ed) !important;
}

/* ===== 关键修复：让内部元素背景透明 ===== */
.el-select-dropdown__item .table-container,
.el-select-dropdown__item .fixed-columns,
.el-select-dropdown__item .scrollable-columns {
  background-color: transparent !important;
}

.el-select-dropdown__item .data-cell {
  background-color: transparent !important;
}
</style> -->
