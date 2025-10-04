import { DataTypes, Model, Optional, Op } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize, { sequelizeTimeConfig } from "../database";
import { getDbName } from "../utils/database";
import { publicOptions } from "../database/common";

// 定义用户属性接口
interface UserAttributes {
  uuid: string;
  username: string;
  phone?: string;
  email?: string;
  role_uuid?: string;
  password: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  status: number;
  created_at: Date;
  updated_at: Date;
}

// 定义创建用户时的可选属性
interface UserCreationAttributes
  extends Optional<UserAttributes, "uuid" | "created_at" | "updated_at"> {}

// 用户模型
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public uuid!: string;
  public username!: string;
  public phone?: string;
  public email?: string;
  public password!: string;
  public password_reset_token?: string;
  public password_reset_expires?: Date;
  public role_uuid?: string;
  public status!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 密码加密
  public async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
  }

  // 密码验证
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// 初始化模型
User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      comment: "用户名",
      type: DataTypes.STRING,
      allowNull: false,
      unique: "unique_username",
    },
    email: {
      comment: "邮箱",
      type: DataTypes.STRING,
      allowNull: false,
      unique: "unique_email",
      validate: {
        isEmail: true,
      },
    },
    phone: {
      comment: "手机号",
      type: DataTypes.STRING(11),
      unique: "unique_phone",
      validate: {
        is: /^1[3-9]\d{9}$/,
      },
    },
    role_uuid: {
      comment: "角色UUID",
      type: DataTypes.UUID,
    },
    password: {
      comment: "密码",
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_reset_token: {
      comment: "重置密码令牌",
      type: DataTypes.STRING,
    },
    password_reset_expires: {
      comment: "重置密码时间",
      type: DataTypes.DATE,
    },
    status: {
      comment: "状态：1启用，0禁用",
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    ...publicOptions,
  },
  {
    sequelize,
    tableName: getDbName("user"),
    ...sequelizeTimeConfig,
  }
);

// 钩子：保存前处理密码
User.beforeSave(async (user) => {
  if (user.changed("password") || user.isNewRecord) {
    await user.setPassword(user.password);
  }
});

export default User;
