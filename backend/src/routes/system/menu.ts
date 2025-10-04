/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:21:31
 * @Description:
 */
import { Router } from "express";
import { MenuController } from "@/controllers/system";
import { requireAuth } from "@/middleware/auth";


const router = Router();

router.get("/tree-list", requireAuth(), MenuController.treeList);
router.post("/list", requireAuth(), MenuController.list);
router.post(
  "/create",
  requireAuth(),
  MenuController.create
);
router.put(
  "/update",
  requireAuth(),
  MenuController.update
);
router.delete(
  "/delete",
  requireAuth(),
  MenuController.delete
);

export default router;
