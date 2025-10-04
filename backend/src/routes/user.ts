/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 23:06:01
 * @Description: 用户api
 */

import { Router } from "express";
import { UserController } from "../controllers/user";
import { requireAuth } from "../middleware/auth";
import { logOperation } from "../middleware/operationLog";
import { OperationAction } from "../types/operationLog";

const router = Router();

// 用户管理
router.post("/list", requireAuth(), UserController.list);
router.put(
  "/update",
  requireAuth(),
  logOperation(OperationAction.USER_UPDATE),
  UserController.update
);
router.delete(
  "/delete",
  requireAuth(),
  logOperation(OperationAction.USER_DELETE),
  UserController.delete
);

export default router;
