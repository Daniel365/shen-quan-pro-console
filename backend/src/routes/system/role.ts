import { Router } from "express";
import { RoleController } from "@/controllers/system";
import { requireAuth } from "@/middleware/auth";


const router = Router();

router.post("/list", requireAuth(), RoleController.list);
router.post(
  "/create",
  requireAuth(),
  RoleController.create
);
router.put(
  "/update",
  requireAuth(),
  RoleController.update
);
router.delete(
  "/delete",
  requireAuth(),
  RoleController.delete
);
router.put(
  "/assign-perm",
  requireAuth(),
  RoleController.assignPerm
);

export default router;
