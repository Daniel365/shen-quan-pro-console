/*
 * @Description: 订单管理相关类型定义
 */

import {
  OrderStatusEnum,
  PaymentMethodEnum,
  RefundStatusEnum,
} from '@/views/app/orderManage/utils/enum';

/**
 * 订单列表查询参数接口
 */
export interface OrderListParams {
  /** 订单编号 */
  orderNo?: string;
  /** 用户名称 */
  userName?: string;
  /** 活动名称 */
  activityName?: string;
  /** 订单状态 */
  status?: OrderStatusEnum;
  /** 支付方式 */
  paymentMethod?: PaymentMethodEnum;
  /** 退款状态 */
  refundStatus?: RefundStatusEnum;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/**
 * 订单数据结构接口
 */
export interface OrderListItem {
  /** 订单ID */
  uuid: string;
  /** 订单编号 */
  orderNo: string;
  /** 用户ID */
  userUuid: number;
  /** 用户名称 */
  userName: string;
  /** 活动ID */
  activityUuid: number;
  /** 活动名称 */
  activityName: string;
  /** 订单金额 */
  amount: number;
  /** 支付方式 */
  paymentMethod: PaymentMethodEnum;
  /** 订单状态 */
  status: OrderStatusEnum;
  /** 退款状态 */
  refundStatus: RefundStatusEnum;
  /** 退款金额 */
  refundAmount?: number;
  /** 退款原因 */
  refundReason?: string;
  /** 创建时间 */
  createdAt: string;
  /** 支付时间 */
  paidAt?: string;
  /** 退款时间 */
  refundAt?: string;
}

/**
 * 订单退款参数接口
 */
export interface OrderRefundParams {
  /** 订单ID */
  orderId: number;
  /** 退款金额 */
  refundAmount: number;
  /** 退款原因 */
  refundReason?: string;
}

/**
 * 订单导出参数接口
 */
export interface OrderExportParams extends OrderListParams {
  /** 导出字段 */
  exportFields?: string[];
}
