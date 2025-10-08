// 订单状态枚举
export enum OrderStatusEnum {
  PENDING = 1, // 待支付
  PAID = 2, // 已支付
  COMPLETED = 3, // 已完成
  REFUNDED = 4, // 已退款
  CANCELLED = 5, // 已取消
}

// 支付方式枚举
export enum PaymentMethod {
  WECHAT = 1, // 微信
  ALIPAY = 2, // 支付宝
}

// 退款状态枚举
export enum RefundStatus {
  APPLYING = 0, // 申请中
  SUCCESS = 1, // 已成功
  REJECTED = 2, // 已拒绝
}

// 获取订单状态中文描述
export function getOrderStatusText(status: OrderStatusEnum): string {
  switch (status) {
    case OrderStatusEnum.PENDING:
      return '待支付';
    case OrderStatusEnum.PAID:
      return '已支付';
    case OrderStatusEnum.COMPLETED:
      return '已完成';
    case OrderStatusEnum.REFUNDED:
      return '已退款';
    case OrderStatusEnum.CANCELLED:
      return '已取消';
    default:
      return '未知状态';
  }
}

// 获取支付方式中文描述
export function getPaymentMethodText(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.WECHAT:
      return '微信支付';
    case PaymentMethod.ALIPAY:
      return '支付宝';
    default:
      return '未知支付方式';
  }
}

// 获取退款状态中文描述
export function getRefundStatusText(status: RefundStatus): string {
  switch (status) {
    case RefundStatus.APPLYING:
      return '申请中';
    case RefundStatus.SUCCESS:
      return '已成功';
    case RefundStatus.REJECTED:
      return '已拒绝';
    default:
      return '未知状态';
  }
}
