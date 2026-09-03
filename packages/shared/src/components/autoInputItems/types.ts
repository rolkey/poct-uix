/**
 * autoInputItems 组件数据类型(供组件与外部调用方复用)
 */

/** 下拉列表表格列字段 */
export interface AutoInputQueryField {
  title: string;
  width: number;
  fieldName: string;
  /** 嵌套对象外层字段名;存在时按 item[extFieldName][fieldName] 取值 */
  //   extFieldName?: string;
}

/** 下拉选项数据行 */
export type AutoInputRow = Record<string, any>;

/** 分页查询参数 */
export interface AutoInputQueryParams {
  pageNum: number;
  pageSize: number;
  /** 远程搜索关键字 */
  value?: string;
}

/** 数据查询接口返回值 */
export interface AutoInputQueryResult {
  pageData?: AutoInputRow[];
  total: number;
}

export type AutoInputQueryApi = (params: AutoInputQueryParams) => Promise<AutoInputQueryResult>;

/** autoInputItems 组件 props */
export interface AutoInputProps {
  /** v-model:selectValue 绑定值 */
  selectValue?: string;
  /** v-model:selectRow 选中的整行数据 */
  selectRow?: AutoInputRow;
  labelField?: string;
  /** 嵌套对象外层字段名;与 labelField 组合取显示值 */
  extlabelField?: string;
  /** 嵌套对象外层字段名;与 valueField 组合取选中值 */
  extValueField?: string;
  valueField?: string;
  placeholder?: string;
  /** 数据查询接口,入参为分页查询参数,返回当前页数据与总数 */
  queryApi?: AutoInputQueryApi;
  queryFields?: AutoInputQueryField[];
  clearable?: boolean;
  readonly?: boolean;
  /** 表格总宽度(px);缺省时表头与滚动条宽度自适应 */
  tableWidth?: number;
}
