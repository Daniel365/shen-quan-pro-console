/**
 * @Author: 350296245@qq.com
 * @Date: 2025-10-03
 * @Description: 表单验证中间件
 */

import type { NextFunction, Request, Response } from 'express'
import type { ReqParamsVerifyRule } from '@/types/interfaceRequest'
import { onParamsVerify } from '@/paramsVerify'

/**
 * 表单验证中间件
 * @param rules 验证规则数组
 * @returns Express中间件函数
 */
export function validateForm(rules: ReqParamsVerifyRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { isValid, messageKey } = onParamsVerify(req.body, rules)

    if (!isValid) {
      return res.responseBuilder.error(messageKey, 400)
    }

    next()
  }
}

export default validateForm
