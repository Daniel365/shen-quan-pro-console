/**
 * 会员卡列表项
 */
export interface MembershipCardListItem {
  uuid: string;
  code: string;
  role_uuid: string;
  price: number;
  duration_days: number;
  sort: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  role?: {
    uuid: string;
    name: string;
  };
  translations: MembershipCardTranslationItem[];
}

/**
 * 封面图片项
 */
interface CoverImage {
  url: string;
  type: 'main' | 'banner' | 'thumbnail';
  sort: number;
}

/**
 * 会员卡翻译项
 */
export interface MembershipCardTranslationItem {
  uuid?: string;
  membership_card_uuid?: string;
  language: string;
  name: string;
  description?: string;
  coverImages?: CoverImage[];
}

/**
 * 会员卡列表请求参数
 */
export interface MembershipCardListParams {
  code?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

/**
 * 会员卡表单数据
 */
export interface MembershipCardFormData {
  uuid?: string;
  code: string;
  roleUuid: string;
  price: number;
  durationDays: number;
  sort: number;
  status: number;
  translations: MembershipCardTranslationItem[];
}

/**
 * 可用的会员卡列表项（供前端展示）
 */
export interface AvailableMembershipCardItem {
  uuid: string;
  code: string;
  role_uuid: string;
  price: number;
  duration_days: number;
  translations: MembershipCardTranslationItem[];
}
