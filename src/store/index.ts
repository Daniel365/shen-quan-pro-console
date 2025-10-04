/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 19:19:16
 * @Description:
 */
import type { App } from "vue";

import { createPinia } from "pinia";

const store = createPinia();

// 全局注册 store
export function setupStore(app: App<Element>) {
  app.use(store);
}

export * from "./modules/app.store";
export * from "./modules/account.store";
export * from "./modules/permission.store";
export * from "./modules/settings.store";

export { store };
