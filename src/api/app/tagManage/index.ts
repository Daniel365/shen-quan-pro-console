/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 标签管理API
 */

import alovaInstance from '@/utils/instance';

import { TagFormData, TagListParams } from './types';

export default {
  // 获取标签详情
  getDetails(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_TAG_DETAILS, { params: data });
  },

  // 获取标签列表
  getList(data: TagListParams): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_TAG_LIST, data);
  },

  // 新增标签
  onCreate(data: TagFormData): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_TAG_CREATE, data);
  },

  // 删除标签
  onDelete(data: { tagUuids: string[] }): Promise<InterfaceResult> {
    return alovaInstance.Delete(RequestPath.APP_TAG_DELETE, data);
  },

  // 编辑标签
  onEdit(data: TagFormData): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_TAG_UPDATE, data);
  },
};
