/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-14 20:59:01
 * @Description: 登录、注册
 */

import { Router } from "express";
import { UserController } from "../controllers/user";
import { requireAuth } from "../middleware/auth";
import { logOperation } from "../middleware/operationLog";
import { OperationAction } from "../types/operationLog";

const router = Router();

// 注册
router.post("/register", UserController.register);
// 登录
router.post(
  "/login",
  logOperation(OperationAction.LOGIN),
  UserController.login
);
// 退出登录
router.post(
  "/logout",
  requireAuth(),
  logOperation(OperationAction.LOGOUT),
  UserController.logout
);
// 重置密码
router.post("/reset-password", UserController.resetPassword);

export default router;
