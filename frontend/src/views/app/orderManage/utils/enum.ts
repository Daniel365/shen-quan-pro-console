/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-07 00:00:00
 * @Description: 订单管理枚举
 */

/** 订单状态枚举 */
export enum OrderStatusEnum {
  /** 待支付 */
  PENDING = 1,
  /** 已支付 */
  PAID = 2,
  /** 已取消 */
  CANCELLED = 3,
  /** 已退款 */
  REFUNDED = 4,
  /** 已完成 */
  COMPLETED = 5,
}

/** 退款状态枚举 */
export enum RefundStatusEnum {
  /** 无退款 */
  NONE = 0,
  /** 退款中 */
  PROCESSING = 1,
  /** 退款成功 */
  SUCCESS = 2,
  /** 退款失败 */
  FAILED = 3,
}

/** 支付方式枚举 */
export enum PaymentMethodEnum {
  /** 微信支付 */
  WECHAT = 1,
  /** 支付宝 */
  ALIPAY = 2,
  /** 银行卡 */
  BANK_CARD = 3,
  /** 余额支付 */
  BALANCE = 4,
}