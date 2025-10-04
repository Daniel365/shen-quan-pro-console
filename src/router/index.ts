/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-27 18:27:04
 * @Description: 路由初始化
 */

import type { App } from 'vue';

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { RouterPath } from '@/enums';

import admin from './admin';

export const constantRoutes: RouteRecordRaw[] = [
  {
    children: [
      {
        component: () => import('@/views/home/index.vue'),
        name: '首页',
        path: RouterPath.HOME,
      },
      // {
      //   path: RouterPath.USER_MANAGE_LIST,
      //   name: '用户管理',
      //   component: () => import('@/views/system/userManage/list.vue'),
      // },
      // {
      //   path: RouterPath.ROLE_MANAGE_LIST,
      //   name: '角色管理',
      //   component: () => import('@/views/system/roleManage/list.vue'),
      // },
      // {
      //   path: RouterPath.MENU_MANAGE_LIST,
      //   name: "菜单管理",
      //   component: () => import("@/views/system/menuManage/list.vue"),
      // },
      {
        component: () => import('@/views/errorPage/404.vue'),
        meta: { hidden: true },
        path: '/404',
      },
      {
        component: () => import('@/views/system/notificationManage/list.vue'),
        name: '消息通知列表',
        path: RouterPath.NOTIFICATION_LIST,
      },
      {
        component: () => import('@/views/account/profile.vue'),
        name: '个人中心',
        path: RouterPath.ACCOUNT_PROFILE,
      },
    ],
    component: import('@/layouts/index.vue'),
    name: 'layout',
    path: '/',
    redirect: RouterPath.HOME,
  },

  ...admin,
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
