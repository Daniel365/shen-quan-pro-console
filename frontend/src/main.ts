/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-27 17:19:34
 * @Description:
 */
import { createApp } from 'vue';

import ElementPlus from 'element-plus';

import setupPlugins from '@/plugins';

import App from './App.vue';
// Element Plus
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// css
import 'uno.css';
import 'animate.css';
import '@/assets/style/index.scss';

const app = createApp(App);

// 注册Element Plus
app.use(ElementPlus);

// 注册插件
app.use(setupPlugins);

app.mount('#app');
