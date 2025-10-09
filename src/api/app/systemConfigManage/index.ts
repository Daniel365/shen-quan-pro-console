/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 系统配置管理
 */

import alovaInstance from '@/utils/instance';

import { SystemConfigFormData, SystemConfigListParams } from './types';

export default {
  // 获取系统配置列表
  getList(data: SystemConfigListParams): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_SYSTEM_CONFIG_LIST, data);
  },
  // 新增系统配置
  onCreate(data: SystemConfigFormData): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_SYSTEM_CONFIG_CREATE, data);
  },
  // 删除系统配置
  onDelete(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Delete(RequestPath.APP_SYSTEM_CONFIG_DELETE, data);
  },
  // 编辑系统配置
  onEdit(data: SystemConfigFormData): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_SYSTEM_CONFIG_UPDATE, data);
  },
};