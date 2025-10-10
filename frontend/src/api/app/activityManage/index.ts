/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 活动管理API
 */

import alovaInstance from '@/utils/instance';

import { ActivityFormData, ActivityListParams } from './types';

export default {
  // 获取活动详情
  getDetails(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_ACTIVITY_DETAILS, { params: data });
  },
  // 获取活动列表
  getList(data: ActivityListParams): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_ACTIVITY_LIST, data);
  },

  // 新增活动
  onCreate(data: ActivityFormData): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_ACTIVITY_CREATE, data);
  },

  // 删除活动
  onDelete(data: { activityUuids: string[] }): Promise<InterfaceResult> {
    return alovaInstance.Delete(RequestPath.APP_ACTIVITY_DELETE, data);
  },

  // 编辑活动
  onEdit(data: ActivityFormData): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_ACTIVITY_UPDATE, data);
  },
};
