/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 10:49:45
 * @Description: 本地存储变量
 */
// 超级管理员
export const ROLE_ROOT = 'ADMIN';

export const isRoot = (val: any[]) => {
  return val?.includes(ROLE_ROOT);
};
