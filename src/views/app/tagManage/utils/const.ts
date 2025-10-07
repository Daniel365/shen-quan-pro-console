import { TagTypeEnum } from './enum';

export const defaultFormData = {
  status: EnabledStatusEnum.ENABLED,
  tagTranslations: [
    {
      description: '',
      language: LanguageEnum.ZH,
      name: '',
    },
  ],
  type: TagTypeEnum.ACTIVITY,
};
