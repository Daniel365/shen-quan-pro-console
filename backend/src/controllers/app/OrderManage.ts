/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 订单管理
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import { Activity, ActivityTranslation, Order, ProfitRecord, User } from '@/models/app';
// utils
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import { GenderEnum, OrderStatusEnum, ProfitStatusEnum, StatusEnum } from '@/enum';
// services
import { ConfigService } from '@/services/ConfigService';
import { ProfitService } from '@/services/ProfitService';

export class OrderController {
  /**
   * 获取订单列表
   */
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        { field: 'orderer_uuid' },
        { field: 'target_uuid' },
        { field: 'order_type' },
        { field: 'order_status' },
      ]);

      const { rows, count } = await Order.findAndCountAll({
        where,
        ...defaultListQuery(reqBody),
        include: [
          {
            model: Activity,
            as: 'activity',
            attributes: ['location', 'start_time'],
            include: [
              {
                model: ActivityTranslation,
                as: 'translations',
                attributes: ['title', 'language'],
                required: false,
              },
            ],
          },
          {
            model: User,
            as: 'orderer',
            attributes: ['nickname', 'phone', 'gender'],
          },
        ],
      });

      const pageInfo = getPageInfoConfig({
        count,
        ...reqBody,
      });

      return res.responseBuilder.success({
        list: rows,
        pageInfo,
      });
    } catch (error) {
      console.log('err', error);
      return res.responseBuilder.error('order.listFailed', 500);
    }
  }

  /**
   * 创建订单
   */
  static async create(req: Request, res: Response) {
    try {
      const { orderer_uuid, target_uuid } = req.body;

      if (!orderer_uuid || !target_uuid) {
        return res.responseBuilder.error('order.requiredFields', 400);
      }

      // 验证用户是否存在
      const user = await User.findOne({ where: { uuid: orderer_uuid, status: StatusEnum.ENABLE } });
      if (!user) {
        return res.responseBuilder.error('user.notFound', 404);
      }

      // 验证活动是否存在且可报名
      const activity = await Activity.findOne({
        where: {
          uuid: target_uuid,
          status: StatusEnum.ENABLE,
        },
      });
      if (!activity) {
        return res.responseBuilder.error('activity.notFound', 404);
      }

      // 检查活动时间是否有效
      const now = new Date();
      if (now < activity.start_time) {
        return res.responseBuilder.error('activity.notStarted', 400);
      }
      if (now > activity.end_time) {
        return res.responseBuilder.error('activity.expired', 400);
      }

      // 检查是否已报名
      const existingOrder = await Order.findOne({
        where: {
          orderer_uuid,
          target_uuid,
          order_type: 'activity',
          order_status: { [Op.ne]: OrderStatusEnum.REFUNDED },
        },
      });
      if (existingOrder) {
        return res.responseBuilder.error('order.alreadyRegistered', 400);
      }

      // 检查报名人数是否已满 - 从订单表获取已报名人数
      const registeredCount = await Order.count({
        where: {
          target_uuid: target_uuid,
          order_type: 'activity',
          order_status: OrderStatusEnum.PAID,
        },
      });

      if (registeredCount >= activity.reg_limit && activity.reg_limit > 0) {
        return res.responseBuilder.error('activity.registrationFull', 400);
      }

      // 根据用户性别计算价格
      const actualPrice = this.calculatePrice(activity, user.gender || GenderEnum.UNKNOWN);

      // 创建订单
      const order = await Order.create({
        orderer_uuid,
        target_uuid,
        order_type: 'activity',
        actual_price: actualPrice,
        order_status: OrderStatusEnum.PENDING,
        order_time: new Date(),
      });

      return res.responseBuilder.success(order, 'order.createSuccess');
    } catch (error) {
      console.log('err', error);
      return res.responseBuilder.error('order.createFailed', 500);
    }
  }

  /**
   * 支付订单
   */
  static async pay(req: Request, res: Response) {
    try {
      const { order_uuid } = req.body;

      if (!order_uuid) {
        return res.responseBuilder.error('order.orderIdRequired', 400);
      }

      const order = await Order.findOne({ where: { uuid: order_uuid } });
      if (!order) {
        return res.responseBuilder.error('order.notFound', 404);
      }

      if (order.order_status !== OrderStatusEnum.PENDING) {
        return res.responseBuilder.error('order.invalidStatus', 400);
      }

      // 更新订单状态为已支付
      await Order.update({ order_status: OrderStatusEnum.PAID }, { where: { uuid: order_uuid } });

      // 注意：报名人数现在通过订单表统计，不再更新活动表的regCount字段

      // 生成分账记录
      await this.generateProfitRecord(order);

      return res.responseBuilder.success({ order_uuid }, 'order.paySuccess');
    } catch (error) {
      return res.responseBuilder.error('order.payFailed', 500);
    }
  }

  /**
   * 申请退款
   */
  static async refund(req: Request, res: Response) {
    try {
      const { order_uuid } = req.body;

      if (!order_uuid) {
        return res.responseBuilder.error('order.orderIdRequired', 400);
      }

      const order = await Order.findOne({
        where: { uuid: order_uuid },
        include: [{ model: Activity, as: 'activity' }],
      });
      if (!order) {
        return res.responseBuilder.error('order.notFound', 404);
      }

      if (order.order_status !== OrderStatusEnum.PAID) {
        return res.responseBuilder.error('order.notPaid', 400);
      }

      // 检查退款时间是否在截止时间前 - 动态计算退款截止时间
      const now = new Date();
      const refundDeadline = await ConfigService.calculateRefundDeadline(
        (order as any).activity.start_time
      );
      if (now > refundDeadline) {
        return res.responseBuilder.error('order.refundExpired', 400);
      }

      // 更新订单状态为已退款
      await Order.update(
        {
          order_status: OrderStatusEnum.REFUNDED,
          refund_time: new Date(),
        },
        { where: { uuid: order_uuid } }
      );

      // 注意：报名人数现在通过订单表统计，不再更新活动表的regCount字段

      // 更新分账记录状态为已取消
      await ProfitRecord.update({ status: ProfitStatusEnum.CANCELLED }, { where: { order_uuid } });

      return res.responseBuilder.success({ order_uuid }, 'order.refundSuccess');
    } catch (error) {
      return res.responseBuilder.error('order.refundFailed', 500);
    }
  }

  /**
   * 自动完成已结束活动的订单
   */
  static async autoCompleteOrders() {
    try {
      const now = new Date();

      // 获取所有已支付但活动已结束的订单
      const orders = await Order.findAll({
        where: {
          order_type: 'activity',
          order_status: OrderStatusEnum.PAID,
        },
        include: [
          {
            model: Activity,
            as: 'activity',
            where: {
              end_time: { [Op.lt]: now },
            },
          },
        ],
      });

      // 批量更新订单状态为已完成
      const orderIds = orders.map((order) => order.uuid);
      if (orderIds.length > 0) {
        await Order.update(
          { order_status: OrderStatusEnum.COMPLETED },
          { where: { uuid: { [Op.in]: orderIds } } }
        );
        console.log(`自动完成 ${orderIds.length} 个订单`);
      }

      return orderIds.length;
    } catch (error) {
      console.error('自动完成订单失败:', error);
      return 0;
    }
  }

  /**
   * 获取订单详情（包含订单状态自动检查）
   */
  static async getDetails(req: Request, res: Response) {
    try {
      const { order_uuid } = req.body;

      if (!order_uuid) {
        return res.responseBuilder.error('order.orderIdRequired', 400);
      }

      const order = await Order.findOne({
        where: { uuid: order_uuid },
        include: [{ model: Activity, as: 'activity' }],
      });

      if (!order) {
        return res.responseBuilder.error('order.notFound', 404);
      }

      // 检查订单状态是否需要自动更新
      if (
        order.order_status === OrderStatusEnum.PAID &&
        (order as any).activity &&
        new Date((order as any).activity.end_time) < new Date()
      ) {
        // 活动已结束，更新订单状态为已完成
        await Order.update(
          { order_status: OrderStatusEnum.COMPLETED },
          { where: { uuid: order_uuid } }
        );
        order.order_status = OrderStatusEnum.COMPLETED;
      }

      return res.responseBuilder.success(order);
    } catch (error) {
      console.error('获取订单详情失败:', error);
      return res.responseBuilder.error('order.detailFailed', 500);
    }
  }

  /**
   * 获取用户订单列表
   */
  @IgnoreLog()
  static async userOrders(req: Request, res: Response) {
    try {
      const { orderer_uuid, page = 1, pageSize = 10 } = req.body;

      if (!orderer_uuid) {
        return res.responseBuilder.error('user.uuidRequired', 400);
      }

      const { rows, count } = await Order.findAndCountAll({
        where: { orderer_uuid, order_type: 'activity' },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['order_time', 'DESC']],
        include: [
          {
            model: Activity,
            as: 'activity',
            attributes: ['location', 'start_time', 'end_time'],
            include: [
              {
                model: ActivityTranslation,
                as: 'translations',
                attributes: ['title', 'language'],
                required: false,
              },
            ],
          },
        ],
      });

      // 检查并更新需要自动完成的订单
      const ordersToUpdate: any[] = [];
      for (const order of rows) {
        if (
          order.order_status === OrderStatusEnum.PAID &&
          (order as any).activity &&
          new Date((order as any).activity.end_time) < new Date()
        ) {
          ordersToUpdate.push(order.uuid);
        }
      }

      if (ordersToUpdate.length > 0) {
        await Order.update(
          { order_status: OrderStatusEnum.COMPLETED },
          { where: { uuid: { [Op.in]: ordersToUpdate } } }
        );

        // 更新返回数据中的订单状态
        rows.forEach((order) => {
          if (ordersToUpdate.includes(order.uuid)) {
            order.order_status = OrderStatusEnum.COMPLETED;
          }
        });
      }

      const pageInfo = getPageInfoConfig({
        count,
        page,
        pageSize,
      });

      return res.responseBuilder.success({
        list: rows,
        pageInfo,
      });
    } catch (error) {
      return res.responseBuilder.error('order.userListFailed', 500);
    }
  }

  /**
   * 根据用户性别计算价格
   */
  private static calculatePrice(activity: Activity, gender: GenderEnum): number {
    switch (gender) {
      case GenderEnum.MALE:
        return activity.male_price || activity.base_price;
      case GenderEnum.FEMALE:
        return activity.female_price || activity.base_price;
      default:
        return activity.base_price;
    }
  }

  /**
   * 生成分润记录
   */
  private static async generateProfitRecord(order: Order) {
    try {
      const activity = await Activity.findOne({ where: { uuid: order.target_uuid } });
      const user = await User.findOne({ where: { uuid: order.orderer_uuid } });

      if (!activity || !user) {
        throw new Error('Activity or User not found');
      }

      const totalAmount = order.actual_price;

      // 使用动态分润服务创建分润记录
      const profitRecord = await ProfitService.createProfitRecord(
        order.uuid,
        order.target_uuid,
        order.orderer_uuid,
        totalAmount
      );

      // 创建分润记录
      await ProfitRecord.create(profitRecord);

      console.log('分润记录创建成功:', {
        orderId: order.uuid,
        totalAmount,
        distribution: profitRecord.profit_distribution,
      });
    } catch (error) {
      console.error('Generate profit record failed:', error);
      throw error;
    }
  }
}
