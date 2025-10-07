/**
 * 活动管理相关选项配置
 */

import { ActivityStatusEnum } from './enum';

/** 活动状态选项 */
export const activityStatusOptions = [
  {
    label: '已发布',
    labelKey: 'activityManage.published',
    theme: 'success',
    value: ActivityStatusEnum.PUBLISHED,
  },
  {
    label: '已结束',
    labelKey: 'activityManage.ended',
    theme: 'info',
    value: ActivityStatusEnum.ENDED,
  },
  {
    label: '已取消',
    labelKey: 'activityManage.cancelled',
    theme: 'danger',
    value: ActivityStatusEnum.CANCELLED,
  },
];
