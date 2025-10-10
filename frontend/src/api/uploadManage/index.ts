/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 14:00:43
 * @Description: 上传管理
 */

import alovaInstance from '@/utils/instance';

export default {

  // 删除文件
  onDeleteFile(publicId: string): Promise<InterfaceResult> {
    return alovaInstance.Delete(`/upload/${publicId}`);
  },

  // 获取上传配置
  onGetUploadConfig(params: { functionType?: string } = {}): Promise<InterfaceResult> {
    return alovaInstance.Get('/upload/config', { params });
  },

  // 批量文件上传
  onUploadMultiple(data: FormData): Promise<InterfaceResult> {
    return alovaInstance.Post('/upload/multiple', data);
  },
  // 单文件上传
  onUploadSingle(data: FormData): Promise<InterfaceResult> {
    return alovaInstance.Post('/upload/single', data);
  },
};
