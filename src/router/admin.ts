import { RouterPath } from "@/enums";

export default [
  {
    component: () => import("@/views/admin/login/index.vue"),
    path: RouterPath.LOGIN,
  },
  {
    component: () => import("@/views/admin/register/index.vue"),
    path: RouterPath.REGISTER,
  },
  {
    component: () => import("@/views/admin/forgotPassword/index.vue"),
    path: RouterPath.FORGOT_PASSWORD,
  },
];
