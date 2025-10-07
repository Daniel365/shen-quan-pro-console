<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 10:08:39
 * @Description: 活动管理表单页面
-->
<template>
  <div class="activity-form-page">
    <el-card class="form-card" shadow="never">
      <!-- 页面头部 -->
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="action-buttons">
            <el-button @click="goBack">
              {{ isReadonly ? $t('action.close') : $t('action.cancel') }}
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
        <!-- 地点设置 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 地点选择 -->
            <el-form-item :label="$t('activityManage.locationLabel')" prop="location">
              <el-input
                v-model="formData.location"
                :placeholder="$t('activityManage.locationPlaceholder')"
                :readonly="isReadonly"
                maxlength="200"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 价格设置 -->
        <el-form-item :label="$t('activityManage.priceLabel')">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="$t('activityManage.basePrice')" prop="basePrice">
                <el-input-number
                  v-model="formData.basePrice"
                  :min="0"
                  :precision="2"
                  :step="10"
                  :disabled="isReadonly"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('activityManage.malePrice')" prop="malePrice">
                <el-input-number
                  v-model="formData.malePrice"
                  :min="0"
                  :precision="2"
                  :step="10"
                  :disabled="isReadonly"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('activityManage.femalePrice')" prop="femalePrice">
                <el-input-number
                  v-model="formData.femalePrice"
                  :min="0"
                  :precision="2"
                  :step="10"
                  :disabled="isReadonly"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 时间设置 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 时间范围选择 -->
            <el-form-item :label="$t('activityManage.timeLabel')" prop="timeRange">
              <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                :disabled-date="disabledDate"
                @change="handleTimeRangeChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 名额和标签 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 名额设置 -->
            <el-form-item :label="$t('activityManage.quotaLabel')" prop="regLimit">
              <el-input-number
                v-model="formData.regLimit"
                :min="1"
                :max="1000"
                :disabled="actionType === ActionTypeEnum.DETAIL"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 标签选择 -->
            <el-form-item :label="$t('activityManage.tagsLabel')" prop="tags">
              <ApiSelect
                v-model="formData.tags"
                :api="tagManageApi.getList"
                :placeholder="$t('activityManage.tagsPlaceholder')"
                :disabled="isReadonly"
                multiple
                :data-handler="onHandlerTagList"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';

import { ActivityFormData, ActivityTranslationItem } from '@/api/app/activityManage/types';
import { TagListItem } from '@/api/app/tagManage/types';
import { isHasArrayData } from '@/utils/dataJudgment';

import LanguageForm from './components/LanguageForm.vue';

const { goBack, getQueryValue } = useRouteUtil();
const loading = ref(false);

// 从路由参数获取操作类型和活动ID
const actionType = computed<ActionTypeEnum>(
  () => getQueryValue('actionType') || ActionTypeEnum.CREATE
);

/** 活动uuid */
const activityUuId = computed<string>(() => getQueryValue('uuid'));

// 页面标题
const pageTitle = computed(() => {
  return getActionTitle(actionType.value);
});

// 是否为只读模式（详情页时禁用编辑）
const isReadonly = computed(() => actionType.value === ActionTypeEnum.DETAIL);

// 时间范围数据
const timeRange = ref<[string, string] | null>(null);

// 表单数据
const formData = reactive<ActivityFormData>({
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
});

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
const languageFormRefs = ref<FormInstance[]>([]);

const getRequiredMessage = (key: string) => i18nText(`activityManage.message.${key}.required`);

// 验证时间范围
const validateTimeRange = () => {
  if (!timeRange.value || timeRange.value.length !== 2) {
    return Promise.reject(new Error(i18nText('activityManage.message.timeRange.required')));
  }

  const [startTime, endTime] = timeRange.value;
  if (!startTime || !endTime) {
    return Promise.reject(new Error(i18nText('activityManage.message.timeRange.required')));
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return Promise.reject(new Error(i18nText('activityManage.message.timeRange.invalid')));
  }

  return Promise.resolve();
};
// 主表单验证规则
const mainFormRules = {
  basePrice: [{ message: getRequiredMessage('basePrice'), required: true, trigger: 'blur' }],
  femalePrice: [{ message: getRequiredMessage('femalePrice'), required: true, trigger: 'blur' }],
  location: [{ message: getRequiredMessage('location'), required: true, trigger: 'blur' }],
  malePrice: [{ message: getRequiredMessage('malePrice'), required: true, trigger: 'blur' }],
  regLimit: [{ message: getRequiredMessage('regLimit'), required: true, trigger: 'blur' }],
  timeRange: [{ required: true, trigger: 'change', validator: validateTimeRange }],
};

// 处理标签格式
const onHandlerTagList = (data: any) => {
  if (isHasArrayData(data)) {
    return data.map((item: TagListItem) => ({
      label: getLanguageObj(item.tagTranslations).name,
      value: item.uuid,
    }));
  }
  return [];
};

// 根据语言获取翻译数据
const getTranslationByLanguage = (language: string) => {
  return (
    formData.translations.find((t) => t.language === language) || {
      coverImages: [{ type: 'main', url: 'https://dummyimage.com/200x200' }],
      description: '',
      language,
      title: '',
    }
  );
};

// 设置翻译数据
const setTranslationByLanguage = (language: string, data: Partial<ActivityTranslationItem>) => {
  const index = formData.translations.findIndex((t) => t.language === language);
  if (index > -1) {
    Object.assign(formData.translations[index], data);
  } else {
    formData.translations.push({
      coverImages: [{ type: 'main', url: 'https://dummyimage.com/200x200' }],
      description: '',
      language,
      title: '',
      ...data,
    });
  }
};

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7;
};

// 时间范围变化处理
const handleTimeRangeChange = (value: [string, string] | null) => {
  if (value && value.length === 2) {
    formData.startTime = value[0];
    formData.endTime = value[1];
  } else {
    formData.startTime = null;
    formData.endTime = null;
  }
};

// 初始化时间范围数据
const initTimeRange = () => {
  if (formData.startTime && formData.endTime) {
    timeRange.value = [formData.startTime, formData.endTime];
  } else {
    timeRange.value = null;
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
    `确定要删除${getLanguageLabel(languageValue)}语言吗？删除后该语言的数据将丢失。`,
    '确认删除',
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
      const translationIndex = formData.translations.findIndex((t) => t.language === languageValue);
      if (translationIndex > -1) {
        formData.translations.splice(translationIndex, 1);
      }

      // 如果当前激活的是被删除的语言，切换到中文
      if (activeLanguage.value === languageValue) {
        activeLanguage.value = LanguageEnum.ZH;
      }

      ElMessage.success(`已删除${getLanguageLabel(languageValue)}语言`);
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
      coverImages: [{ type: 'main', url: 'https://dummyimage.com/200x200' }],
      description: '',
      title: '',
    });

    activeLanguage.value = languageValue;
    ElMessage.success(`已添加${languageToAdd.label}语言支持`);
  }
};

// 获取所有语言表单的验证
const validateAllLanguageForms = async () => {
  // 验证其他已启用的语言（如果添加了就必须填写）
  for (const lang of enabledLanguages.value) {
    // 其他语言必须有标题
    const translation = getTranslationByLanguage(lang.value);
    if (!translation?.title?.trim()) {
      ElMessage.error(`${lang.label}标题是必填项`);
      activeLanguage.value = lang.value;
      return false;
    }
    if (!isHasArrayData(translation?.coverImages)) {
      ElMessage.error(`${lang.label}图片是必填项`);
      activeLanguage.value = lang.value;
      return false;
    }
  }

  return true;
};

// 加载活动详情
const getDetails = async (uuid: string) => {
  loading.value = true;
  const response = await activityManageApi.getDetail({ uuid }).finally(() => {
    loading.value = false;
  });
  handleReturnResults({
    onSuccess: (res) => {
      // 处理多语言数据格式转换
      const data = res.data;
      Object.assign(formData, data);

      // 初始化时间范围
      initTimeRange();

      // 如果是复制操作，清空ID并修改标题
      if (actionType.value === ActionTypeEnum.COPY) {
        formData.uuid = undefined;
        // 修改所有语言的标题
        formData.translations.forEach((translation) => {
          if (translation.title) {
            translation.title = `${translation.title}_copy`;
          }
        });
      }
    },
    params: response,
  });
};

/**
 * 处理表单数据，将时间字段转换为ISO8601格式
 * @param formData - 原始表单数据
 * @returns 处理后的表单数据
 */
const processFormData = (formData: ActivityFormData) => {
  const processedData = { ...formData };

  // 循环processedData的键进行switch处理
  for (const key in processedData) {
    if (Object.prototype.hasOwnProperty.call(processedData, key)) {
      const value = processedData[key as keyof ActivityFormData];

      switch (key) {
        case 'startTime':
        case 'endTime':
          if (value && !isValidIsoDate(value as any)) {
            processedData[key] = formatIso86DateTime(value as string);
          }
          break;
        default:
          // 其他字段不做处理
          break;
      }
    }
  }

  return processedData;
};

// 提交表单
const handleSubmit = async () => {
  // 验证所有语言表单
  // const allLanguageFormsValid = await validateAllLanguageForms();
  // if (!allLanguageFormsValid) {
  //   return;
  // }
  // 验证主表单
  // if (!mainFormRef.value) return;
  // await mainFormRef.value.validate();

  loading.value = true;

  // 准备提交数据
  const submitData = processFormData(formData);
  console.log(`submitData->`, submitData);
  loading.value = false;

  // let result: any;
  // let messageKey: string;

  // switch (actionType.value) {
  //   case ActionTypeEnum.EDIT:
  //     result = await activityManageApi.onEdit(submitData).finally(() => {
  //       loading.value = false;
  //     });
  //     messageKey = 'action.updateSuccess';
  //     break;
  //   case ActionTypeEnum.CREATE:
  //   case ActionTypeEnum.COPY:
  //     result = await activityManageApi.onCreate(submitData).finally(() => {
  //       loading.value = false;
  //     });
  //     messageKey = 'action.createSuccess';
  //     break;
  //   default:
  //     loading.value = false;
  //     return;
  // }

  // handleReturnResults({
  //   onSuccess: (res) => {
  //     ElMessage.success(i18nText(messageKey));
  //     goBack();
  //   },
  //   params: result,
  // });
};

// 组件挂载时加载数据
onMounted(() => {
  if (actionType.value !== ActionTypeEnum.CREATE && activityUuId.value) {
    getDetails(activityUuId.value);
  }
});
</script>
