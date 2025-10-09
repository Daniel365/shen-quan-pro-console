/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 14:00:00
 * @Description: 角色管理常量定义
 */
import { RoleFormData } from '@/api/app/roleManage/types';
import { LanguageEnum } from '@/enums';
import { EnabledStatusEnum } from '@/enums';

/**
 * 默认表单数据
 */
export const defaultFormData: RoleFormData = {
  code: '',
  menuIds: [],
  profitRatio: 0,
  roleTranslations: [
    {
      description: '',
      language: LanguageEnum.ZH,
      name: '',
    },
  ],
  status: EnabledStatusEnum.ENABLED,
};