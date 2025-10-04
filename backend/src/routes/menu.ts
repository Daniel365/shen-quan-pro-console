/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:21:31
 * @Description:
 */
import { Router } from "express";
import { MenuController } from "../controllers/menu";
import { requireAuth } from "../middleware/auth";
import { logOperation } from "../middleware/operationLog";
import { OperationAction } from "../types/operationLog";

const router = Router();

router.get("/tree-list", requireAuth(), MenuController.treeList);
router.post("/list", requireAuth(), MenuController.list);
router.post(
  "/create",
  requireAuth(),
  logOperation(OperationAction.MENU_CREATE),
  MenuController.create
);
router.put(
  "/update",
  requireAuth(),
  logOperation(OperationAction.MENU_UPDATE),
  MenuController.update
);
router.delete(
  "/delete",
  requireAuth(),
  logOperation(OperationAction.MENU_DELETE),
  MenuController.delete
);

export default router;
