/*
 * @Description: 菜单管理相关类型定义
 */
import { MenuTypeEnum } from "@/views/menuManage/utils/types";

/**
 * 菜单列表查询参数接口
 */
export interface MenuListParams {
  /** 菜单名称，支持模糊查询 */
  name?: string;
  /** 菜单类型 */
  type?: MenuTypeEnum;
  /** 显示状态（0-隐藏，1-显示） */
  visible_status?: number;
}

/**
 * 菜单数据结构接口
 */
export interface MenuListItem {
  /** 菜单ID */
  id: number;
  /** 父级菜单ID（0表示顶级菜单） */
  parentId: number;
  /** 菜单名称 */
  name: string;
  /** 菜单类型（1-目录，2-菜单，3-按钮，4-接口，5-外链） */
  type: number;
  /** 路由名称（唯一） */
  routeName: string;
  /** 路由相对路径（如：/user/list） */
  routePath: string;
  /** Vue组件路径（如：src/views/user/list.vue） */
  component: string;
  /** 显示状态（0-隐藏，1-显示） */
  visibleStatus: number;
  /** 页面缓存状态（0-关闭，1-开启） */
  keepAlive: number;
  /** 菜单排序（数字越小排名越靠前） */
  sort: number;
  /** 菜单图标 */
  icon: string;
  /** 权限标识符 */
  permission: string;
  /** 子菜单列表 */
  children?: MenuListItem[];
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 树形选择器数据结构接口
 */
export interface TreeListItem {
  /** 显示文本 */
  label: string;
  /** 选项值 */
  value: number;
  /** 子节点列表 */
  children: TreeListItem[];
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 菜单表单数据接口
 */
export interface MenuFormProps {
  /** 菜单ID（编辑时必填） */
  id?: number;
  /** 父级菜单ID（0表示顶级菜单） */
  parentId?: number;
  /** 菜单名称 */
  name: string;
  /** 菜单类型（1-目录，2-菜单，3-按钮，4-接口，5-外链） */
  type: number;
  /** 路由名称（唯一） */
  routeName?: string;
  /** 路由路径 */
  routePath?: string;
  /** Vue组件路径 */
  component?: string;
  /** 显示状态（0-隐藏，1-显示） */
  visibleStatus?: number;
  /** 页面缓存状态（0-关闭，1-开启） */
  keepAlive?: number;
  /** 菜单排序值 */
  sort: number;
  /** 菜单图标 */
  icon?: string;
  /** 权限标识符 */
  permission?: string;
}

/**
 * 菜单创建参数接口
 */
export interface MenuCreateParams extends MenuFormProps {}

/**
 * 菜单编辑参数接口
 */
export interface MenuEditParams extends MenuFormProps {
  /** 菜单ID（编辑时必填） */
  id: number;
}

/**
 * 菜单删除参数接口
 */
export interface MenuDeleteParams {
  /** 菜单ID */
  id: number;
}
