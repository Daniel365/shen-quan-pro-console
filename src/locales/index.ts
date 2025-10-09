/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 20:10:39
 * @Description: 国际化
 */

import type { App } from 'vue';

import { createI18n } from 'vue-i18n';

import { LanguageEnum } from '@/enums/system';
import { useAppStoreHook } from '@/store/modules/app.store';

// 本地语言包
import enUs from './en-US.json';
import zhCn from './zh-CN.json';

const appStore = useAppStoreHook();

const messages = {
  [LanguageEnum.ZH]: zhCn,
  [LanguageEnum.EN]: enUs,
};

const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: appStore.language,
  messages,
});

/**
 * 注册
 */
export function setupI18n(app: App<Element>) {
  app.use(i18n);
}

export default i18n;
