import { TagTypeEnum } from './enum';

/** 标签类型选项 */
export const tagTypeOptions: OptionsItemType[] = [
  {
    label: '活动标签',
    labelKey: 'tagManage.tagActivity',
    value: TagTypeEnum.ACTIVITY,
  },
  {
    label: '用户标签',
    labelKey: 'tagManage.tagUser',
    value: TagTypeEnum.USER,
  },
];
