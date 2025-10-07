/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 活动订单管理API
 */
import alovaInstance from '@/utils/instance';

import { OrderListParams } from './types';

export default {
  // 获取订单详情
  getDetail(data: { orderUuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_DETAIL, { params: data });
  },

  // 获取订单列表
  getList(data: OrderListParams): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_LIST, { params: data });
  },

  // 获取订单统计
  getStats(data: OrderListParams): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_STATS, { params: data });
  },
  // 导出订单数据
  onExportData(data: { exportFields: any[] } & OrderListParams): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ORDER_EXPORT, { params: data });
  },

  // 订单退款
  onRefund(data: { orderUuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_ORDER_REFUND, data);
  },
};
