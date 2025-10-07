import { FormRules } from 'element-plus';
import { ActionTypeEnum } from '@/enums';
import { FormGroupFieldConfig } from '../FormGroup/types';

// 表单页面属性接口
export interface FormPageProps {
  /** 操作类型 */
  actionType?: ActionTypeEnum;
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
  /** 标签宽度 */
  labelWidth?: string;
  /** 页面标题映射 */
  titleMap?: Record<ActionTypeEnum, string>;
  /** 提交按钮文本映射 */
  submitButtonTextMap?: Record<ActionTypeEnum, string>;
}