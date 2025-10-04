/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 21:07:18
 * @Description: 统一接口输出
 */
import accountManageApi from './accountManage';
import adminManageApi from './adminManage';
import {
  appUserManageApi
} from './app'
import commonApi from './common';
import {
  menuManageApi,
  operationLogApi,
  roleManageApi,
  userManageApi,
  notificationManageApi,
} from './system'
import uploadManageApi from './uploadManage';

export {
  appUserManageApi,
  accountManageApi,
  adminManageApi,
  commonApi,
  menuManageApi,
  operationLogApi,
  roleManageApi,
  userManageApi,
  notificationManageApi,
  uploadManageApi,
};
