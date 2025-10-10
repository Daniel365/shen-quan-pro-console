/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-07 00:00:00
 * @Description: 订单管理选项配置
 */

import { OrderStatusEnum, RefundStatusEnum, PaymentMethodEnum } from './enum';

/** 订单状态选项 */
export const orderStatusOptions: OptionsItemType[] = [
  {
    label: '待支付',
    labelKey: 'orderManage.statusPending',
    value: OrderStatusEnum.PENDING,
  },
  {
    label: '已支付',
    labelKey: 'orderManage.statusPaid',
    value: OrderStatusEnum.PAID,
  },
  {
    label: '已取消',
    labelKey: 'orderManage.statusCancelled',
    value: OrderStatusEnum.CANCELLED,
  },
  {
    label: '已退款',
    labelKey: 'orderManage.statusRefunded',
    value: OrderStatusEnum.REFUNDED,
  },
  {
    label: '已完成',
    labelKey: 'orderManage.statusCompleted',
    value: OrderStatusEnum.COMPLETED,
  },
];

/** 退款状态选项 */
export const refundStatusOptions: OptionsItemType[] = [
  {
    label: '无退款',
    labelKey: 'orderManage.refundNone',
    value: RefundStatusEnum.NONE,
  },
  {
    label: '退款中',
    labelKey: 'orderManage.refundProcessing',
    value: RefundStatusEnum.PROCESSING,
  },
  {
    label: '退款成功',
    labelKey: 'orderManage.refundSuccess',
    value: RefundStatusEnum.SUCCESS,
  },
  {
    label: '退款失败',
    labelKey: 'orderManage.refundFailed',
    value: RefundStatusEnum.FAILED,
  },
];

/** 支付方式选项 */
export const paymentMethodOptions: OptionsItemType[] = [
  {
    label: '微信支付',
    labelKey: 'orderManage.paymentWechat',
    value: PaymentMethodEnum.WECHAT,
  },
  {
    label: '支付宝',
    labelKey: 'orderManage.paymentAlipay',
    value: PaymentMethodEnum.ALIPAY,
  },
  {
    label: '银行卡',
    labelKey: 'orderManage.paymentBankCard',
    value: PaymentMethodEnum.BANK_CARD,
  },
  {
    label: '余额支付',
    labelKey: 'orderManage.paymentBalance',
    value: PaymentMethodEnum.BALANCE,
  },
];