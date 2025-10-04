import { ResponseBuilder } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      file?: any;
      files?: any[];
    }
    
    interface Response {
      responseBuilder: ResponseBuilder;
    }
  }
  
  namespace Express.Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}