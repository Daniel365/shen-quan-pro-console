import { LocationQuery, RouteLocationRaw, useRoute, useRouter } from 'vue-router';

// 路由参数类型定义
type RouteParams = Record<string, string | number | boolean>;

/**
 * 路由工具函数集合
 */
export function useRouteUtil() {
  const router = useRouter();
  const route = useRoute();

  /**
   * 跳转到指定路由
   * @param name 路由名称
   * @param params 路由参数
   * @param query 查询参数
   */
  const goToPage = (config: RouteLocationRaw) => {
    return router.push(config).catch(() => {});
  };

  /**
   * 替换当前路由
   * @param name 路由名称
   * @param params 路由参数
   * @param query 查询参数
   */
  const goReplace = (config: RouteLocationRaw) => {
    return router.replace(config).catch(() => {});
  };

  /**
   * 返回上一页
   */
  const goBack = () => {
    router.back();
  };

  /**
   * 获取当前路由参数
   * @returns 路由参数对象
   */
  const getParams = <T = RouteParams>() => {
    return route.params as unknown as T;
  };
  /**
   * 获取当前路由查询参数
   * @returns 路由指定参数
   */
  const getParamsValue = <T = RouteParams>(key: string) => {
    return getParams()[key] as T;
  };

  /**
   * 获取当前路由查询参数
   * @returns 查询参数对象
   */
  const getQuery = <T = RouteParams>() => {
    return route.query as unknown as T;
  };
  /**
   * 获取当前路由查询参数
   * @returns 查询指定参数
   */
  const getQueryValue = <T = RouteParams>(key: string) => {
    return getQuery()[key] as T;
  };

  /**
   * 检查当前路由是否为指定名称
   * @param name 路由名称
   * @returns 是否匹配
   */
  const isRoute = (name: string) => {
    return route.name === name;
  };

  /**
   * 解析重定向目标
   *
   * @param query 路由查询参数
   * @returns 标准化后的路由地址
   */
  const resolveRedirectTarget = (query: LocationQuery): RouteLocationRaw => {
    // 默认跳转路径
    const defaultPath = '/';

    // 获取原始重定向路径
    const rawRedirect = (query.redirect as string) || defaultPath;

    try {
      // 6. 使用Vue Router解析路径
      const resolved = router.resolve(rawRedirect);
      return {
        path: resolved.path,
        query: resolved.query,
      };
    } catch {
      // 7. 异常处理：返回安全路径
      return { path: defaultPath };
    }
  };

  return {
    getParams,
    getParamsValue,
    getQuery,
    getQueryValue,
    goBack,
    goReplace,
    goToPage,
    isRoute,
    resolveRedirectTarget,
    route,
    router,
  };
}
