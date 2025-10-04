/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 11:15:43
 * @Description: 公共接口
 */

import alovaInstance from '@/utils/instance';

import { EmailVerificationType } from './data.d';

export default {
  // 发送邮箱验证码
  onSendEmailCode(data: { email: string; type: EmailVerificationType }): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.EMAIL_SEND_CODE, data);
  },
};
