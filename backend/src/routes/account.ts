/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 15:05:20
 * @Description: 账号相关
 */
import { Router } from "express";
import { AccountController } from "@/controllers/account";
import { requireAuth } from "@/middleware/auth";
import { validateForm } from "@/middleware/formValidation";
import { verifyRule } from "@/paramsVerify";


const router = Router();

router.put(
  "/edit-password",
  requireAuth(),
  validateForm(verifyRule.editPasswordFormRule),
  AccountController.editPassword
);
router.put(
  "/edit-profile",
  requireAuth(),
  validateForm(verifyRule.editProfileFormRule),
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
