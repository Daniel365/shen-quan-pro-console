/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 10:47:12
 * @Description: 进度条
 */

import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 进度条
NProgress.configure({
  // 动画方式
  easing: "ease",
  // 初始化时的最小百分比
  minimum: 0.3,
  // 是否显示加载ico
  showSpinner: false,
  // 递增进度条的速度
  speed: 500,
  // 自动递增间隔
  trickleSpeed: 200,
});

export default NProgress;
