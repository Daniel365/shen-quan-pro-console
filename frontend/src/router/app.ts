import { RouterPath } from '@/enums';

export default [
  {
    component: () => import('@/views/app/activityManage/form.vue'),
    name: '活动表单',
    path: RouterPath.ACTIVITY_FORM,
  },
  {
    component: () => import('@/views/app/membershipCardManage/form.vue'),
    name: '会员卡表单',
    path: RouterPath.MEMBERSHIP_CARD_FORM,
  },
];
