/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-08 00:00:00
 * @Description: 收益记录管理常量
 */

/** 默认搜索参数 */
export const defaultSearchParams = {
  profitNo: '',
  userName: '',
  activityName: '',
  source: undefined,
  type: undefined,
  status: undefined,
  startTime: '',
  endTime: '',
};

/** 导出字段配置 */
export const exportFields = [
  { label: '收益编号', key: 'profitNo' },
  { label: '用户名称', key: 'userName' },
  { label: '活动名称', key: 'activityName' },
  { label: '收益金额', key: 'amount' },
  { label: '收益来源', key: 'source' },
  { label: '收益类型', key: 'type' },
  { label: '收益状态', key: 'status' },
  { label: '创建时间', key: 'createdAt' },
  { label: '结算时间', key: 'settledAt' },
];

/** 表格列配置 */
export const tableColumns = [
  { key: 'profitNo', titleKey: 'profitManage.profitNo', width: 180 },
  { key: 'userName', titleKey: 'profitManage.userName', width: 120 },
  { key: 'activityName', titleKey: 'profitManage.activityName', width: 200 },
  { key: 'amount', titleKey: 'profitManage.amount', width: 120 },
  { key: 'source', titleKey: 'profitManage.source', width: 120 },
  { key: 'type', titleKey: 'profitManage.type', width: 100 },
  { key: 'status', titleKey: 'profitManage.status', width: 100 },
  { key: 'createdAt', titleKey: 'form.createTime', width: 180 },
  { key: 'settledAt', titleKey: 'profitManage.settledTime', width: 180 },
];