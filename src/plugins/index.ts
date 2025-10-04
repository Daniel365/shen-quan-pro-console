/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 20:12:45
 * @Description:
 */

import type { App } from 'vue';

import { setupDirective } from '@/directive';
import { setupI18n } from '@/locale';
import { setupRouter } from '@/router';
import { setupStore } from '@/store';

import { setupPermission } from './permission';

export default {
  install(app: App<Element>) {
    // 自定义指令(directive)
    setupDirective(app);
    // 路由(router)
    setupRouter(app);
    // 状态管理(store)
    setupStore(app);
    // 国际化
    setupI18n(app);
    // 路由守卫
    setupPermission();
  },
};
