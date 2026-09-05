<template>
  <div style="width: 100%; display: block">
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
      :fit-input-width="false"
      popper-class="my-table-select-popper"
      style="width: 100%"
      @change="handleChange"
      @keyup.enter.prevent="handleEnter"
      @visibleChange="handVisibleChange"
    >
      <!-- 表头 -->
      <template #header>
        <slot name="header-content" />
        <div class="table-container" :style="tableContainerStyle">
          <div
            class="fixed-columns"
            style="
              display: flex !important;
              flex-direction: row !important;
              position: sticky;
              left: 0;
              z-index: 2;
              flex-shrink: 0;
              background-color: transparent !important;
            "
          >
            <div
              v-for="field in props.queryFields.slice(0, 2)"
              :key="field.fieldName"
              :style="{
                width: field.width + 'px',
                height: '36px',
                lineHeight: '28px',
                padding: '4px 12px',
                boxSizing: 'border-box',
                flexShrink: 0,
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--el-text-color-primary)',
                backgroundColor: 'var(--el-table-header-bg-color, #f5f7fa)',
                borderBottom: '1px solid var(--el-table-border-color, #ebeef5)',
                borderRight: '1px solid var(--el-table-border-color, #ebeef5)',
              }"
            >
              {{ field.title }}
            </div>
          </div>
          <div
            class="scrollable-columns"
            :style="{
              ...scrollableColumnsStyle,
              transform: `translateX(-${scrollLeft}px)`,
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              backgroundColor: 'transparent',
            }"
          >
            <div
              v-for="field in props.queryFields.slice(2)"
              :key="field.fieldName"
              :style="{
                width: field.width + 'px',
                height: '36px',
                lineHeight: '28px',
                padding: '4px 12px',
                boxSizing: 'border-box',
                flexShrink: 0,
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--el-text-color-primary)',
                backgroundColor: 'var(--el-table-header-bg-color, #f5f7fa)',
                borderBottom: '1px solid var(--el-table-border-color, #ebeef5)',
                borderRight: '1px solid var(--el-table-border-color, #ebeef5)',
              }"
            >
              {{ field.title }}
            </div>
          </div>
        </div>
      </template>

      <!-- 数据行 -->
      <el-option
        v-for="item in selectOptionList"
        :key="item[props.valueField]"
        :label="item[props.labelField]"
        :value="item[props.valueField]"
      >
        <div class="table-container" :style="tableContainerStyle">
          <div
            class="fixed-columns"
            style="
              display: flex !important;
              flex-direction: row !important;
              position: sticky;
              left: 0;
              z-index: 2;
              flex-shrink: 0;
              background-color: transparent !important;
            "
          >
            <div
              v-for="field in props.queryFields.slice(0, 2)"
              :key="field.fieldName"
              :style="{
                width: field.width + 'px',
                height: '36px',
                lineHeight: '28px',
                padding: '4px 12px',
                boxSizing: 'border-box',
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                color: 'var(--el-text-color-regular)',
                backgroundColor: 'transparent',
                borderBottom: '1px solid var(--el-table-border-color, #ebeef5)',
                borderRight: '1px solid var(--el-table-border-color, #ebeef5)',
              }"
            >
              {{ item[field.fieldName] }}
            </div>
          </div>
          <div
            class="scrollable-columns"
            :style="{
              ...scrollableColumnsStyle,
              transform: `translateX(-${scrollLeft}px)`,
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              backgroundColor: 'transparent',
            }"
          >
            <div
              v-for="field in props.queryFields.slice(2)"
              :key="field.fieldName"
              :style="{
                width: field.width + 'px',
                height: '36px',
                lineHeight: '28px',
                padding: '4px 12px',
                boxSizing: 'border-box',
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                color: 'var(--el-text-color-regular)',
                backgroundColor: 'transparent',
                borderBottom: '1px solid var(--el-table-border-color, #ebeef5)',
                borderRight: '1px solid var(--el-table-border-color, #ebeef5)',
              }"
            >
              {{ item[field.fieldName] }}
            </div>
          </div>
        </div>
      </el-option>

      <!-- 页脚 -->
      <template #footer>
        <div
          class="table-container"
          :style="{ ...tableContainerStyle, transform: 'translate(-4px, -6px)' }"
        >
          <div
            class="fixed-columns"
            style="
              display: flex !important;
              flex-direction: row !important;
              position: sticky;
              left: 0;
              z-index: 2;
              flex-shrink: 0;
              background-color: transparent !important;
            "
          >
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
              :style="{ width: field.width + 'px', height: '1px', border: 'none', padding: 0 }"
            ></div>
          </div>
        </div>
        <div class="flex-footer" style="display: flex !important; align-items: center !important">
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

const tableContainerStyle = computed(() => {
  const styleObj: Record<string, string> = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "transparent",
  };
  if (props.tableWidth) {
    styleObj.width = props.tableWidth + "px";
  }
  return styleObj;
});

const scrollableColumnsStyle = computed(() => {
  const fixedColumnsWidth = props.queryFields
    .slice(0, 2)
    .reduce((sum, field) => sum + field.width, 0);
  const containerWidth = props.tableWidth || 100;
  return {
    width: containerWidth - fixedColumnsWidth + "px",
  };
});

const emit = defineEmits<{
  "update:selectRow": [row?: AutoInputRow];
  "update:handVisibleChange": [visible?: boolean];
  handleEnter: [event: KeyboardEvent];
  select: [row?: AutoInputRow];
}>();

const selectVal = ref("");
const scrollLeft = ref(0);
const selectRef = ref<InstanceType<typeof ElSelect>>();
const loading = ref(false);
const selectOptionList = ref<AutoInputRow[]>([]);
const rowTotal = ref(0);
const queryParams = reactive<AutoInputQueryParams>({
  pageNum: 1,
  pageSize: 10,
  value: undefined,
});

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

<style>
/* 下拉框全局重置 */
.my-table-select-popper {
  min-width: max-content !important;
}

/* 强行重置 Element 默认 Option 的内边距与背景 */
.my-table-select-popper .el-select-dropdown__item {
  padding: 0 !important;
  height: auto !important;
  line-height: normal !important;
  background-color: transparent !important;
}

.my-table-select-popper .el-select-dropdown__wrap .el-select-dropdown__list {
  padding: 0 !important;
}

/* 1. 鼠标悬浮 (Hover) 浅灰背景 */
.my-table-select-popper .el-select-dropdown__item.hover,
.my-table-select-popper .el-select-dropdown__item:hover {
  background-color: var(--el-table-row-hover-bg-color, #f5f7fa) !important;
}

/* 2. 选中态 (Selected) 浅蓝背景与高亮文字 —— 提至最高优先级 */
.my-table-select-popper .el-select-dropdown__item.is-selected,
.my-table-select-popper .el-select-dropdown__item.selected {
  background-color: var(--el-color-primary-light-9, #ecf5ff) !important;
}

/* 强制把选中行里面的文字改成蓝色 */
.my-table-select-popper .el-select-dropdown__item.is-selected .table-container .data-cell,
.my-table-select-popper .el-select-dropdown__item.selected .table-container .data-cell {
  color: var(--el-color-primary, #409eff) !important;
  font-weight: bold !important;
}

/* 隐藏横向微调滚动条 */
.my-table-select-popper #scollable-div::-webkit-scrollbar {
  height: 6px;
}
.my-table-select-popper #scollable-div::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}
.my-table-select-popper #scollable-div::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}
</style>
