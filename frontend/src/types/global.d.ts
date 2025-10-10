/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 19:29:39
 * @Description: 全局类型声明
 */
/**
 * 全局类型声明文件
 * 包含系统中通用的类型定义
 */
import { ButtonProps } from 'element-plus';

import type { LayoutMode, SidebarColor, ThemeMode } from '@/enums';
declare global {
  /**
   * 系统设置
   */
  interface AppSettings {
    /** 系统标题 */
    title: string;
    /** 系统版本 */
    version: string;
    /** 是否显示设置 */
    showSettings: boolean;
    /** 是否显示多标签导航 */
    showTagsView: boolean;
    /** 是否显示应用Logo */
    showAppLogo: boolean;
    /** 导航栏布局(left|top|mix) */
    layout: LayoutMode;
    /** 主题颜色 */
    themeColor: string;
    /** 主题模式(dark|light) */
    theme: ThemeMode;
    /** 布局大小(default |large |small) */
    size: string;
    /** 语言( zh-cn| en) */
    language: string;
    /** 是否显示水印 */
    showWatermark: boolean;
    /** 水印内容 */
    watermarkContent: string;
    /** 侧边栏配色方案 */
    sidebarColorScheme: SidebarColor;
  }
  /**
   * 响应数据
   */
  interface InterfaceResult<T = any> {
    code: number;
    data: T;
    success: boolean;
    message: string;
    dateTime: string;
    timestamp: number;
  }

  /**
   * 分页查询参数
   */
  interface PageQuery {
    /** 当前页码 */
    page?: number;
    /** 每页条数 */
    pageSize?: number;
  }

  /** 接口返回的分页信息 */
  interface PageInfo extends PageQuery {
    /** 总条数 */
    total: number;
  }
  /**
   * 分页响应对象
   */
  interface PageResult<T> {
    /** 数据列表 */
    list: T[];
    /** 分页信息 */
    pageInfo: PageInfo;
  }
  /**
   * 单选、多选、下拉选项数据类型
   */
  interface OptionsItemType {
    /** 选项值 */
    value: any;
    /** 选项文本 */
    label: string;
    /** 国际化key */
    labelKey?: string;
    /** 选项颜色（用于状态显示） */
    color?: string;
    /** 选项主题（用于按钮等组件） */
    theme?: ButtonProps['type'] | unknown;
    /** 子选项列表 */
    children?: OptionsItemType[];
    /** 是否禁用 */
    disabled?: boolean;
  }

  /** 按钮组 */
  interface ButtonGroupOptions {
    label?: string;
    labelKey?: string;
    value: string;
    permission: any[];
    type?: ButtonProps['type'];
    disabled?: boolean;
    icon?: string; // iconFont图标名称
    isShow?: (record: any) => void;
    handler?: (record: any) => void;
    // 路由跳转相关
    to?: string; // 路由路径
    query?: Record<string, any>; // 路由参数
  }

  /**
   * 表单字段配置接口
   */
  interface FormFieldConfig {
    /** 字段key */
    key: string;
    /** 字段标签 */
    labelKey: string;
    /** 字段类型 */
    type: string;
    /** 占位符 */
    placeholder?: string;
    /** 选项数据（适用于select、radio等） */
    options?: OptionsItemType[] | { label: string; options: OptionsItemType[] }[];
    groupOptions?: { label: string; options: OptionsItemType[] }[];
    /** 是否必填 */
    required?: boolean;
    /** 验证规则 */
    rules?: any[];
    /** 帮助提示 */
    helpTips?: string;
    /** 字段顺序 */
    order: number;
    /** 输入框装饰器 */
    inputPrepend?: string;
    inputAppend?: string;
  }
}

export {};
