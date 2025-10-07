/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: 消息通知模型
 */
import { DataTypes, Model } from "sequelize";
import sequelize from "@/database";
import { getDbName, sequelizeCommonFields, sequelizeCommonConfig } from "@/database/common";
import { CreateAttributes } from "@/types/database";

export interface NotificationAttributes {
  uuid: string;
  title: string;
  content: string;
  type: "info" | "warning" | "error" | "success";
  sender_uuid?: string; // 发送者UUID（管理员）
  receiver_uuid?: string; // 接收者UUID（特定用户，为空表示全体用户）
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
  created_by_uuid?: string;
  updated_by_uuid?: string;
}

interface NotificationCreationAttributes
  extends Omit<CreateAttributes<NotificationAttributes>, "is_read"> {}
class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public uuid!: string;
  public title!: string;
  public content!: string;
  public type!: "info" | "warning" | "error" | "success";
  public sender_uuid!: string;
  public receiver_uuid!: string;
  public is_read!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public created_by_uuid?: string;
  public updated_by_uuid?: string;
}

Notification.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "通知标题",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "通知内容",
    },
    type: {
      type: DataTypes.ENUM("info", "warning", "error", "success"),
      allowNull: false,
      defaultValue: "info",
      comment: "通知类型",
    },
    sender_uuid: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "发送者UUID",
    },
    receiver_uuid: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "接收者UUID，为空表示全体用户",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否已读",
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getDbName("notifications"),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        fields: ["receiver_uuid"],
      },
      {
        fields: ["sender_uuid"],
      },
      {
        fields: ["is_read"],
      },
    ],
  }
);

export default Notification;
