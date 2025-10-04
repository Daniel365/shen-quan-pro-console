/** 列表搜索参数 */
export interface OperationLogListParams {
  action?: string;
  username?: string;
  userUuid?: string;
  ipAddress?: string;
}

export interface OperationLogListItem {
  uuid: string;
  userUuid: string;
  username: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}
