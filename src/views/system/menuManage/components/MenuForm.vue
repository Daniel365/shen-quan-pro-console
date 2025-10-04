<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 20:44:18
 * @Description: 菜单表单
-->
<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? $t('action.edit') : $t('action.add')"
    :size="500"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formState" :rules="rules" label-width="80px">
      <!-- 动态渲染表单字段 -->
      <template v-for="item in currentFields" :key="item.key">
        <el-form-item :label="$t(item.labelKey)" :prop="item.key">
          <!-- 树形选择器 -->
          <MenuTreeSelect
            v-if="item.type === FormTypeEnum.TREE_SELECT"
            v-model:model-value="(formState as any)[item.key]"
            :placeholder="$t('form.selectParentMenu')"
          />
          <!-- 树形选择器 -->
          <el-select
            v-else-if="item.type === FormTypeEnum.SELECT"
            v-model="(formState as any)[item.key]"
            filterable
            :placeholder="$t('form.pleaseSelect')"
          >
            <el-option
              v-for="option in item?.options || []"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <!-- 单选组 -->
          <RadioGroup
            v-else-if="item.type === FormTypeEnum.RADIO_GROUP"
            v-model:model-value="(formState as any)[item.key]"
            :options="item?.options || []"
          />
          <!-- 数字输入 -->
          <el-input-number
            v-else-if="item.type === FormTypeEnum.INPUT_NUMBER"
            v-model="(formState as any)[item.key]"
            :min="0"
            :placeholder="$t('form.enterSort')"
          />
          <!-- 图标选择器 -->
          <IconPicker
            v-else-if="item.type === FormTypeEnum.CUSTOM && item.key === 'icon'"
            v-model:model-value="(formState as any)[item.key]"
          />
          <!-- 普通输入框 -->
          <el-input
            v-else
            v-model="(formState as any)[item.key]"
            :placeholder="getPlaceholder(item.key)"
          >
            <template v-if="item.inputPrepend" #prepend>{{ item.inputPrepend }}</template>
            <template v-if="item.inputAppend" #append>
              {{ item.inputAppend }}
            </template>
          </el-input>
          <!-- 帮助 -->
          <p v-if="item.helpTips" class="color-coolGray">{{ item.helpTips }}</p>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <div style="text-align: right">
        <el-button style="margin-right: 8px" @click="handleClose">
          {{ $t('action.cancel') }}
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('action.save') }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

import { MenuFormProps, MenuListItem } from '@/api/system/menuManage/data.d';

import { defaultFormData, getFormFields } from '../utils/const';

import type { FormInstance } from 'element-plus';
// utils
// type

interface Props {
  visible: boolean;
  actionType?: ActionTypeEnum;
  editData?: MenuListItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
  onClose: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

// 是否编辑
const isEdit = computed(() => props.actionType === ActionTypeEnum.EDIT);
// 当前表单字段配置
const currentFields = computed(() => getFormFields(formState.type));

const formState: MenuFormProps = reactive({ ...defaultFormData });

// 获取占位符文本
const getPlaceholder = (key: string) => {
  const placeholderMap: Record<string, string> = {
    component: 'form.enterComponent',
    icon: 'form.enterIcon',
    name: 'form.enterMenuName',
    permission: 'form.enterPermission',
    routeName: 'form.enterRouteName',
    routePath: 'form.enterRoutePath',
  };
  return i18nText(placeholderMap[key] || 'form.pleaseSelect');
};
const rules = {
  name: [{ message: i18nText('form.enterMenuName'), required: true }],
  sort: [{ message: i18nText('form.enterSort'), required: true }],
  type: [{ message: i18nText('form.selectType'), required: true }],
};

watch(
  () => props.editData,
  (val) => {
    if (props.actionType === ActionTypeEnum.EDIT || props.actionType === ActionTypeEnum.COPY) {
      Object.assign(formState, val);
    } else {
      Object.assign(formState, defaultFormData);
    }
  },
  { immediate: true }
);

// 关闭抽屉
const handleClose = () => {
  formRef.value?.resetFields();
  emit('onClose');
};

// 提交成功
const onSubmitSuccess = () => {
  handleClose();
  emit('success');
};

// 根据菜单类型清理表单数据
const cleanFormDataByType = (data: MenuFormProps) => {
  const cleanData: Partial<MenuFormProps> = {};
  const fields = getFormFields(data.type);

  fields.forEach((field) => {
    if (data[field.key as keyof MenuFormProps] !== undefined) {
      (cleanData as any)[field.key] = data[field.key as keyof MenuFormProps];
    }
  });

  return cleanData;
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const cleanedData = cleanFormDataByType(formState);
    const api = isEdit.value
      ? menuManageApi.onEdit({
          id: formState.id,
          ...cleanedData,
        })
      : menuManageApi.onCreate(cleanedData);

    const response = await api.finally(() => {
      loading.value = false;
    });

    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText(isEdit.value ? 'action.updateSuccess' : 'action.createSuccess'));
        onSubmitSuccess();
      },
      params: response,
    });
  } catch (error) {
    console.error('操作失败:', error);
  }
};
</script>
