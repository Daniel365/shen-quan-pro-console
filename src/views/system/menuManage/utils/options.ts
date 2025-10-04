/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 22:34:36
 * @Description: 选项
 */
import { MenuTypeEnum, MenuVisibleStatusEnum } from './types';

export const menuTypeOptions: OptionsItemType[] = [
  {
    label: '目录',
    labelKey: 'menuManage.catalog',
    theme: 'warning',
    value: MenuTypeEnum.CATALOG,
  },
  {
    label: '菜单',
    labelKey: 'menuManage.menu',
    theme: 'success',
    value: MenuTypeEnum.MENU,
  },
  {
    label: '按钮',
    labelKey: 'menuManage.button',
    theme: 'danger',
    value: MenuTypeEnum.BUTTON,
  },
  {
    label: '接口',
    labelKey: 'menuManage.interface',
    theme: 'primary',
    value: MenuTypeEnum.API,
  },
  // {
  //   label: "外链",
  //   labelKey: "menuManage.externalLink",
  //   value: MenuTypeEnum.EXTERNAL,
  //   theme: "default",
  // },
];

/**菜单显示隐藏 */
export const menuVisibleStatusOptions = [
  {
    color: 'green',
    label: '显示',
    labelKey: 'form.show',
    value: MenuVisibleStatusEnum.SHOW,
  },
  {
    color: 'red',
    label: '隐藏',
    labelKey: 'form.hide',
    value: MenuVisibleStatusEnum.HIDE,
  },
];

/** 按钮权限标识 */
export const buttonPermissionOptions = [
  {
    label: '系统管理',
    labelKey: 'perm.system',
    options: [
      {
        label: '用户编辑',
        labelKey: 'perm.user.edit',
        value: RequestPath.USER_UPDATE,
      },
      {
        label: '用户删除',
        labelKey: 'perm.user.delete',
        value: RequestPath.USER_DELETE,
      },
      {
        label: '角色创建',
        labelKey: 'perm.role.create',
        value: RequestPath.ROLE_CREATE,
      },
      {
        label: '角色编辑',
        labelKey: 'perm.role.edit',
        value: RequestPath.ROLE_UPDATE,
      },
      {
        label: '角色删除',
        labelKey: 'perm.role.delete',
        value: RequestPath.ROLE_DELETE,
      },
      {
        label: '菜单创建',
        labelKey: 'perm.menu.create',
        value: RequestPath.MENU_CREATE,
      },
      {
        label: '菜单编辑',
        labelKey: 'perm.menu.edit',
        value: RequestPath.MENU_UPDATE,
      },
      {
        label: '菜单删除',
        labelKey: 'perm.menu.delete',
        value: RequestPath.MENU_DELETE,
      },
    ],
  },
  {
    label: '小程序管理',
    labelKey: 'perm.app',
    options: [
      {
        label: '用户编辑',
        labelKey: 'perm.user.edit',
        value: RequestPath.APP_USER_UPDATE,
      },
      {
        label: '用户删除',
        labelKey: 'perm.user.delete',
        value: RequestPath.APP_USER_DELETE,
      },
      {
        label: '角色创建',
        labelKey: 'perm.role.create',
        value: RequestPath.APP_ROLE_CREATE,
      },
      {
        label: '角色编辑',
        labelKey: 'perm.role.edit',
        value: RequestPath.APP_ROLE_UPDATE,
      },
      {
        label: '角色删除',
        labelKey: 'perm.role.delete',
        value: RequestPath.APP_ROLE_DELETE,
      },
    ],
  },
];
