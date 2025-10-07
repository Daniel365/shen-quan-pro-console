/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 活动管理相关类型定义
 */

/**
 * 活动列表查询参数接口
 */
export interface ActivityListParams extends PageQuery {
  /** 活动标题，支持模糊查询 */
  title?: string;
  /** 活动地点，支持模糊查询 */
  location?: string;
  /** 活动状态 */
  status?: number;
  /** 语言代码，如：zh-CN, en-US */
  language?: string;
  /** 开始时间范围 */
  startTimeRange?: [string, string];
}

/**
 * 封面图片数据结构接口
 */
export interface CoverImage {
  /** 图片URL */
  url: string;
  /** 图片类型：main(主封面)、banner(轮播图)、thumbnail(缩略图) */
  type?: 'main' | 'banner' | 'thumbnail';
  /** 排序权重 */
  sort?: number;
}

/**
 * 活动翻译数据结构接口
 */
export interface ActivityTranslationItem {
  /** 翻译唯一标识 */
  uuid?: string;
  /** 关联的活动UUID */
  activityUuid?: string;
  /** 语言代码 */
  language: string;
  /** 活动标题 */
  title: string;
  /** 活动描述 */
  description?: string;
  /** 封面图片数组 */
  coverImages?: CoverImage[];
}

/**
 * 活动数据结构接口
 */
export interface ActivityListItem {
  /** 活动唯一标识 */
  uuid: string;
  /** 基础价格 */
  basePrice: number;
  /** 男性价格 */
  malePrice: number;
  /** 女性价格 */
  femalePrice: number;
  /** 活动开始时间 */
  startTime: string;
  /** 活动结束时间 */
  endTime: string;
  /** 报名人数 */
  regCount?: number;
  /** 报名限制 */
  regLimit: number;
  /** 活动状态 */
  status: number;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
  /** 多语言翻译数据 */
  translations?: ActivityTranslationItem[];
}

/**
 * 活动创建参数接口
 */
export interface ActivityFormData {
  /** 活动唯一标识 */
  uuid?: string;
  /** 活动地点 */
  location: string;
  /** 活动开始时间 */
  startTime: string | null;
  /** 活动结束时间 */
  endTime: string | null;
  /** 报名限制 */
  regLimit: number;
  /** 基础价格 */
  basePrice: number;
  /** 男性价格 */
  malePrice: number;
  /** 女性价格 */
  femalePrice: number;
  /** 活动标签 */
  tags?: string[];
  /** 活动描述 */
  description?: string;
  /** 多语言翻译数据 */
  translations: ActivityTranslationItem[];
}

/**
 * 活动删除参数接口
 */
export interface ActivityDeleteParams {
  /** 活动UUID */
  uuid: string;
}

/**
 * 活动详情查询参数接口
 */
export interface ActivityDetailParams {
  /** 活动UUID */
  uuid: string;
}
