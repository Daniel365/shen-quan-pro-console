/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-07 18:27:52
 * @Description: 菜单类型声明
 */

// 菜单类型
export enum MenuTypeEnum {
  /** 目录 */
  CATALOG = 1,
  /** 菜单 */
  MENU = 2,
  /** 按钮 */
  BUTTON = 3,
  /** 接口 */
  API = 4,
  /** 外链 */
  EXTERNAL = 5,
}

/** 菜单显示状态 */
export enum MenuVisibleStatusEnum {
  HIDE = 0,
  SHOW = 1,
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: MenuTypeEnum;
  required: boolean;
  order: number;
  options?: OptionsItemType[];
}
