/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: 通知管理API接口
 */
import alovaInstance from '@/utils/instance';

import type {
  NotificationDeleteParams,
  NotificationListItem,
  NotificationListParams,
  NotificationMarkReadParams,
  NotificationOnlineStatusResponse,
  NotificationSendParams,
  NotificationUnreadCountResponse,
} from './types';

/**
 * 通知管理API接口集合
 */
export default {
  /**
   * 获取通知列表
   * @param data 查询参数
   * @returns 通知列表数据
   */
  getList(
    data: NotificationListParams
  ): Promise<InterfaceResult<PageResult<NotificationListItem>>> {
    return alovaInstance.Post(RequestPath.NOTIFICATION_LIST, data);
  },

  /**
   * 获取在线用户状态（管理员）
   * @returns 在线状态数据
   */
  getOnlineStatus(): Promise<InterfaceResult<NotificationOnlineStatusResponse>> {
    return alovaInstance.Get(RequestPath.NOTIFICATION_ONLINE_STATUS);
  },

  /**
   * 获取未读通知数量
   * @returns 未读数量
   */
  getUnreadCount(): Promise<InterfaceResult<NotificationUnreadCountResponse>> {
    return alovaInstance.Get(RequestPath.NOTIFICATION_UNREAD_COUNT);
  },

  /**
   * 标记全部通知为已读
   * @returns 操作结果
   */
  markAllAsRead(): Promise<InterfaceResult<{ updatedCount: number }>> {
    return alovaInstance.Put(RequestPath.NOTIFICATION_MARK_ALL_READ, {});
  },

  /**
   * 标记单条通知为已读
   * @param data 标记参数
   * @returns 操作结果
   */
  markAsRead(data: NotificationMarkReadParams): Promise<InterfaceResult<null>> {
    return alovaInstance.Put(RequestPath.NOTIFICATION_MARK_READ, data);
  },

  /**
   * 删除通知（管理员）
   * @param data 删除参数
   * @returns 操作结果
   */
  onDelete(data: NotificationDeleteParams): Promise<InterfaceResult<null>> {
    return alovaInstance.Delete(RequestPath.NOTIFICATION_DELETE, data);
  },

  /**
   * 发送通知（管理员）
   * @param data 发送参数
   * @returns 操作结果
   */
  onSend(
    data: NotificationSendParams
  ): Promise<InterfaceResult<{ uuid: string; sentCount: number }>> {
    return alovaInstance.Post(RequestPath.NOTIFICATION_SEND, data);
  },
};
