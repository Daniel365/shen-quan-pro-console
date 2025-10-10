/**
 * FormGroup 组件入口文件
 * 导出核心表单组件和弹窗表单组件
 */

// 导出核心表单组件
import FormGroup from './FormGroup.vue';
import FormGroupDialog from './FormGroupDialog.vue';

// 导出类型定义
export type { FormGroupFieldConfig, FormGroupProps } from './types';

// 导出组件
export { FormGroup, FormGroupDialog };

// 默认导出核心表单组件
export default FormGroup;