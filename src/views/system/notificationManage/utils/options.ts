/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-27
 * @Description: 通知管理选项配置
 */
import { NotificationType } from '@/api/system/notificationManage/types';

/**
 * 通知类型选项
 * 用于通知列表和发送通知时选择通知类型
 */
export const notificationTypeOptions: OptionsItemType[] = [
  {
    label: '信息',
    labelKey: 'notificationManage.typeInfo',
    theme: '',
    value: 'info' as NotificationType,
  },
  {
    label: '成功',
    labelKey: 'notificationManage.typeSuccess',
    theme: 'success',
    value: 'success' as NotificationType,
  },
  {
    label: '警告',
    labelKey: 'notificationManage.typeWarning',
    theme: 'warning',
    value: 'warning' as NotificationType,
  },
  {
    label: '错误',
    labelKey: 'notificationManage.typeError',
    theme: 'danger',
    value: 'error' as NotificationType,
  },
];

/**
 * 已读状态选项
 * 用于通知列表搜索和状态显示
 */
export const notificationReadStatusOptions: OptionsItemType[] = [
  {
    label: '未读',
    labelKey: 'notificationManage.unread',
    theme: 'warning',
    value: false,
  },
  {
    label: '已读',
    labelKey: 'notificationManage.read',
    theme: 'success',
    value: true,
  },
];

/**
 * 接收者类型选项
 * 用于发送通知时选择接收者范围
 */
export const receiverTypeOptions: OptionsItemType[] = [
  {
    label: '全体用户',
    labelKey: 'notificationManage.allUsers',
    value: 'all',
  },
  {
    label: '指定用户',
    labelKey: 'notificationManage.specificUser',
    value: 'specific',
  },
];
