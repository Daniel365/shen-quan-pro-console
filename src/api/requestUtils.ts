import { ElMessage } from 'element-plus';

/** 接口版本 */
export const apiVersionUrl = '/api/v1.0';

/**
 * 处理API返回结果的参数接口
 */
interface HandleReturnResultsParams<T = any> {
  /** API返回的结果数据 */
  params: InterfaceResult<T>;
  /** 成功回调函数 */
  onSuccess: (data: InterfaceResult<T>) => void;
  /** 是否使用默认错误处理 */
  isDefaultError?: boolean;
  /** 错误回调函数 */
  onError?: (data: InterfaceResult<T>) => void;
}
/**
 * 处理API返回结果的通用函数
 * @param options 处理参数
 */
export function handleReturnResults<T = any>({
  params = {
    code: 1,
    data: undefined as T,
    dateTime: '',
    message: '',
    success: true,
    timestamp: 0,
  },
  isDefaultError = true,
  onSuccess,
  onError,
}: HandleReturnResultsParams<T>): void {
  const code = params.code;
  const flag = params.success;
  if (flag) {
    try {
      onSuccess?.(params);
    } catch (e) {
      console.error(e);
    }
  } else {
    switch (code) {
      default:
        ElMessage.error(params.message);
        break;
    }

    onError?.(params);
  }
}
