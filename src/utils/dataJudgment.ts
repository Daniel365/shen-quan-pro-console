/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-10 21:31:03
 * @Description: 数据判断
 */

/** 是否有效值 */
export function isEffectiveValue(value: any) {
  return value !== "" && value !== null && value !== undefined;
}

/** 是否无效值 */
export function isInvalidValue(value: any) {
  return value === "" || value === null || value === undefined;
}

/** 是否是对象 */
export function isObject(value: any) {
  return value && Object.prototype.toString.call(value) === "[object Object]";
}

/** 是否是数组 */
export function isArray(value: any) {
  return value && Object.prototype.toString.call(value) === "[object Array]";
}

/** 是否是字符串 */
export function isString(value: any) {
  return typeof value === "string";
}

/** 是否是数字 */
export function isNumber(value: any) {
  return typeof value === "number";
}

/** 是否是函数 */
export function isFunction(value: any) {
  return typeof value === "function";
}

/** 是否中文 */
export function isChinese(val: any) {
  const chineseRegex = /^[\u4e00-\u9fa5]+$/;
  return chineseRegex.test(val);
}

/** 是否数组有数据 */
export const isHasArrayData = (value: any) => {
  return isArray(value) && value.length > 0;
};

/**
 * Check if an element has a class
 * @param {HTMLElement} ele
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele: HTMLElement, cls: string) {
  return !!ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

/**
 * Add class to element
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function addClass(ele: HTMLElement, cls: string) {
  if (!hasClass(ele, cls)) ele.className += " " + cls;
}

/**
 * Remove class from element
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function removeClass(ele: HTMLElement, cls: string) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
  }
}

/**
 * 判断是否是外部链接
 *
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string) {
  const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path);
  return isExternal;
}
