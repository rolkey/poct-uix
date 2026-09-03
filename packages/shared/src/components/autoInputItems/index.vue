<template>
  <el-select
    v-model="selectVal"
    filterable
    remote
    ref="selectRef"
    :placeholder="placeholder"
    remote-show-suffix
    v-select-all-on-focus
    :disabled="readonly"
    default-first-option
    :clearable="props.clearable"
    :remote-method="remoteMethod"
    :loading="loading"
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
            :key="field"
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
            :key="field"
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
            <template v-if="field.extFieldName">
              {{ item[field.extFieldName]?.[field.fieldName] }}
            </template>
            <template v-else>
              {{ item[field.fieldName] }}
            </template>
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
            <template v-if="field.extFieldName">
              {{ item[field.extFieldName]?.[field.fieldName] }}
            </template>
            <template v-else>
              {{ item[field.fieldName] }}
            </template>
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
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </template>
  </el-select>
</template>

<script setup>
import pagination from "@/components/Pagination/index.vue";
import { ElSelect } from "element-plus";

const selectVal = ref("");
const scrollLeft = ref(0);
const props = defineProps({
  selectValue: {
    type: String,
    default: () => "",
  },
  selectRow: {
    type: Object,
    default: () => {},
  },
  labelField: {
    type: String,
    default: () => "",
  },
  extlabelField: {
    type: String,
    default: () => "",
  },
  extValueField: {
    type: String,
    default: () => "",
  },
  valueField: {
    type: String,
    default: () => "",
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  // 数据查询接口
  queryApi: {
    type: Function,
    default: () => ({}),
  },
  queryFields: {
    type: Array,
    default: () => [],
  },
  clearable: {
    type: Boolean,
    default: () => false,
  },
  readonly: {
    type: Boolean,
    default: () => false,
  },
  tableWidth: {
    type: Number,
    default: undefined,
  },
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

// 保持其他代码不变
const emit = defineEmits(["update:selectValue", "update:selectRow", "handleEnter"]);
const selectRef = ref(null);
const inputRef = ref(null);
const loading = ref(false);
const selectOptionList = ref([]);
const rowTotal = ref(0);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  value: undefined,
});

function handleChange(val) {
  const selectRow = selectOptionList.value.find((item) => item[props.valueField] === val);
  emit("update:selectRow", selectRow);
  emit("update:selectValue", val);
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

const remoteMethod = (query) => {
  queryParams.value = query;
  queryParams.pageNum = 1;
  getList();
};

const handleEnter = (event) => {
  emit("handleEnter", event);
  if (selectVal.value?.trim()) {
    handleChange(selectVal.value);
  }
};

const handVisibleChange = (value) => {
  setTimeout(() => {
    selectRef.value.$el.querySelector("input").dataset.isOpen = value;
  }, 600);
};

const updateValue = (newVal) => {
  setTimeout(() => {
    selectOptionList.value = [
      {
        [props.valueField]:
          props.extValueField === ""
            ? newVal[props.valueField] ?? ""
            : newVal[props.extValueField] ?? "",
        [props.labelField]:
          props.extlabelField === ""
            ? newVal[props.labelField] ?? ""
            : newVal[props.extlabelField] ?? "",
      },
    ];
    selectVal.value = selectOptionList.value[0][props.valueField];
  }, 100);
};

function syncScroll(event) {
  scrollLeft.value = event.target.scrollLeft;
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
.table-container {
  display: flex;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.fixed-columns {
  display: flex;
  position: sticky;
  left: 0;
  z-index: 2;
  flex-shrink: 0;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  /* background-color: var(--table-td-background-color); */
}

.scrollable-columns {
  display: flex;
  flex: 1;
  /* backdrop-filter: saturate(180%) blur(20px); */
  /* -webkit-backdrop-filter: saturate(180%) blur(20px); */
  /* background-color: var(--table-td-background-color);  */
  /* 这个选项导致与option的行高亮冲突 */
}

.header-cell {
  background-color: var(--table-th-background-color) !important;
  border: 1px solid var(--table-th-border-color) !important;
  padding: 4px !important;
  font-family: "黑体";
  color: black;
  text-align: center;
  font-weight: bold;
  flex-shrink: 0;
}

.data-cell {
  /* padding: 4px; */
  border: 1px solid var(--table-th-border-color);
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#scollable-div {
  display: flex;
  position: relative;
  overflow-x: auto;
  /* 只在这个元素上使用横向滚动轴 */
  overflow-y: hidden;
}

#scollable-div::-webkit-scrollbar-track {
  background: #b3aeae;
  /* 滚动条轨道颜色 */
  border-radius: 10px;
  /* 滚动条轨道圆角 */
}

#scollable-div .data-cell {
  height: 1px;
  /* footer中的单元格高度与滚动条高度一致 */
  border: none;
}
</style>
