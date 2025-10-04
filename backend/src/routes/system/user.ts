/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 23:06:01
 * @Description: 用户api
 */

import { Router } from "express";
import { UserController } from "@/controllers/system";
import { requireAuth } from "@/middleware/auth";


const router = Router();

// 用户管理
router.post("/list", requireAuth(), UserController.list);
router.put(
  "/update",
  requireAuth(),
  UserController.update
);
router.delete(
  "/delete",
  requireAuth(),
  UserController.delete
);

export default router;
