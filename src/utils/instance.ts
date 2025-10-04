/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 20:52:03
 * @Description: alova 实例
 */
import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';

// utils
import { transformKeys } from '@/utils/format/letter';

/**
 * Alova HTTP客户端实例
 * 配置了请求拦截器、响应拦截器等
 */

const alovaInstance = createAlova({
  baseURL: apiVersionUrl,
  beforeRequest(method) {
    const { accessToken } = useAccountStoreHook();
    // 设置token
    if (accessToken) {
      method.config.headers.Authorization = accessToken;
    }

    // 转换数据格式 - (小驼峰 -> 下划线)
    if (method.data) {
      method.data = transformKeys({
        data: method.data,
      });
    }
  },
  requestAdapter: adapterFetch(),
  responded: {
    onSuccess: async (response) => {
      const { setToken, onLogout } = useAccountStoreHook();

      // 登录请求特殊处理：从响应头提取 Token 并存储
      const acessToken = response.headers.get('Authorization');
      if (acessToken && response.ok) {
        setToken(acessToken);
      }

      // 处理 401 未授权（Token 失效或不存在）
      if (response?.status === 401) {
        onLogout();
      }
      const res: InterfaceResult = (await response.json()) as any;
      // 转换数据格式 - (下划线 -> 小驼峰)
      const data = transformKeys({
        data: res.data,
        toSnake: false,
      });
      return {
        ...res,
        data,
      };
    },
  },
  timeout: 10000,
});

export default alovaInstance;
