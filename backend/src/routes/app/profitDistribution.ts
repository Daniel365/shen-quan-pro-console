/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: App端利润分配配置管理路由
 */

import { Router } from "express";
import { ProfitDistributionController } from "@/controllers/app";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// 利润分配配置管理
router.post("/list", requireAuth(), ProfitDistributionController.list);
router.post("/create", requireAuth(), ProfitDistributionController.create);
router.put("/update", requireAuth(), ProfitDistributionController.update);
router.put("/enable", requireAuth(), ProfitDistributionController.enable);
router.delete("/delete", requireAuth(), ProfitDistributionController.delete);

export default router;
