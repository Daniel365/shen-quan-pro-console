/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-27 17:19:34
 * @Description:
 */
import { resolve } from 'path';

import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { type ConfigEnv, defineConfig, loadEnv } from 'vite';

import { dependencies, devDependencies, engines, name, version } from './package.json';

// 平台的名称、版本、运行所需的 node 版本、依赖、构建时间的类型提示
const __APP_INFO__ = {
  buildTimestamp: Date.now(),
  pkg: { dependencies, devDependencies, engines, name, version },
};

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());
  const isProduction = mode === 'production';
  return {
    // 构建配置
    build: {
      chunkSizeWarningLimit: 2000, // 消除打包大小超过500kb警告
      minify: isProduction ? 'terser' : false, // 只在生产环境启用压缩
      rollupOptions: {
        output: {
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: (assetInfo: any) => {
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            // console.log('文件信息', assetInfo.name)
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'media';
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = 'img';
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = 'fonts';
            }
            return `${extType}/[name].[hash].[ext]`;
          },
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: 'js/[name].[hash].js',
          // manualChunks: {
          //   "vue-i18n": ["vue-i18n"],
          // },
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: 'js/[name].[hash].js',
        },
      },
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true, // 生产环境去除 console.log, console.warn, console.error 等
              drop_debugger: true, // 生产环境去除 debugger
              keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
              pure_funcs: ['console.log', 'console.info'], // 移除指定的函数调用
            },
            format: {
              comments: false, // 删除注释
            },
          }
        : {},
    },
    css: {
      // 开发环境禁用 sourcemap（减少内存占用）
      devSourcemap: false,
      // 开发环境样式去重
      modules: {
        generateScopedName: isProduction ? '[hash:base64:4]' : '[local]_[hash:base64:2]',
        // 启用 CSS Modules 隔离组件样式，避免全局污染
        scopeBehaviour: 'local',
      },
      // 限制预处理器的全局变量注入，避免重复
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/style/theme/system.scss" as *;`,
          api: 'modern-compiler',
        },
      },
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    plugins: [
      vue(),
      UnoCSS(),
      AutoImport({
        dirs: ['src/store', 'src/api', 'src/hooks', 'src/utils/tool.ts', 'src/enums'],
        // 导入函数类型声明文件路径 (false:关闭自动生成)
        // dts: false,
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: false,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
        // 导入 Vue 函数，如：ref, reactive, toRef 等
        imports: ['vue', '@vueuse/core', 'pinia', 'vue-router', 'vue-i18n'],
        vueTemplate: true,
      }),
      // 组件自动导入
      Components({
        // 指定自定义组件位置(默认:src/components)
        dirs: ['src/components', 'src/**/components'],
        // 导入组件类型声明文件路径 (false:关闭自动生成)
        // dts: false,
        dts: 'src/types/components.d.ts',
        resolvers: [
          // 导入 Element Plus 组件
          ElementPlusResolver({ importStyle: 'sass' }),
        ],
      }),
    ],
    resolve: {
      alias: {
        // 配置 @ 指向 src 目录
        '@': resolve(__dirname, 'src'),
      },
    },
    // 代理
    server: {
      host: '0.0.0.0',
      open: true,
      port: +env.VITE_APP_PORT,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
        },
      },
    },
  };
});
