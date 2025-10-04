/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-14 20:59:01
 * @Description: 登录、注册
 */

import { Router } from "express";
import { AccountController } from "@/controllers/account";
import { validateForm } from "@/middleware/formValidation";
import { verifyRule } from "@/paramsVerify";

const router = Router();

// 注册
router.post("/register", validateForm(verifyRule.registerFormRule), AccountController.register);
// 登录
router.post("/login", validateForm(verifyRule.loginFormRule), AccountController.login);
// 退出登录
router.post("/logout", AccountController.logout);
// 重置密码
router.post("/reset-password", AccountController.resetPassword);

export default router;
