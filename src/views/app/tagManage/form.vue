<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 14:00:00
 * @Description: 标签管理表单组件 - 多语言版本
-->
<template>
  <div class="tag-form-component">
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
        />
      </el-tab-pane>

      <!-- 添加语言选择器 -->
      <el-tab-pane name="add" :disabled="true">
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
    <el-form
      ref="mainFormRef"
      :model="formData"
      :rules="mainFormRules"
      label-width="120px"
      label-position="top"
      class="common-form-section"
    >
      <!-- 标签类型 -->
      <el-form-item :label="$t('tagManage.typeLabel')" prop="type">
        <Select
          v-model="formData.type"
          :options="tagTypeOptions"
          :placeholder="$t('tagManage.typePlaceholder')"
          :disabled="isReadonly"
          width="100%"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item :label="$t('form.status')" prop="status">
        <RadioGroup v-model="formData.status" :options="enabledStatusOptions" />
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="text-right">
      <el-button @click="handleCancel">
        {{ $t('action.cancel') }}
      </el-button>
      <el-button
        v-if="actionType !== ActionTypeEnum.DETAIL"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ $t('action.submit') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';

import { TagFormData, TagListItem, TagTranslationItem } from '@/api/app/tagManage/types';

import LanguageForm from './components/LanguageForm.vue';
import { defaultFormData } from './utils/const';
import { TagTypeEnum } from './utils/enum';
import { tagTypeOptions } from './utils/options';

// 定义组件的props
interface Props {
  visible?: boolean;
  actionType?: ActionTypeEnum;
  detailsData?: TagListItem;
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

// 是否为只读模式（详情页时禁用编辑）
const isReadonly = computed(() => actionType.value === ActionTypeEnum.DETAIL);

// 表单数据
const formData = reactive<TagFormData>({ ...defaultFormData });

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

const getRequiredMessage = (key: string) => i18nText(`tagManage.message.${key}.required`);

// 主表单验证规则
const mainFormRules = {
  status: [{ message: getRequiredMessage('status'), required: true, trigger: 'change' }],
  type: [{ message: getRequiredMessage('type'), required: true, trigger: 'change' }],
};

// 根据语言获取翻译数据
const getTranslationByLanguage = (language: string) => {
  return (
    formData.tagTranslations.find((t) => t.language === language) || {
      description: '',
      language,
      name: '',
    }
  );
};

// 设置翻译数据
const setTranslationByLanguage = (language: string, data: Partial<TagTranslationItem>) => {
  const index = formData.tagTranslations.findIndex((t) => t.language === language);
  if (index > -1) {
    Object.assign(formData.tagTranslations[index], data);
  } else {
    formData.tagTranslations.push({
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
    i18nText('tagManage.deleteLanguageConfirm', { lang: getLanguageLabel(languageValue) }),
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
      const translationIndex = formData.tagTranslations.findIndex(
        (t) => t.language === languageValue
      );
      if (translationIndex > -1) {
        formData.tagTranslations.splice(translationIndex, 1);
      }

      // 如果当前激活的是被删除的语言，切换到中文
      if (activeLanguage.value === languageValue) {
        activeLanguage.value = LanguageEnum.ZH;
      }

      ElMessage.success(
        i18nText('tagManage.deleteLanguageSuccess', {
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
    result = await tagManageApi.onEdit(submitData).finally(() => {
      loading.value = false;
    });
  } else {
    result = await tagManageApi.onCreate(submitData).finally(() => {
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
  Object.assign(formData, {
    status: EnabledStatusEnum.ENABLED,
    tagTranslations: [
      {
        description: '',
        language: LanguageEnum.ZH,
        name: '',
      },
    ],
    type: TagTypeEnum.ACTIVITY,
  });

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
      // 如果有传入标签数据，设置表单数据
      Object.assign(formData, {
        ...newDetailsData,
        tagUuid: newDetailsData?.uuid,
      });

      // 更新启用的语言列表
      const usedLanguages = newDetailsData.tagTranslations?.map((t: any) => t.language) || [
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
