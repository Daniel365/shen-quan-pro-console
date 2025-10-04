import { DataTypes, Model, Optional } from "sequelize";
import sequelize, { sequelizeTimeConfig } from "@/database";
import { getDbName } from "@/utils/database";
import { publicOptions } from "@/database/common";

interface OperationLogAttributes {
  uuid: string;
  user_uuid: string;
  action: string;
  description: string;
  api_path?: string;
  http_method?: string;
  ip_address?: string;
  user_agent?: string;
  request_params?: string;
  response_data?: string;
  created_at: Date;
  updated_at: Date;
}

interface OperationLogCreationAttributes
  extends Optional<OperationLogAttributes, "uuid" | "created_at" | "updated_at"> {}

class OperationLog
  extends Model<OperationLogAttributes, OperationLogCreationAttributes>
  implements OperationLogAttributes
{
  public uuid!: string;
  public user_uuid!: string;
  public action!: string;
  public description!: string;
  public api_path?: string;
  public http_method?: string;
  public ip_address?: string;
  public user_agent?: string;
  public request_params?: string;
  public response_data?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OperationLog.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_uuid: {
      comment: "用户UUID",
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      comment: "操作类型",
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      comment: "操作描述",
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    api_path: {
      comment: "接口路径",
      type: DataTypes.STRING(255),
    },
    http_method: {
      comment: "HTTP方法",
      type: DataTypes.STRING(10),
    },
    ip_address: {
      comment: "IP地址",
      type: DataTypes.STRING(45),
    },
    user_agent: {
      comment: "用户代理",
      type: DataTypes.TEXT,
    },
    request_params: {
      comment: "请求参数",
      type: DataTypes.TEXT,
    },
    response_data: {
      comment: "返回数据",
      type: DataTypes.TEXT,
    },
    ...publicOptions,
  },
  {
    sequelize,
    tableName: getDbName("operation_log"),
    ...sequelizeTimeConfig,
  }
);

export default OperationLog;