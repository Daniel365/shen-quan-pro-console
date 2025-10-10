<template>
  <div class="profit-distribution-form">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item
        v-for="(roleShare, index) in formData.roleShares"
        :key="roleShare.key"
        :label="i18nText('profitDistributionManage.roleShareLabel', { index: index + 1 })"
        :prop="`roleShares.${index}.profitPoints`"
        :rules="{
          required: true,
          message: i18nText('profitDistributionManage.message.profitPoints.required'),
          trigger: 'blur',
          validator: validateProfitPoints,
        }"
      >
        <div class="role-share-item">
          <ApiSelect
            v-model="roleShare.roleUuid"
            :api="appRoleManageApi.getList"
            :placeholder="i18nText('form.selectRole')"
            label-field="name"
            value-field="uuid"
          />

          <el-input-number
            v-model="roleShare.profitPoints"
            :min="0"
            :max="1000"
            :placeholder="i18nText('profitDistributionManage.profitPointsPlaceholder')"
          />
          <div class="action">
            <el-button type="danger" link @click.prevent="removeRoleShare(roleShare)">
              {{ i18nText('action.delete') }}
            </el-button>
          </div>
        </div>
      </el-form-item>
      <el-button type="primary" link @click="addRoleShare">
        {{ i18nText('profitDistributionManage.addRoleShare') }}
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { RoleShareItem } from '../utils/types';
import type { FormInstance, FormRules } from 'element-plus';

interface Props {
  modelValue?: RoleShareItem[];
}

interface Emits {
  (e: 'update:modelValue', value: RoleShareItem[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const formData = reactive({
  roleShares: [] as RoleShareItem[],
});

let keyCounter = 0;

const formRules: FormRules = {
  roleShares: [
    {
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error(i18nText('profitDistributionManage.message.roleShares.required')));
        } else {
          callback();
        }
      },
    },
  ],
};

const validateProfitPoints = (rule: any, value: any, callback: any) => {
  if (value === null || value === undefined || value === '') {
    callback(new Error(i18nText('profitDistributionManage.message.profitPoints.required')));
  } else if (value < 0) {
    callback(new Error(i18nText('profitDistributionManage.message.profitPoints.min')));
  } else {
    callback();
  }
};

const addRoleShare = () => {
  formData.roleShares.push({
    key: keyCounter++,
    profitPoints: 0,
    roleUuid: '',
  });
  emitUpdate()
};

const removeRoleShare = (roleShare: RoleShareItem) => {
  const index = formData.roleShares.findIndex((item) => item.key === roleShare.key);
  if (index > -1) {
    formData.roleShares.splice(index, 1);
    emitUpdate()
  }
};

const emitUpdate = () => {
  emit('update:modelValue', [...formData.roleShares]);
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      formData.roleShares = newValue.map((item) => ({
        ...item,
        key: item.key || keyCounter++,
      }));
      keyCounter = Math.max(...formData.roleShares.map((item) => item.key), 0) + 1;
    }
  },
  { deep: true, immediate: true }
);


defineExpose({
  clearValidate: () => formRef.value?.clearValidate(),
  resetFields: () => formRef.value?.resetFields(),
  validate: () => formRef.value?.validate(),
});
</script>

<style scoped>
.profit-distribution-form {
  width: 100%;
}
</style>
