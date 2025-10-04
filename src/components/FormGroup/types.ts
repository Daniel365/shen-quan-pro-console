import { FormRules } from 'element-plus';

// 表单字段配置接口
export interface FormGroupFieldConfig {
  /** 字段key */
  key: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: FormTypeEnum;
  /** 占位符 */
  placeholder?: string;
  /** 是否必填 */
  required?: boolean;
  /** 选项数据 */
  options?: any[];
  /** API选择器的API函数 */
  api?: (params: any) => Promise<InterfaceResult>;
  /** 标签字段名 */
  labelField?: string;
  /** 值字段名 */
  valueField?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否可搜索 */
  filterable?: boolean;
  /** 最大长度 */
  maxlength?: number;
  /** 是否显示字数统计 */
  showWordLimit?: boolean;
  /** 行数 */
  rows?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 开关激活值 */
  activeValue?: any;
  /** 开关非激活值 */
  inactiveValue?: any;
  /** 日期选择器类型 */
  dateType?: string;
  /** 自定义组件 */
  component?: Component;
  /** 自定义组件属性 */
  props?: Record<string, any>;
}

export interface FormGroupProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 操作类型 */
  actionType: ActionTypeEnum;
  /** 表单字段配置 */
  formFields: FormGroupFieldConfig[];
  /** 表单验证规则 */
  formRules?: FormRules;
  /** 新增API */
  addApi?: (params: any) => Promise<InterfaceResult>;
  /** 编辑API */
  editApi?: (params: any) => Promise<InterfaceResult>;
  /** 详情数据 */
  detailsData?: Record<string, any>;
  /** 弹窗宽度 */
  width?: string | number;
  /** 标签宽度 */
  labelWidth?: string;
  /** 弹窗标题映射 */
  titleMap?: Record<ActionTypeEnum, string>;
  /** 提交按钮文本映射 */
  submitButtonTextMap?: Record<ActionTypeEnum, string>;
}
