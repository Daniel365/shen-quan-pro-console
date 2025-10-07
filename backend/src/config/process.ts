import dotenv from 'dotenv';
import process from 'node:process';

// 加载环境变量
dotenv.config({ path: '.env.development' });
/** node环境 */
export const NODE_ENV = process.env.NODE_ENV;
/** 是否开发环境 */
export const isDev = NODE_ENV === 'development';
/** 服务端口 */
export const PORT = process.env.PORT || 3000;
/** 服务接口 */
export const BASE_URL = `${process.env.BASE_URL || 'http://localhost'}:${PORT}`;

/** JWT - 密钥 */
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/** 上传方式 */
export const UPLOAD_STRATEGY = process.env.UPLOAD_STRATEGY;
/** 本地上传路径 */
export const LOCAL_UPLOAD_PATH = process.env.LOCAL_UPLOAD_PATH || './uploads';
