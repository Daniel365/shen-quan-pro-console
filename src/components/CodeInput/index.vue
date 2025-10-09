<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-08-29 15:40:39
 * @Description: 发送验证码
-->
<template>
  <div class="code-input">
    <el-input
      :model-value="props.modelValue"
      :maxlength="props.maxLength"
      :placeholder="props.placeholder"
      :size="props.size"
      @update:model-value="(val: string) => emit('update:modelValue', val)"
    />
    <el-button
      class="code-input-btn"
      :size="props.size"
      :disabled="btnDisabled"
      @click="handleSend"
    >
      {{ leftSeconds ? `${leftSeconds}s 后重试` : '获取验证码' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, InputProps } from 'element-plus';

interface Props {
  modelValue?: string;
  placeholder?: string;
  maxLength?: number;
  /** 外部决定发送目标，例：phone/email 等 */
  target?: string;
  /** 倒计时秒数，默认 60 */
  countdown?: number;
  /** 按钮尺寸，默认 large */
  size?: InputProps['size'];
  /** 是否禁用发送 */
  disabled?: boolean;
  /** 发送验证码的 api，返回 Promise；由外部负责实际请求 */
  sendCodeApi: Promise<InterfaceResult<any>>;
  /** 发送验证码的回调，返回 Promise；由外部负责实际请求
   * @param target 发送目标
   * @param close 关闭发送验证码的 loading
   */
  onSend?: (target?: string, close?: () => void) => Promise<void> | void;
}

const props = withDefaults(defineProps<Props>(), {
  countdown: 60,
  disabled: false,
  maxLength: 6,
  modelValue: '',
  placeholder: '验证码',
  size: 'large',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'sent'): void;
}>();

const sending = ref(false);
const leftSeconds = ref(0);
let timer: number | null = null;

// 倒计时按钮禁用
const btnDisabled = computed(
  () => sending.value || props.disabled || !!leftSeconds.value || !props.target
);

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const startCountdown = () => {
  leftSeconds.value = props.countdown;
  if (timer) window.clearInterval(timer);
  timer = window.setInterval(() => {
    leftSeconds.value -= 1;
    if (leftSeconds.value <= 0) {
      window.clearInterval(timer as number);
      timer = null;
    }
  }, 1000);
};

const handleSend = async () => {
  const { sendCodeApi, onSend, disabled, target } = props;
  if (sending.value || leftSeconds.value > 0 || disabled) return;

  try {
    sending.value = true;
    if (onSend) {
      await props.onSend?.(target, () => (sending.value = false));
    } else {
      const response = await sendCodeApi?.finally(() => {
        sending.value = false;
      });
      handleReturnResults({
        onSuccess: () => {
          ElMessage.success(i18nText('action.sendCodeSuccess'));
          startCountdown();
          emit('sent');
        },
        params: response,
      });
    }
  } catch (e) {
    ElMessage.error(i18nText('action.sendCodeFail'));
    console.error('handleSend=>>', e);
  }
};
</script>

<style scoped>
.code-input {
  display: flex;
  gap: 12px;
}
.code-input-btn {
  flex: 0 0 140px;
}
</style>
