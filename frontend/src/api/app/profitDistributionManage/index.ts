/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 利润分配配置管理
 */

import alovaInstance from '@/utils/instance';

import { ProfitDistributionFormData, ProfitDistributionListParams } from './types';

export default {
  // 获取利润分配配置列表
  getList(data: ProfitDistributionListParams): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_PROFIT_DISTRIBUTION_LIST, data);
  },
  // 新增利润分配配置
  onCreate(data: ProfitDistributionFormData): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_PROFIT_DISTRIBUTION_CREATE, data);
  },
  // 删除利润分配配置
  onDelete(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Delete(RequestPath.APP_PROFIT_DISTRIBUTION_DELETE, data);
  },
  // 编辑利润分配配置
  onEdit(data: ProfitDistributionFormData): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_PROFIT_DISTRIBUTION_UPDATE, data);
  },
  // 启用利润分配配置
  onEnable(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_PROFIT_DISTRIBUTION_ENABLE, data);
  },
};