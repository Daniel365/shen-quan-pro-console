/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-08 00:00:00
 * @Description: 收益记录管理选项配置
 */

import { ProfitSourceEnum, ProfitTypeEnum, ProfitStatusEnum } from './enum';

/** 收益来源选项 */
export const profitSourceOptions = [
  { label: '活动收益', value: ProfitSourceEnum.ACTIVITY },
  { label: '会员卡收益', value: ProfitSourceEnum.MEMBERSHIP_CARD },
  { label: '其他收益', value: ProfitSourceEnum.OTHER },
];

/** 收益类型选项 */
export const profitTypeOptions = [
  { label: '收入', value: ProfitTypeEnum.INCOME },
  { label: '支出', value: ProfitTypeEnum.EXPENSE },
];

/** 收益状态选项 */
export const profitStatusOptions = [
  { label: '待结算', value: ProfitStatusEnum.PENDING },
  { label: '已结算', value: ProfitStatusEnum.SETTLED },
  { label: '已取消', value: ProfitStatusEnum.CANCELLED },
];