/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-14 20:59:01
 * @Description: 登录、注册
 */

import { Router } from "express";
import { UserController } from "@/controllers/system";

const router = Router();

// 注册
router.post("/register", UserController.register);
// 登录
router.post("/login", UserController.login);
// 退出登录
router.post("/logout", UserController.logout);
// 重置密码
router.post("/reset-password", UserController.resetPassword);

export default router;
