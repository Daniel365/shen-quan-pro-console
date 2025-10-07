/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-07 00:00:00
 * @Description: 订单管理常量
 */

/** 默认搜索参数 */
export const defaultSearchParams = {
  orderNo: '',
  userName: '',
  activityName: '',
  status: undefined,
  paymentMethod: undefined,
  refundStatus: undefined,
  startTime: '',
  endTime: '',
};

/** 导出字段配置 */
export const exportFields = [
  { label: '订单编号', key: 'orderNo' },
  { label: '用户名称', key: 'userName' },
  { label: '活动名称', key: 'activityName' },
  { label: '订单金额', key: 'amount' },
  { label: '支付方式', key: 'paymentMethod' },
  { label: '订单状态', key: 'status' },
  { label: '退款状态', key: 'refundStatus' },
  { label: '创建时间', key: 'createdAt' },
  { label: '支付时间', key: 'paidAt' },
];

/** 表格列配置 */
export const tableColumns = [
  { key: 'orderNo', titleKey: 'orderManage.orderNo', width: 180 },
  { key: 'userName', titleKey: 'orderManage.userName', width: 120 },
  { key: 'activityName', titleKey: 'orderManage.activityName', width: 200 },
  { key: 'amount', titleKey: 'orderManage.amount', width: 120 },
  { key: 'paymentMethod', titleKey: 'orderManage.paymentMethod', width: 120 },
  { key: 'status', titleKey: 'orderManage.status', width: 100 },
  { key: 'refundStatus', titleKey: 'orderManage.refundStatus', width: 100 },
  { key: 'createdAt', titleKey: 'form.createTime', width: 180 },
  { key: 'paidAt', titleKey: 'orderManage.paidTime', width: 180 },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 150 },
];