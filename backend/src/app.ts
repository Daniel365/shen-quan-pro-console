/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 23:06:01
 * @Description:
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import process from 'node:process';
// config
import {LOCAL_UPLOAD_PATH, PORT, UPLOAD_STRATEGY } from './config/process';
import { API_VERSION } from './config/default';
// database
import sequelize from './database';
// 导入模型关联定义
import './models/system/associations';
// middleware
import autoLogOperation from './middleware/autoLog';
import i18nMiddleware from './middleware/i18n';
import responseMiddleware from './middleware/response';
import errorHandler from './middleware/errorHandler';
// router
import emailRoutes from './routes/email';
import adminRoutes from './routes/admin';
import accountRoutes from './routes/account';
import uploadRoutes from './routes/upload';
import { userRoutes, roleRoutes, menuRoutes, operationLogRoutes, notificationRoutes } from './routes/system';
import { appUserRoutes, appRoleRoutes } from './routes/app';
// utils
import { sequelizeSyncConfig } from './utils/database';

// 初始化Express应用
const app = express();

// 中间件
app.use(
  cors({
    exposedHeaders: ['Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 本地文件上传静态文件服务
if (UPLOAD_STRATEGY === 'local') {
  app.use(`${API_VERSION}/uploads`, express.static(LOCAL_UPLOAD_PATH));
}

// 国际化中间件
app.use(i18nMiddleware());

// 响应中间件（在路由前应用，确保所有路由都能使用统一的响应处理）
app.use(responseMiddleware());

// 自动操作日志中间件（在路由前应用，确保所有路由都能被记录）
app.use(autoLogOperation());
// 路由
app.use(`${API_VERSION}/email`, emailRoutes);
app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/account`, accountRoutes);
app.use(`${API_VERSION}/upload`, uploadRoutes);
// system
app.use(`${API_VERSION}/user`, userRoutes);
app.use(`${API_VERSION}/role`, roleRoutes);
app.use(`${API_VERSION}/menu`, menuRoutes);
app.use(`${API_VERSION}/operation-log`, operationLogRoutes);
app.use(`${API_VERSION}/notification`, notificationRoutes);
// app
app.use(`${API_VERSION}/app/user`, appUserRoutes);
app.use(`${API_VERSION}/app/role`, appRoleRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('Authentication API is running');
});

// 错误处理中间件
app.use(errorHandler());

// 监听服务器
const listenServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`服务器运行在 ${PORT}`);
  });
  process.on('SIGINT', () => {
    server.close(() => {
      console.log(`${PORT} 端口已关闭`);
      process.exit(0); // 退出进程
    });
  });
};

// 同步数据库模型并启动服务器
const syncConfig = sequelizeSyncConfig();
if (syncConfig) {
  sequelize
    .sync(syncConfig)
    .then(() => {
      console.log('开启数据库同步成功');
      listenServer();
    })
    .catch((err) => {
      console.error('开启数据库同步失败:', err);
    });
} else {
  console.log('生产模式：跳过数据库同步');
  listenServer();
}

export default app;
