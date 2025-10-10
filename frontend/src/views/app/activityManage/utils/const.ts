import { ActivityFormData } from '@/api/app/activityManage/types';

export const defaultFormData: ActivityFormData = {
  basePrice: 0,
  endTime: null,
  femalePrice: 0,
  location: '',
  malePrice: 0,
  regLimit: 50,
  startTime: null,
  tags: [],
  translations: [
    {
      coverImages: [{ type: 'main', url: 'https://dummyimage.com/200x200' }],
      description: '',
      language: LanguageEnum.ZH,
      title: '',
    },
  ],
};
