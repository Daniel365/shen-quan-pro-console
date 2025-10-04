/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: 消息通知模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database";
import { v4 as uuidv4 } from "uuid";
import { getDbName } from "../utils/database";

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
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, "uuid" | "is_read" | "created_at" | "updated_at"> {}

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
}

Notification.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv4(),
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: getDbName("notifications"),
    timestamps: true,
    underscored: true,
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
