/**
 * 菜单工具类
 * 提供菜单数据结构转换相关方法
 */
import { MenuAttributes } from '../models/Menu';
interface MenuListItem extends MenuAttributes {
  children: MenuAttributes[];
}
/** 生成路由树 */
export function buildRouterTree(menus: any[]) {
  const menuMap = new Map();
  const rootMenus: any[] = [];

  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu.toJSON(), children: [] });
  });

  menus.forEach((menu) => {
    const menuItem: MenuListItem = menuMap.get(menu.id);
    const newItem = {
      name: menuItem.route_name,
      path: menuItem.route_path,
      component: menuItem.component,
      meta: {
        alwaysShow: false,
        hidden: false,
        icon: menuItem.icon,
        params: null,
        title: menuItem.name,
      },
      children: menuItem.children,
    };
    if (menu.parent_id && menuMap.has(menu.parent_id)) {
      menuMap.get(menu.parent_id).children.push(newItem);
    } else {
      rootMenus.push(newItem);
    }
  });

  return rootMenus;
}
/**
 * 构建菜单树
 * @param menus 菜单数据数组
 * @returns 树形结构的菜单数组
 */
export function buildMenuTree(menus: any[]) {
  const menuMap = new Map();
  const rootMenus: any[] = [];

  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu.toJSON(), children: [] });
  });

  menus.forEach((menu) => {
    const menuItem = menuMap.get(menu.id);
    const newItem = {
      label: menuItem.name,
      value: menuItem.id,
      children: menuItem.children,
    };
    if (menu.parent_id && menuMap.has(menu.parent_id)) {
      menuMap.get(menu.parent_id).children.push(newItem);
    } else {
      rootMenus.push(newItem);
    }
  });

  return rootMenus;
}

/**
 * 构建菜单列表
 * @param menus 菜单数据数组
 * @returns 嵌套结构的菜单数组
 */
export function buildMenuList(menus: any[]) {
  const menuMap = new Map();
  const rootMenus: any[] = [];

  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu.toJSON(), children: [] });
  });

  menus.forEach((menu) => {
    const menuItem = menuMap.get(menu.id);
    // 当父级id空时
    if (menuItem.parent_id === null) {
      menuItem.parent_id = 0;
    }
    if (menu.parent_id && menuMap.has(menu.parent_id)) {
      menuMap.get(menu.parent_id).children.push(menuItem);
    } else {
      rootMenus.push(menuItem);
    }
  });

  return rootMenus;
}
