/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-08 00:00:00
 * @Description: 会员卡管理API
 */

import alovaInstance from '@/utils/instance';

import { MembershipCardFormData, MembershipCardListParams } from './types';

export default {
  // 获取会员卡详情
  getDetails(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Get(RequestPath.APP_MEMBERSHIP_CARD_DETAILS, { params: data });
  },
  // 获取会员卡列表
  getList(data: MembershipCardListParams): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_MEMBERSHIP_CARD_LIST, data);
  },

  // 新增会员卡
  onCreate(data: MembershipCardFormData): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.APP_MEMBERSHIP_CARD_CREATE, data);
  },

  // 删除会员卡
  onDelete(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Delete(RequestPath.APP_MEMBERSHIP_CARD_DELETE, data);
  },

  // 编辑会员卡
  onEdit(data: MembershipCardFormData): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_MEMBERSHIP_CARD_UPDATE, data);
  },

  // 上架/下架会员卡
  toggleStatus(data: { uuid: string; status: number }): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_MEMBERSHIP_CARD_TOGGLE_STATUS, data);
  },

  // 批量更新排序
  updateSort(data: { uuids: string[] }): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.APP_MEMBERSHIP_CARD_UPDATE_SORT, data);
  },
};
