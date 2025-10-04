/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: 通知管理相关数据类型定义
 */

import { UserListItem } from "../userManage/data.d";

/**
 * 通知类型枚举
 */
export type NotificationType = "info" | "warning" | "error" | "success";

/**
 * 通知列表项
 */
export interface NotificationListItem {
  /** 通知UUID */
  uuid: string;
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 通知类型 */
  type: NotificationType;
  /** 是否已读 */
  isRead: boolean;
  /** 发送者名称 */
  senderName?: string;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 通知列表查询参数
 */
export interface NotificationListParams extends PageParams {
  /** 标题关键词 */
  title?: string;
  /** 通知类型 */
  type?: NotificationType;
  /** 是否已读 */
  isRead?: boolean;
}

/**
 * 标记已读参数
 */
export interface NotificationMarkReadParams {
  /** 通知UUID */
  uuid: string;
}

/**
 * 发送通知参数
 */
export interface NotificationSendParams {
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 通知类型 */
  type?: NotificationType;
  /** 接收者UUID，为空表示全体用户 */
  receiverUuid?: string;
}

/**
 * 删除通知参数
 */
export interface NotificationDeleteParams {
  /** 通知UUID */
  uuid: string;
}

/**
 * 未读数量响应
 */
export interface NotificationUnreadCountResponse {
  /** 未读数量 */
  unreadCount: number;
}

/**
 * 在线状态响应
 */
export interface NotificationOnlineStatusResponse {
  /** 在线用户UUID列表 */
  onlineUsers: UserListItem[];
  /** 在线用户数量 */
  onlineCount: number;
}

/**
 * SSE消息数据
 */
export interface SSEMessageData {
  /** 消息类型 */
  type: "notification" | "connected" | "heartbeat";
  /** 消息数据 */
  data?: {
    uuid: string;
    title: string;
    content: string;
    notificationType: NotificationType;
    createdAt: string;
  };
  /** 连接消息 */
  message?: string;
  /** 心跳时间戳 */
  timestamp?: number;
}
