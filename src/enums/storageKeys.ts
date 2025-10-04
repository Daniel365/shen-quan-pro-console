/**
 * 存储键常量统一管理
 * 包括 localStorage、sessionStorage 等各种存储的键名
 */

/** 本地存储变量 */
export enum StorageKeyEnum {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
  REMEMBER_ME = 'remember_me',
}

// 🎨 系统设置相关
export const SHOW_TAGS_VIEW_KEY = 'showTagsView';
export const SHOW_APP_LOGO_KEY = 'showAppLogo';
export const SHOW_WATERMARK_KEY = 'showWatermark';
export const LAYOUT_KEY = 'layout';
export const SIDEBAR_COLOR_SCHEME_KEY = 'sidebarColorScheme';
export const THEME_KEY = 'theme';
export const THEME_COLOR_KEY = 'themeColor';

// 设置相关键集合
export const SETTINGS_KEYS = {
  LAYOUT: LAYOUT_KEY,
  SHOW_APP_LOGO: SHOW_APP_LOGO_KEY,
  SHOW_TAGS_VIEW: SHOW_TAGS_VIEW_KEY,
  SHOW_WATERMARK: SHOW_WATERMARK_KEY,
  SIDEBAR_COLOR_SCHEME: SIDEBAR_COLOR_SCHEME_KEY,
  THEME: THEME_KEY,
  THEME_COLOR: THEME_COLOR_KEY,
} as const;
