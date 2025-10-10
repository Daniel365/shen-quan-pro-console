<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 14:00:00
 * @Description: 角色管理表单组件 - 多语言版本
-->
<template>
  <div class="role-form-page">
    <!-- 语言切换标签 -->
    <el-tabs v-model="activeLanguage" type="card" @tab-change="handleLanguageChange">
      <el-tab-pane v-for="item in enabledLanguages" :key="item.value" :name="item.value">
        <template #label>
          <span class="language-tab-label">
            {{ item.labelKey ? i18nText(item.labelKey) : item.label }}
            <el-link
              v-if="item.value !== LanguageEnum.ZH"
              class="ml-1 v--5%!"
              underline="never"
              @click.stop="handleDeleteLanguage(item.value)"
            >
              <IconFont name="close" />
            </el-link>
          </span>
        </template>
        <!-- 语言特定的表单 -->
        <LanguageForm
          ref="languageFormRefs"
          :form-data="getTranslationByLanguage(item.value)"
          :action-type="actionType"
          :language="item.value"
          :disabled="isReadonly"
        />
      </el-tab-pane>

      <!-- 添加语言选择器 -->
      <el-tab-pane v-if="!isReadonly" name="add" :disabled="true">
        <template #label>
          <el-dropdown trigger="click" :disabled="!canAddLanguage" @command="handleAddLanguage">
            <el-button type="text" size="small" :disabled="!canAddLanguage">
              <IconFont name="plus" font-size="12px" />
              {{ i18nText('action.addLanguage') }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="item in availableLanguages"
                  :key="item.value"
                  :command="item.value"
                  :disabled="!canAddLanguage"
                >
                  {{ item.labelKey ? i18nText(item.labelKey) : item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 通用信息（不属于任何语言） -->
    <FormGroup
      ref="mainFormRef"
      :model-value="formData"
      :form-fields="mainFormFields"
      :form-rules="mainFormRules"
      label-width="120px"
      label-position="top"
      :disabled="isReadonly"
      @update:model-value="(val) => Object.assign(formData, val)"
    />

    <div class="text-align-right mt-10">
      <el-button @click="handleCancel">
        {{ isReadonly ? i18nText('action.close') : i18nText('action.cancel') }}
      </el-button>
      <el-button
        v-if="actionType !== ActionTypeEnum.DETAIL"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ i18nText('action.submit') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';

// type
import { RoleFormData, RoleListItem, RoleTranslationItem } from '@/api/app/roleManage/types';

import LanguageForm from './components/LanguageForm.vue';
import { defaultFormData } from './utils/const';

// 定义组件的props
interface Props {
  visible?: boolean;
  actionType?: ActionTypeEnum;
  detailsData?: RoleListItem;
}

const props = withDefaults(defineProps<Props>(), {
  actionType: ActionTypeEnum.CREATE,
  detailsData: undefined,
  visible: false,
});

// 定义emit事件
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const loading = ref(false);

// 使用props的操作类型
const actionType = computed(() => props.actionType);

// 页面标题
const pageTitle = computed(() => {
  return getActionTitle(actionType.value);
});

// 是否为只读模式（详情页时禁用编辑）
const isReadonly = computed(() => actionType.value === ActionTypeEnum.DETAIL);

// 表单数据
const formData = reactive<RoleFormData>({ ...defaultFormData });

// 启用的语言列表（支持动态添加）
const enabledLanguages = ref<OptionsItemType[]>([
  languageOptions.find((item) => item.value === LanguageEnum.ZH)!,
]);

// 可添加的语言列表
const availableLanguages = computed(() =>
  languageOptions.filter(
    (item) => !enabledLanguages.value.some((enabledLang) => enabledLang.value === item.value)
  )
);

// 是否可以添加更多语言
const canAddLanguage = computed(() => availableLanguages.value.length > 0);

// 当前激活的语言
const activeLanguage = ref(LanguageEnum.ZH);

// 主表单引用
const mainFormRef = ref<FormInstance>();

// 语言表单引用数组
const languageFormRefs = ref<FormInstance[]>();

const getRequiredMessage = (key: string) => i18nText(`roleManage.message.${key}.required`);
const getMaxLengthMessage = (key: string) => i18nText(`roleManage.message.${key}.maxLength`);

// 主表单字段配置
const mainFormFields = computed(() => [
  {
    key: 'code',
    label: i18nText('form.roleCode'),
    maxlength: 100,
    placeholder: i18nText('form.enterRoleCode'),
    required: true,
    showWordLimit: true,
    type: FormTypeEnum.INPUT,
    disabled: isReadonly.value,
  },
  {
    key: 'profitRatio',
    label: i18nText('roleManage.profitRatio'),
    min: 0,
    max: 100,
    placeholder: i18nText('roleManage.enterProfitRatio'),
    precision: 2,
    step: 0.1,
    required: true,
    type: FormTypeEnum.INPUT_NUMBER,
    append: '%',
  },
  {
    key: 'status',
    label: i18nText('form.status'),
    options: enabledStatusOptions,
    required: true,
    type: FormTypeEnum.RADIO_GROUP,
  },
]);

// 主表单验证规则
const mainFormRules = {
  code: [
    { message: getRequiredMessage('roleCode'), required: true, trigger: 'blur' },
    { max: 100, message: getMaxLengthMessage('roleCode'), trigger: 'blur' },
  ],
  profitRatio: [
    {
      trigger: 'blur',
      validator: (rule: any, value: number, callback: any) => {
        if (value === undefined || value === null) {
          return callback(new Error(getRequiredMessage('profitRatio')));
        }
        if (value < 0 || value > 100) {
          return callback(new Error(i18nText('roleManage.message.profitRatio.range')));
        }
        callback();
      },
    },
  ],
  status: [{ message: getRequiredMessage('status'), required: true, trigger: 'change' }],
};

// 根据语言获取翻译数据
const getTranslationByLanguage = (language: string) => {
  return (
    formData.roleTranslations.find((t) => t.language === language) || {
      description: '',
      language,
      name: '',
    }
  );
};

// 设置翻译数据
const setTranslationByLanguage = (language: string, data: Partial<RoleTranslationItem>) => {
  const index = formData.roleTranslations.findIndex((t) => t.language === language);
  if (index > -1) {
    Object.assign(formData.roleTranslations[index], data);
  } else {
    formData.roleTranslations.push({
      description: '',
      language,
      name: '',
      ...data,
    });
  }
};

// 语言切换处理
const handleLanguageChange = (language: LanguageEnum | any) => {
  if (language) {
    activeLanguage.value = language;
  }
};

// 删除语言
const handleDeleteLanguage = (languageValue: LanguageEnum) => {
  ElMessageBox.confirm(
    i18nText('roleManage.deleteLanguageConfirm', { lang: getLanguageLabel(languageValue) }),
    i18nText('action.confirmDelete'),
    {
      type: 'warning',
    }
  )
    .then(() => {
      // 从启用语言列表中移除
      const index = enabledLanguages.value.findIndex((lang) => lang.value === languageValue);
      if (index > -1) {
        enabledLanguages.value.splice(index, 1);
      }

      // 从翻译数据中移除
      const translationIndex = formData.roleTranslations.findIndex(
        (t) => t.language === languageValue
      );
      if (translationIndex > -1) {
        formData.roleTranslations.splice(translationIndex, 1);
      }

      // 如果当前激活的是被删除的语言，切换到中文
      if (activeLanguage.value === languageValue) {
        activeLanguage.value = LanguageEnum.ZH;
      }

      ElMessage.success(
        i18nText('roleManage.deleteLanguageSuccess', {
          lang: getLanguageLabel(languageValue),
        })
      );
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 获取语言标签
const getLanguageLabel = (languageValue: LanguageEnum) => {
  const language = enabledLanguages.value.find((lang) => lang.value === languageValue);
  return language ? language.label : languageValue;
};

// 添加语言
const handleAddLanguage = (languageValue: LanguageEnum) => {
  const languageToAdd = availableLanguages.value.find((lang) => lang.value === languageValue);

  if (languageToAdd) {
    enabledLanguages.value.push(languageToAdd);

    // 初始化新语言的数据
    setTranslationByLanguage(languageValue, {
      description: '',
      name: '',
    });

    activeLanguage.value = languageValue;
    ElMessage.success(`已添加${languageToAdd.label}语言支持`);
  }
};

// 获取所有语言表单的验证
const validateAllLanguageForms = async () => {
  // 验证其他已启用的语言（如果添加了就必须填写）
  for (const lang of enabledLanguages.value) {
    // 其他语言必须有名称
    const translation = getTranslationByLanguage(lang.value);
    if (!translation?.name?.trim()) {
      ElMessage.error(`${lang.label}名称是必填项`);
      activeLanguage.value = lang.value;
      return false;
    }
  }

  return true;
};

// 提交表单
const handleSubmit = async () => {
  // 验证所有语言表单
  const allLanguageFormsValid = await validateAllLanguageForms();
  if (!allLanguageFormsValid) {
    return;
  }
  // 验证主表单
  if (!mainFormRef.value) return;
  await mainFormRef.value.validate();

  loading.value = true;

  // 准备提交数据
  const submitData = { ...formData };

  let result: any;
  if (actionType.value === ActionTypeEnum.EDIT) {
    result = await appRoleManageApi.onEdit(submitData).finally(() => {
      loading.value = false;
    });
  } else {
    result = await appRoleManageApi.onCreate(submitData).finally(() => {
      loading.value = false;
    });
  }

  handleReturnResults({
    onSuccess: (res) => {
      emit('success');
      const messageKey =
        actionType.value === ActionTypeEnum.EDIT ? 'action.updateSuccess' : 'action.createSuccess';
      ElMessage.success(i18nText(messageKey));
    },
    params: result,
  });
};

// 取消操作
const handleCancel = () => {
  emit('cancel');
};

// 重置表单数据
const resetForm = () => {
  // 重置主表单数据
  Object.assign(formData, defaultFormData);

  // 重置启用的语言列表
  enabledLanguages.value = [languageOptions.find((item) => item.value === LanguageEnum.ZH)!];

  // 重置当前激活语言
  activeLanguage.value = LanguageEnum.ZH;
};

// 监听detailsData变化，当有数据时加载表单数据
watch(
  () => props.detailsData,
  (newDetailsData) => {
    if (newDetailsData && actionType.value !== ActionTypeEnum.CREATE) {
      // 如果有传入角色数据，设置表单数据
      Object.assign(formData, {
        ...newDetailsData,
        roleUuid: newDetailsData?.uuid,
      });

      // 更新启用的语言列表
      const usedLanguages = newDetailsData.roleTranslations?.map((t: any) => t.language) || [
        LanguageEnum.ZH,
      ];
      enabledLanguages.value = languageOptions.filter((lang) => usedLanguages.includes(lang.value));
    }
  },
  { immediate: true }
);

// 监听取消事件，重置表单数据
watch(
  () => props.visible,
  () => {
    resetForm();
  }
);
</script>
