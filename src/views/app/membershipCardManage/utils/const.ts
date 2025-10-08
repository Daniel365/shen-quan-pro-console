import { MembershipCardFormData } from '@/api/app/membershipCardManage/types';

export const defaultFormData: MembershipCardFormData = {
  code: '',
  durationDays: 0,
  price: 0,
  roleUuid: '',
  sort: 0,
  status: EnabledStatusEnum.ENABLED,
  translations: [
    {
      coverImages: [
        {
          sort: 0,
          type: 'main',
          url: 'https://dummyimage.com/200x200',
        },
      ],
      description: '',
      language: LanguageEnum.ZH,
      name: '',
    },
  ],
  uuid: '',
};
