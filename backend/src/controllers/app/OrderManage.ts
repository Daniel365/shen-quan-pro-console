/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 订单管理
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import { Activity, ActivityTranslation, Order, ProfitRecord, User, UserInvite } from '@/models/app';
// utils
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import {
  GenderEnum,
  OrderStatusEnum,
} from '@/enum';
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
  static async details(req: Request, res: Response) {
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
}
