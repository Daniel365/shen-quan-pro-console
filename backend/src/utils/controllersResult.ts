/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-29 19:56:56
 * @Description: 统一响应参数处理工具
 */

import {
  ReturnCodeEnum,
  ResParamsTypeEnum,
  ResponseResult,
  PageData,
} from "../types/interfaceResult";

// 扩展参数接口
interface ExtendOptions {
  resType?: ResParamsTypeEnum;
  message?: string; // 允许自定义成功消息
}

/**
 * 请求成功返回参数处理
 * @param params 要返回的数据
 * @param extend 扩展配置
 * @returns 格式化后的响应结果
 */
export function onSuccessResult<T = any>(
  params: T | T[] | PageData<T>,
  extend?: ExtendOptions
): ResponseResult {
  const { resType = ResParamsTypeEnum.DEFAULT, message = "请求成功" } =
    extend || {};

  let data: any;

  if (params) {
    switch (resType) {
      case ResParamsTypeEnum.LIST:
        // 确保参数是数组类型
        if (!Array.isArray(params)) {
          throw new Error(
            `当resType为${ResParamsTypeEnum.LIST}时，params必须是数组`
          );
        }
        data = { list: params };
        break;

      case ResParamsTypeEnum.LIST_PAGE:
        // 检查分页数据结构是否完整
        if (
          !params ||
          typeof params !== "object" ||
          !("list" in params) ||
          !("pageInfo" in params)
        ) {
          throw new Error(
            `当resType为${ResParamsTypeEnum.LIST_PAGE}时，params必须包含list和pageInfo属性`
          );
        }
        data = {
          list: params.list,
          pageInfo: params.pageInfo,
        };
        break;

      default:
        data = params;
    }
  }

  return {
    code: ReturnCodeEnum.REQUEST_SUCESS,
    data,
    message,
  };
}

/**
 * 请求失败返回参数处理
 * @param message 错误消息
 * @param code 错误代码，默认REQUEST_ERROR
 * @returns 格式化后的响应结果
 */
export function onErrorResult(
  message: string,
  code: ReturnCodeEnum = ReturnCodeEnum.REQUEST_ERROR
): ResponseResult {
  return {
    code,
    data: null,
    message,
  };
}
