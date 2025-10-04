import sequelize, { sequelizeTimeConfig } from '@/database';
import { publicOptions } from '@/database/common';
import { getAppDbName } from '@/utils/database';
import { DataTypes, Model, Optional, type Association } from 'sequelize';
import User from './User';

// 定义用户邀请关系属性接口
interface UserInviteAttributes {
  uuid: string;
  user_uuid: string;
  invite_code: string;
  inviter_uuid?: string;
  level: number;
  created_at: Date;
  updated_at: Date;
}

// 定义创建用户邀请关系时的可选属性
interface UserInviteCreationAttributes
  extends Optional<UserInviteAttributes, 'uuid' | 'created_at' | 'updated_at'> {}

// 用户邀请关系模型
class UserInvite
  extends Model<UserInviteAttributes, UserInviteCreationAttributes>
  implements UserInviteAttributes
{
  public uuid!: string;
  public user_uuid!: string;
  public invite_code!: string;
  public inviter_uuid?: string;
  public level!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联关系声明
  public user?: User;
  public inviter?: User;

  // 关联关系定义
  public static associations: {
    user: Association<UserInvite, User>;
    inviter: Association<UserInvite, User>;
  };
}

// 初始化模型
UserInvite.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_uuid: {
      comment: '用户UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    invite_code: {
      comment: '邀请码（唯一）',
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: 'uk_invite_code',
    },
    inviter_uuid: {
      comment: '邀请人UUID（上级）',
      type: DataTypes.UUID,
    },
    level: {
      comment: '层级（1-一级，2-二级等）',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    ...publicOptions,
  },
  {
    sequelize,
    tableName: getAppDbName('user_invite'),
    ...sequelizeTimeConfig,
  }
);

// 定义关联关系
UserInvite.belongsTo(User, {
  foreignKey: 'user_uuid',
  targetKey: 'uuid',
  as: 'user',
});

UserInvite.belongsTo(User, {
  foreignKey: 'inviter_uuid',
  targetKey: 'uuid',
  as: 'inviter',
});

export default UserInvite;