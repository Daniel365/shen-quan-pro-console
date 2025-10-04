/** 启用状态选项 */
export const enabledStatusOptions: OptionsItemType[] = [
  {
    label: '启用',
    labelKey: 'form.enabled',
    theme: 'success',
    value: EnabledStatusEnum.ENABLED,
  },
  {
    label: '禁用',
    labelKey: 'form.disabled',
    theme: 'danger',
    value: EnabledStatusEnum.DISABLED,
  },
];

/** 性别选项 */
export const genderOptions: OptionsItemType[] = [
  {
    label: '未知',
    labelKey: 'form.unknown',
    theme: 'info',
    value: GenderEnum.UNKNOWN,
  },
  {
    label: '男',
    labelKey: 'form.male',
    theme: 'success',
    value: GenderEnum.MALE,
  },
  {
    label: '女',
    labelKey: 'form.female',
    theme: 'danger',
    value: GenderEnum.FEMALE,
  },
];
