/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 活动订单管理API
 */

import alovaInstance from '@/utils/instance';

export default {
  // 导出订单数据
  exportData(data: { activityUuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_EXPORT, { params: data });
  },

  // 获取订单详情
  getOrderDetail(data: { orderUuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_DETAIL, { params: data });
  },

  // 获取订单列表
  getOrders(data: { activityUuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_LIST, { params: data });
  },

  // 获取订单统计
  getStats(data: { activityUuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_STATS, { params: data });
  },

  // 订单退款
  refundOrder(data: { orderUuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_ORDER_REFUND, data);
  },
};
