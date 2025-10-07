<template>
  <!-- 通用表单页面组件 -->
  <div class="form-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ pageTitle }}</h2>
      <el-button v-if="actionType !== ActionTypeEnum.DETAIL" @click="handleBack">
        {{ $t('action.back') }}
      </el-button>
      <el-button v-else type="primary" @click="handleBack">
        {{ $t('action.close') }}
      </el-button>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-width="labelWidth"
        :disabled="actionType === ActionTypeEnum.DETAIL"
      >
        <template v-for="item in formFields" :key="item.key">
          <el-form-item :label="getFieldLabel(item)" :prop="item.key" :required="item.required">
            <!-- 输入框 -->
            <el-input
              v-if="item.type === FormTypeEnum.INPUT"
              v-model="formData[item.key]"
              :placeholder="getFieldPlaceholder(item)"
              :maxlength="item.maxlength"
              :show-word-limit="item.showWordLimit"
              :readonly="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="item.type === FormTypeEnum.INPUT_NUMBER"
              v-model="formData[item.key]"
              :placeholder="getFieldPlaceholder(item)"
              :min="item.min"
              :max="item.max"
              :disabled="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- 文本域 -->
            <el-input
              v-else-if="item.type === FormTypeEnum.TEXT_AREA"
              v-model="formData[item.key]"
              type="textarea"
              :placeholder="getFieldPlaceholder(item)"
              :maxlength="item.maxlength"
              :show-word-limit="item.showWordLimit"
              :rows="item.rows || 3"
              :readonly="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- 下拉选择 -->
            <Select
              v-else-if="item.type === FormTypeEnum.SELECT"
              v-model="formData[item.key]"
              :placeholder="getFieldPlaceholder(item)"
              :multiple="item.multiple"
              :filterable="item.filterable"
              :options="item.options || []"
              :disabled="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- API选择器 -->
            <ApiSelect
              v-else-if="item.type === FormTypeEnum.SELECT_API && item.api"
              v-model="formData[item.key]"
              :api="item.api"
              :label-field="item.labelField || 'label'"
              :value-field="item.valueField || 'value'"
              :multiple="item.multiple"
              :placeholder="getFieldPlaceholder(item)"
              :disabled="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- 单选组 -->
            <radio-group
              v-else-if="item.type === FormTypeEnum.RADIO_GROUP"
              v-model="formData[item.key]"
              :options="item.options || []"
              :disabled="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- 开关 -->
            <el-switch
              v-else-if="item.type === FormTypeEnum.SWITCH"
              v-model="formData[item.key]"
              :active-value="item.activeValue ?? 1"
              :inactive-value="item.inactiveValue ?? 0"
              :disabled="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- 自定义组件 -->
            <component
              :is="item.component"
              v-else-if="item.type === FormTypeEnum.CUSTOM"
              v-model="formData[item.key]"
              v-bind="item.props"
              :disabled="actionType === ActionTypeEnum.DETAIL"
            />

            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="item.type === FormTypeEnum.DATE_PICKER"
              v-model="formData[item.key]"
              :type="item.dateType || 'date'"
              :placeholder="getFieldPlaceholder(item)"
              :disabled="actionType === ActionTypeEnum.DETAIL"
            />
          </el-form-item>
        </template>
      </el-form>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleBack">
          {{ actionType === ActionTypeEnum.DETAIL ? $t('action.close') : $t('action.cancel') }}
        </el-button>
        <el-button
          v-if="actionType !== ActionTypeEnum.DETAIL"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ getSubmitButtonText() }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { ElMessage, type FormInstance } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

import { FormGroupFieldConfig } from '../FormGroup/types';

import { FormPageProps } from './types';

const route = useRoute();
const router = useRouter();

const props = withDefaults(defineProps<FormPageProps>(), {
  formRules: () => ({}),
  labelWidth: '100px',
  submitButtonTextMap: () => ({
    [ActionTypeEnum.CREATE]: 'action.submit',
    [ActionTypeEnum.EDIT]: 'action.save',
    [ActionTypeEnum.COPY]: 'action.save',
  }),
  titleMap: () => ({
    [ActionTypeEnum.CREATE]: 'action.add',
    [ActionTypeEnum.EDIT]: 'action.edit',
    [ActionTypeEnum.DETAIL]: 'action.detail',
    [ActionTypeEnum.COPY]: 'action.copy',
  }),
});

const emit = defineEmits<{
  success: [];
  loadData: [id: string];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

// 从路由参数获取操作类型和ID
const actionType = computed(
  () => (route.query.actionType as ActionTypeEnum) || ActionTypeEnum.CREATE
);
const recordId = computed(() => (route.query.id as string) || '');

// 表单数据
const formData = reactive<Record<string, any>>({});

// 页面标题
const pageTitle = computed(() => {
  return i18nText(props.titleMap[actionType.value]);
});

// 初始化表单数据
const initFormData = () => {
  props.formFields.forEach((item) => {
    formData[item.key] = '';
    if (item.type === FormTypeEnum.SWITCH) {
      formData[item.key] = item.inactiveValue ?? 0;
    } else if (item.type === FormTypeEnum.SELECT && item.multiple) {
      formData[item.key] = [];
    }
  });
};

// 获取字段标签
const getFieldLabel = (item: FormGroupFieldConfig) => {
  return item.label;
};

// 获取字段占位符
const getFieldPlaceholder = (item: FormGroupFieldConfig) => {
  return item.placeholder || `请${getFieldLabel(item)}`;
};

// 获取提交按钮文本
const getSubmitButtonText = () => {
  return i18nText(props.submitButtonTextMap[actionType.value]);
};

// 加载详情数据
const loadDetailData = async () => {
  if (actionType.value !== ActionTypeEnum.CREATE && recordId.value) {
    try {
      loading.value = true;
      emit('loadData', recordId.value);
      // 外部组件通过props.detailsData传递数据
    } catch (error) {
      ElMessage.error(i18nText('action.loadFailed'));
    } finally {
      loading.value = false;
    }
  }
};

// 监听详情数据变化
watch(
  () => props.detailsData,
  (newData) => {
    if (newData) {
      Object.assign(formData, newData);
    }
  },
  { immediate: true }
);

// 返回上一页
const handleBack = () => {
  router.back();
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const submitData = { ...formData };

    let response: any;
    if (actionType.value === ActionTypeEnum.EDIT && props.editApi) {
      response = await props.editApi(submitData);
    } else if (
      (actionType.value === ActionTypeEnum.CREATE || actionType.value === ActionTypeEnum.COPY) &&
      props.addApi
    ) {
      response = await props.addApi(submitData);
    }

    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('action.submitSuccess'));
        emit('success');
        handleBack();
      },
      params: response,
    });
  } catch (error) {
    console.error('表单提交失败:', error);
    ElMessage.error(i18nText('action.submitFailed'));
  } finally {
    loading.value = false;
  }
};

// 组件挂载时初始化
onMounted(() => {
  initFormData();
  if (actionType.value !== ActionTypeEnum.CREATE) {
    loadDetailData();
  }
});
</script>

<style scoped>
.form-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.form-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.form-actions .el-button {
  margin: 0 10px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}
</style>
