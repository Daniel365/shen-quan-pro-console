/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 收益管理API
 */

import alovaInstance from '@/utils/instance';

export default {
  // 获取收益详情
  getDetails(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_PROFIT_DETAILS, { params: data });
  },
  // 获取收益列表
  getList(data: any): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_PROFIT_LIST, data);
  },

  // 获取收益统计
  getStats(data: any): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_PROFIT_STATS, { params: data });
  },
  // 导出收益数据
  onExportData(data: any): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_PROFIT_EXPORT, { params: data });
  },
};
