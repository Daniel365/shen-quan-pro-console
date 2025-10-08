/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-27 18:20:18
 * @Description:  操作日志 - 相关处理逻辑
 */
import { Request } from 'express';

// 自动生成操作描述的工具函数
export interface ActionDescriptionOptions {
  method?: string;
  path?: string;
  action?: string;
  resource?: string;
}

// 方法映射表
const methodMap: Record<string, string> = {
  POST: '创建',
  PUT: '更新',
  DELETE: '删除',
  GET: '查询',
  PATCH: '修改',
};

// 操作映射表
const actionMap: Record<string, string> = {
  update: '更新',
  create: '创建',
  delete: '删除',
  'edit-password': '修改密码',
  'edit-profile': '修改个人信息',
  send: '发送',
  read: '标记已读',
  'read-all': '标记全部已读',
  'assign-perm': '分配权限',
  list: '查询列表',
  details: '查看详情',
  info: '查看信息',
  count: '统计数量',
};

// 资源名称映射表
const resourceMap: Record<string, string> = {
  user: '用户',
  role: '角色',
  menu: '菜单',
  account: '账号',
  notification: '通知',
  operation: '操作',
  admin: '管理员',
};

/**
 * 从路径解析资源和操作信息
 * @param path 请求路径
 * @returns 资源和操作信息
 */
export function parseActionFromPath(path: string): { resource?: string; action?: string } {
  const segments = path.split('/').filter(Boolean);

  return {
    resource: segments[segments.length - 2],
    action: segments[segments.length - 1],
  };
}
/**
 * 自动生成操作描述
 * @param options 生成选项
 * @returns 生成的操作描述
 */
export function generateActionDescription(options: ActionDescriptionOptions): string {
  const { method, path, action, resource } = options;

  // 如果有直接提供的动作和资源，优先使用
  if (action && resource) {
    const verb = actionMap[action] || action;
    const resourceName = resourceMap[resource] || resource;

    return `${verb}${resourceName}`;
  }

  // 从路径解析资源名称和操作
  if (path && method) {
    const { resource: pathResource, action: pathAction } = parseActionFromPath(path);

    const verb = (pathAction && actionMap[pathAction]) || methodMap[method] || '操作';
    const resourceName = (pathResource && resourceMap[pathResource]) || pathResource || '数据';

    return `${verb}${resourceName}`;
  }

  // 如果只有方法，使用默认描述
  if (method) {
    const verb = methodMap[method] || '操作';
    return `${verb}数据`;
  }

  return '执行操作';
}

// 过滤掉敏感字段
const sensitiveFields = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'pwd',
  'pass',
  'credential',
  'auth',
  'login',
  'signature',
];

// 获取安全的请求参数（排除敏感信息）
export function getSafeRequestParams(req: Request): any {
  try {
    const params: any = {};

    // 获取查询参数
    if (Object.keys(req.query || {}).length > 0) {
      params.query = req.query;
    }

    // 获取请求体（排除敏感字段）
    if (req.body && Object.keys(req.body).length > 0) {
      const safeBody = { ...req.body };

      sensitiveFields.forEach((field) => {
        if (safeBody[field] !== undefined) {
          safeBody[field] = '***FILTERED***';
        }
      });

      params.body = safeBody;
    }

    // 获取路由参数
    if (req.params && Object.keys(req.params).length > 0) {
      params.params = req.params;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  } catch (error) {
    console.error('获取请求参数失败:', error);
    return undefined;
  }
}

// 获取安全的响应数据（排除敏感信息）
export function getSafeResponseData(body: any): any {
  try {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const safeBody = { ...body };

    const filterSensitiveData = (obj: any) => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
            obj[key] = '***FILTERED***';
          } else if (typeof obj[key] === 'object') {
            filterSensitiveData(obj[key]);
          }
        });
      }
    };

    filterSensitiveData(safeBody);

    return safeBody;
  } catch (error) {
    console.error('获取响应数据失败:', error);
    return body;
  }
}
