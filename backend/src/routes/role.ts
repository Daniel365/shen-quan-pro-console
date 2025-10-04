import { Router } from "express";
import { RoleController } from "../controllers/role";
import { requireAuth } from "../middleware/auth";
import { logOperation } from "../middleware/operationLog";
import { OperationAction } from "../types/operationLog";

const router = Router();

router.post("/list", requireAuth(), RoleController.list);
router.post(
  "/create",
  requireAuth(),
  logOperation(OperationAction.ROLE_CREATE),
  RoleController.create
);
router.put(
  "/update",
  requireAuth(),
  logOperation(OperationAction.ROLE_UPDATE),
  RoleController.update
);
router.delete(
  "/delete",
  requireAuth(),
  logOperation(OperationAction.ROLE_DELETE),
  RoleController.delete
);
router.put(
  "/assign-perm",
  requireAuth(),
  logOperation(OperationAction.ROLE_ASSIGN_PERM),
  RoleController.assignPerm
);

export default router;
