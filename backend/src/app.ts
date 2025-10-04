/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 23:06:01
 * @Description:
 */
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// 加载环境变量
dotenv.config({ path: ".env.development" });

// config
import sequelize from "./database";
// router
import emailRoutes from "./routes/email";
import adminRoutes from "./routes/admin";
import accountRoutes from "./routes/account";
import userRoutes from "./routes/user";
import roleRoutes from "./routes/role";
import menuRoutes from "./routes/menu";
import operationLogRoutes from "./routes/operationLog";
// utils
import { isDev } from "./utils/dataJudge";
import { sequelizeSyncConfig } from "./utils/database";

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(
  cors({
    exposedHeaders: ["Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use("/api/v1.0/email", emailRoutes);
app.use("/api/v1.0/admin", adminRoutes);
app.use("/api/v1.0/account", accountRoutes);
app.use("/api/v1.0/user", userRoutes);
app.use("/api/v1.0/role", roleRoutes);
app.use("/api/v1.0/menu", menuRoutes);
app.use("/api/v1.0/operation-log", operationLogRoutes);

// 根路由
app.get("/", (req, res) => {
  res.send("Authentication API is running");
});

// 错误处理中间件
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "服务器内部错误",
      error: isDev ? err.message : undefined,
    });
  }
);

// 监听服务器
const listenServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`服务器运行在 ${PORT}`);
  });
  process.on("SIGINT", () => {
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
      console.log("开启数据库同步成功");
      listenServer();
    })
    .catch((err) => {
      console.error("开启数据库同步失败:", err);
    });
} else {
  console.log("生产模式：跳过数据库同步");
  listenServer();
}

export default app;
