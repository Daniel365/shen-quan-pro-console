import { OrderStatusEnum, PaymentMethod, RefundStatus } from '@/enum';
import Order from '@/models/app/Order';
import PaymentRecord from '@/models/app/PaymentRecord';
import RefundRecord from '@/models/app/RefundRecord';

interface CreateOrderData {
  orderer_uuid: string;
  target_uuid: string;
  order_type: string;
  actual_price: number;
  payment_method: PaymentMethod;
}

interface PaymentData {
  transaction_no: string;
  payment_time: Date;
}

interface RefundData {
  refund_amount: number;
  refund_reason?: string;
  operator?: string;
  transaction_no?: string;
}

export class OrderService {
  /**
   * 创建订单并自动创建支付记录
   */
  static async createOrder(data: CreateOrderData): Promise<Order> {
    const order = await Order.create({
      orderer_uuid: data.orderer_uuid,
      target_uuid: data.target_uuid,
      order_type: data.order_type,
      actual_price: data.actual_price,
      order_status: OrderStatusEnum.PENDING,
      order_time: new Date(),
    });

    // 自动创建关联的支付记录
    await PaymentRecord.create({
      order_uuid: order.uuid,
      payment_method: data.payment_method,
      payment_amount: data.actual_price,
      payment_status: OrderStatusEnum.PENDING,
    });

    return order;
  }

  /**
   * 完成支付 - 更新订单状态和支付记录
   */
  static async completePayment(orderUuid: string, paymentData: PaymentData): Promise<void> {
    // 使用事务确保数据一致性
    await Order.sequelize!.transaction(async (transaction) => {
      // 更新订单状态为已支付
      await Order.update(
        {
          order_status: OrderStatusEnum.PAID,
        },
        {
          where: { uuid: orderUuid },
          transaction,
        }
      );

      // 更新支付记录状态
      await PaymentRecord.update(
        {
          payment_status: OrderStatusEnum.PAID,
          transaction_no: paymentData.transaction_no,
          payment_time: paymentData.payment_time,
        },
        {
          where: { order_uuid: orderUuid },
          transaction,
        }
      );
    });
  }

  /**
   * 申请退款
   */
  static async applyRefund(orderUuid: string, refundData: RefundData): Promise<RefundRecord> {
    const refundRecord = await RefundRecord.create({
      order_uuid: orderUuid,
      refund_amount: refundData.refund_amount,
      refund_status: RefundStatus.APPLYING,
      refund_reason: refundData.refund_reason,
      operator: refundData.operator,
      transaction_no: refundData.transaction_no,
    });

    return refundRecord;
  }

  /**
   * 处理退款申请
   */
  static async processRefund(
    refundUuid: string,
    status: RefundStatus.SUCCESS | RefundStatus.REJECTED,
    operator?: string
  ): Promise<void> {
    const refundRecord = await RefundRecord.findByPk(refundUuid);
    if (!refundRecord) {
      throw new Error('退款记录不存在');
    }

    await Order.sequelize!.transaction(async (transaction) => {
      // 更新退款记录状态
      await RefundRecord.update(
        {
          refund_status: status,
          refund_time: status === RefundStatus.SUCCESS ? new Date() : undefined,
          operator: operator || refundRecord.operator,
        },
        {
          where: { uuid: refundUuid },
          transaction,
        }
      );

      // 如果退款成功，更新订单状态
      if (status === RefundStatus.SUCCESS) {
        await Order.update(
          {
            order_status: OrderStatusEnum.REFUNDED,
            refund_time: new Date(),
          },
          {
            where: { uuid: refundRecord.order_uuid },
            transaction,
          }
        );
      }
    });
  }

  /**
   * 取消订单
   */
  static async cancelOrder(orderUuid: string): Promise<void> {
    await Order.update(
      {
        order_status: OrderStatusEnum.CANCELLED,
      },
      {
        where: { uuid: orderUuid },
      }
    );
  }

  /**
   * 完成订单（业务完成）
   */
  static async completeOrder(orderUuid: string): Promise<void> {
    await Order.update(
      {
        order_status: OrderStatusEnum.COMPLETED,
      },
      {
        where: { uuid: orderUuid },
      }
    );
  }

  /**
   * 根据订单UUID获取订单详情（包含关联数据）
   */
  static async getOrderDetail(orderUuid: string): Promise<Order | null> {
    return await Order.findByPk(orderUuid, {
      include: [
        {
          association: 'paymentRecords',
          required: false,
        },
        {
          association: 'refundRecords',
          required: false,
        },
      ],
    });
  }

  /**
   * 根据用户UUID获取订单列表
   */
  static async getOrdersByUser(
    userUuid: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ rows: Order[]; count: number }> {
    const offset = (page - 1) * pageSize;

    return await Order.findAndCountAll({
      where: { orderer_uuid: userUuid },
      include: [
        {
          association: 'paymentRecords',
          required: false,
        },
      ],
      order: [['order_time', 'DESC']],
      offset,
      limit: pageSize,
    });
  }

  /**
   * 根据订单状态获取订单列表
   */
  static async getOrdersByStatus(
    status: OrderStatusEnum,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ rows: Order[]; count: number }> {
    const offset = (page - 1) * pageSize;

    return await Order.findAndCountAll({
      where: { order_status: status },
      include: [
        {
          association: 'paymentRecords',
          required: false,
        },
        {
          association: 'refundRecords',
          required: false,
        },
      ],
      order: [['order_time', 'DESC']],
      offset,
      limit: pageSize,
    });
  }

  /**
   * 验证订单状态是否可以操作
   */
  static validateOrderStatus(
    currentStatus: OrderStatusEnum,
    targetOperation: 'payment' | 'refund' | 'cancel' | 'complete'
  ): boolean {
    switch (targetOperation) {
      case 'payment':
        return currentStatus === OrderStatusEnum.PENDING;
      case 'refund':
        return [OrderStatusEnum.PAID, OrderStatusEnum.COMPLETED].includes(currentStatus);
      case 'cancel':
        return currentStatus === OrderStatusEnum.PENDING;
      case 'complete':
        return currentStatus === OrderStatusEnum.PAID;
      default:
        return false;
    }
  }
}
