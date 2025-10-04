/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-14 15:24:03
 * @Description: 操作日志
 */
import alovaInstance from '@/utils/instance';

import type { OperationLogListParams } from './data.d';

export default {
  // 获取操作日志列表
  getList(data: OperationLogListParams): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.OPERATION_LOG_LIST, data);
  },
};
