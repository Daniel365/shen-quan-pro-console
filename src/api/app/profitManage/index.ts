/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 收益管理API
 */

import alovaInstance from '@/utils/instance';

export default {
  // 取消收益
  cancelProfit(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_PROFIT_CANCEL, data);
  },

  // 导出收益数据
  exportData(data: any): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_PROFIT_EXPORT, { params: data });
  },

  // 获取收益详情
  getDetail(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_PROFIT_DETAIL, { params: data });
  },
  // 获取收益列表
  getList(data: any): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_PROFIT_LIST, data);
  },

  // 获取收益统计
  getStats(data: any): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_PROFIT_STATS, { params: data });
  },

  // 结算收益
  settleProfit(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_PROFIT_SETTLE, data);
  },
};
