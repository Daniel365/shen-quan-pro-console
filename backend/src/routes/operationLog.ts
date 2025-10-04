/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-14 15:36:31
 * @Description: 操作日志
 */
import { Router } from "express";
import { OperationLogController } from "../controllers/operationLog";
import { requireAuth } from "../middleware/auth";

const router = Router();

// 获取操作日志列表
router.post("/list", requireAuth(), OperationLogController.list);

export default router;
