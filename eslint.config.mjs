// https://eslint.org/docs/latest/use/configure/configuration-files-new

import fs from 'node:fs';

import eslint from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import sortKeys from 'eslint-plugin-sort-keys';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

// 解析自动导入配置
let autoImportGlobals = {};
try {
  autoImportGlobals =
    JSON.parse(fs.readFileSync('./.eslintrc-auto-import.json', 'utf-8')).globals || {};
} catch (error) {
  // 文件不存在或解析错误时使用空对象
  console.warn('Could not load auto-import globals', error);
}

// Element Plus组件
const elementPlusComponents = {
  ElButton: 'readonly',
  ElCascader: 'readonly',
  ElCheckbox: 'readonly',
  ElCheckboxGroup: 'readonly',
  ElDatePicker: 'readonly',
  ElDialog: 'readonly',
  ElForm: 'readonly',
  ElFormItem: 'readonly',
  // Element Plus 组件添加为全局变量，避免 no-undef 报错
  ElInput: 'readonly',
  ElInputNumber: 'readonly',
  ElInputTag: 'readonly',
  ElMessage: 'readonly',
  ElMessageBox: 'readonly',
  ElNotification: 'readonly',
  ElOption: 'readonly',
  ElPagination: 'readonly',
  ElRadio: 'readonly',
  ElRadioGroup: 'readonly',
  ElSelect: 'readonly',
  ElSwitch: 'readonly',
  ElTable: 'readonly',
  ElTableColumn: 'readonly',
  ElText: 'readonly',
  ElTimePicker: 'readonly',
  ElTimeSelect: 'readonly',
  ElTree: 'readonly',
  ElTreeSelect: 'readonly',
};

export default [
  // 忽略文件配置
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/backend/**',
      '**/*.min.*',
      '**/auto-imports.d.ts',
      '**/components.d.ts',
      '**/iconfont.js',
      '**/uno.config.ts',
    ],
  },

  // 基础 JavaScript 配置
  eslint.configs.recommended,

  // Vue 推荐配置
  ...pluginVue.configs['flat/recommended'],

  // TypeScript 推荐配置
  ...typescriptEslint.configs.recommended,

  // 全局配置
  {
    // 指定要检查的文件
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser, // 浏览器环境全局变量
        ...globals.node, // Node.js 环境全局变量
        ...globals.es2022, // ES2022 全局对象
        ...autoImportGlobals, // 自动导入的 API 函数
        ...elementPlusComponents, // Element Plus 组件
        __APP_INFO__: 'readonly',
        ApiResponse: 'readonly',
        AppSettings: 'readonly',
        ExcelResult: 'readonly',
        OptionType: 'readonly',
        // 全局类型定义，解决 TypeScript 中定义但 ESLint 不识别的问题
        PageQuery: 'readonly',
        PageResult: 'readonly',
        TagView: 'readonly',
      },
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      import: importPlugin,
      'sort-keys': sortKeys,
      vue: pluginVue,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // 最佳实践
      eqeqeq: 'off',

      // import排序规则
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              group: 'external',
              pattern: 'vue',
              position: 'before',
            },
            {
              group: 'external',
              pattern: '@vue/**',
              position: 'before',
            },
            {
              group: 'external',
              pattern: '@element-plus/**',
              position: 'before',
            },
            {
              group: 'internal',
              pattern: '@/**',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      // 基础规则
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'no-redeclare': 'off',
      'no-undef': 'off',

      // 禁用与 TypeScript 冲突的规则
      'no-unused-vars': 'off',
      'no-var': 'error',
      'object-shorthand': 'error',

      // ES6+ 规则
      'prefer-const': 'error',

      // 对象键排序规则
      'sort-keys/sort-keys-fix': ['error', 'asc', { natural: true }],
    },
  },

  // Vue 文件特定配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
        parser: typescriptEslint.parser,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            component: 'always',
            normal: 'never',
            void: 'always',
          },
          math: 'always',
          svg: 'always',
        },
      ],
      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/no-mutating-props': 'off',
      'vue/no-template-shadow': 'warn',
      'vue/no-unused-vars': 'error',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'error',
      'vue/return-in-computed-property': 'warn',
      'vue/valid-v-for': 'warn',
    },
  },

  // TypeScript 文件特定配置
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'off', // 关闭强制使用type import
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // TypeScript 规则
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用any类型，方便开发
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn', // 降级为警告
      '@typescript-eslint/no-unused-vars': 'warn', // 降级为警告
    },
  },

  // .d.ts 文件配置
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // CURD 组件配置
  {
    files: ['**/components/CURD/**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },

  // Prettier 集成（必须放在最后）
  configPrettier,
];
