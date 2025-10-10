import { SystemConfigTypeEnum } from './enum'
/** 系统配置类型选项 */
export const systemConfigTypeOptions: OptionsItemType[] = [
  {
    label: '字符串',
    labelKey: 'form.typeString',
    value: SystemConfigTypeEnum.STRING,
  },
  {
    label: '数字',
    labelKey: 'form.typeNumber',
    value: SystemConfigTypeEnum.NUMBER,
  },
  {
    label: '布尔值',
    labelKey: 'form.typeBoolean',
    value: SystemConfigTypeEnum.BOOLEAN,
  },
  {
    label: 'JSON',
    labelKey: 'form.typeJson',
    value: SystemConfigTypeEnum.JSON,
  },
  {
    label: '数组',
    labelKey: 'form.array',
    value: SystemConfigTypeEnum.ARRAY,
  },
];
