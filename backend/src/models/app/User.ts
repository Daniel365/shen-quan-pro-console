import { DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize, { sequelizeTimeConfig } from "@/database";
import { getAppDbName } from "@/utils/database";
import { publicOptions } from "@/database/common";

// 定义App用户属性接口
interface AppUserAttributes {
  uuid: string;
  nickname: string;
  phone?: string;
  role_uuids: string[];
  password?: string;
  avatar?: string;
  gender?: number;
  invite_code?: string;
  status: number;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 定义创建App用户时的可选属性
interface AppUserCreationAttributes
  extends Optional<AppUserAttributes, "uuid" | "created_at" | "updated_at"> {}

// App用户模型
class AppUser
  extends Model<AppUserAttributes, AppUserCreationAttributes>
  implements AppUserAttributes
{
  public uuid!: string;
  public nickname!: string;
  public phone?: string;
  public role_uuids!: string[];
  public password?: string;
  public avatar?: string;
  public gender?: number;
  public invite_code?: string;
  public status!: number;
  public last_login_at?: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 密码加密
  public async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
  }

  // 密码验证
  public async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}

// 初始化模型
AppUser.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nickname: {
      comment: "用户昵称",
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    phone: {
      comment: "手机号",
      type: DataTypes.STRING(20),
      unique: "uk_phone",
    },
    role_uuids: {
      comment: "角色UUID数组",
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    password: {
      comment: "密码",
      type: DataTypes.STRING,
    },
    avatar: {
      comment: "头像URL",
      type: DataTypes.STRING,
    },
    gender: {
      comment: "性别（0-未知，1-男，2-女）",
      type: DataTypes.TINYINT,
    },
    invite_code: {
      comment: "邀请码",
      type: DataTypes.STRING(20),
    },
    status: {
      comment: "状态（1-正常，0-禁用）",
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    last_login_at: {
      comment: "最后登录时间",
      type: DataTypes.DATE,
    },
    ...publicOptions,
  },
  {
    sequelize,
    tableName: getAppDbName("user"),
    ...sequelizeTimeConfig,
  }
);

// 钩子：保存前处理密码
AppUser.beforeSave(async (user) => {
  if (user.changed("password") && user.password) {
    await user.setPassword(user.password);
  }
});

export default AppUser;
