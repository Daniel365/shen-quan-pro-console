/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 11:59:20
 * @Description: 接口返回
 */

/** 返回code码 */
export enum ReturnCodeEnum {
  // 请求成功
  REQUEST_SUCESS = 0,
  // 请求失败
  REQUEST_ERROR = 1,
  // 请求参数有误
  REQUEST_PARAMS_ERROR = 2,
}

// 分页数据结构接口定义
export interface PageData<T> {
  list: T[];
  pageInfo: {
    total: number;
    page?: number;
    pageSize?: number;
  };
}
