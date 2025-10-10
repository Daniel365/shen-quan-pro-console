import { RouterPath } from '@/enums';

export default [
  // {
  //   component: () => import('@/views/system/userManage/list.vue'),
  //   name: '用户管理',
  //   path: RouterPath.USER_MANAGE_LIST,
  // },
  // {
  //   component: () => import('@/views/system/roleManage/list.vue'),
  //   name: '角色管理',
  //   path: RouterPath.ROLE_MANAGE_LIST,
  // },
  // {
  //   component: () => import('@/views/system/menuManage/list.vue'),
  //   name: '菜单管理',
  //   path: RouterPath.MENU_MANAGE_LIST,
  // },
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
];
