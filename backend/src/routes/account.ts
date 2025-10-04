/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 15:05:20
 * @Description: 账号相关
 */
import { Router } from "express";
import { AccountController } from "../controllers/account";
import { requireAuth } from "../middleware/auth";
import { logOperation } from "../middleware/operationLog";
import { OperationAction } from "../types/operationLog";

const router = Router();

router.put(
  "/edit-password",
  requireAuth(),
  logOperation(OperationAction.ACCOUNT_EDIT_PASSWORD),
  AccountController.editPassword
);
router.put(
  "/edit-profile",
  requireAuth(),
  logOperation(OperationAction.ACCOUNT_EDIT_PROFILE),
  AccountController.editProfile
);
router.get(
  "/get-account-info",
  requireAuth(),
  AccountController.getAccountInfo
);
router.get(
  "/get-account-menu",
  requireAuth(),
  AccountController.getAccountMenu
);

export default router;
