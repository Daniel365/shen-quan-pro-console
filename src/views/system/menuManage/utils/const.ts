/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-07 19:52:13
 * @Description: 配置项
 */
import { FormTypeEnum } from "@/enums";

import { buttonPermissionOptions, menuTypeOptions, menuVisibleStatusOptions } from "./options";
import { MenuTypeEnum, MenuVisibleStatusEnum } from "./types";

// 默认表单
export const defaultFormData = {
  component: "Layout",
  icon: "",
  id: 0,
  keepAlive: 0,
  name: "",
  parentId: 0,
  permission: "",
  routeName: "",
  routePath: "",
  sort: 0,
  type: MenuTypeEnum.CATALOG,
  visibleStatus: MenuVisibleStatusEnum.SHOW,
};

// 表单字段配置
export const formFieldsConfig: Record<any, FormFieldConfig[]> = {
  // 公共字段 - 所有类型都需要
  common: [
    {
      key: "parentId",
      labelKey: "form.parentMenu",
      order: 1,
      required: false,
      type: FormTypeEnum.TREE_SELECT,
    },
    {
      key: "name",
      labelKey: "form.menuName",
      order: 2,
      required: true,
      type: FormTypeEnum.INPUT,
    },
    {
      key: "type",
      labelKey: "form.menuType",
      options: menuTypeOptions,
      order: 3,
      required: true,
      type: FormTypeEnum.RADIO_GROUP,
    },
    {
      key: "sort",
      labelKey: "form.sort",
      order: 99,
      required: true,
      type: FormTypeEnum.INPUT_NUMBER,
    },
    {
      key: "visibleStatus",
      labelKey: "form.visibleStatus",
      options: menuVisibleStatusOptions,
      order: 98,
      required: false,
      type: FormTypeEnum.RADIO_GROUP,
    },
  ],

  // 目录特有字段
  [MenuTypeEnum.CATALOG]: [
    {
      key: "routePath",
      labelKey: "form.routePath",
      order: 5,
      required: true,
      type: FormTypeEnum.INPUT,
    },
    {
      key: "icon",
      labelKey: "form.icon",
      order: 10,
      required: false,
      type: FormTypeEnum.CUSTOM,
    },
  ],

  // 菜单特有字段
  [MenuTypeEnum.MENU]: [
    {
      helpTips: "UserMange || UserMangeList",
      key: "routeName",
      labelKey: "form.routeName",
      order: 4,
      required: true,
      type: FormTypeEnum.INPUT,
    },
    {
      helpTips: "/system/userMange/list",
      key: "routePath",
      labelKey: "form.routePath",
      order: 5,
      required: true,
      type: FormTypeEnum.INPUT,
    },
    {
      inputAppend: ".vue",
      inputPrepend: "src/views/",
      key: "component",
      labelKey: "form.component",
      order: 6,
      required: true,
      type: FormTypeEnum.INPUT,
    },
    {
      key: "icon",
      labelKey: "form.icon",
      order: 10,
      required: false,
      type: FormTypeEnum.CUSTOM,
    },
  ],

  // 按钮特有字段
  [MenuTypeEnum.BUTTON]: [
    {
      key: "permission",
      labelKey: "form.permission",
      options: buttonPermissionOptions,
      order: 4,
      required: true,
      type: FormTypeEnum.SELECT,
    },
  ],

  // 接口特有字段
  [MenuTypeEnum.API]: [
    {
      key: "permission",
      labelKey: "form.permission",
      options: buttonPermissionOptions,
      order: 4,
      required: true,
      type: FormTypeEnum.SELECT,
    },
  ],

  // 外链特有字段
  [MenuTypeEnum.EXTERNAL]: [
    {
      key: "routePath",
      labelKey: "form.externalLink",
      order: 4,
      required: true,
      type: FormTypeEnum.INPUT,
    },
    {
      key: "icon",
      labelKey: "form.icon",
      order: 10,
      required: false,
      type: FormTypeEnum.CUSTOM,
    },
  ],
};

// 获取当前类型需要显示的字段
export const getFormFields = (type: number) => {
  const commonFields = formFieldsConfig.common;
  const typeFields = formFieldsConfig[type as keyof typeof formFieldsConfig] || [];
  return [...commonFields, ...typeFields].sort((a, b) => a.order - b.order);
};
