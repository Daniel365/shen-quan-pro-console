/**
 * 标签列表项
 */
export interface TagListItem {
  uuid: string;
  type: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  tagTranslations: TagTranslationItem[];
}

/**
 * 标签翻译项
 */
export interface TagTranslationItem {
  uuid?: string;
  tag_uuid?: string;
  language: string;
  name: string;
  description?: string;
}

/**
 * 标签列表请求参数
 */
export interface TagListParams {
  name?: string;
  type?: number;
  status?: number;
  page?: number;
  pageSize?: number;
}

/**
 * 标签表单数据
 */
export interface TagFormData {
  tagUuid?: string;
  type: number;
  status: number;
  tagTranslations: TagTranslationItem[];
}

/**
 * 标签类型选项
 */
export interface TagTypeOptions {
  label: string;
  value: number;
}
