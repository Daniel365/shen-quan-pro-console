import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { Association, DataTypes, Model } from 'sequelize';
import User from './AppUser';

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
interface UserInviteCreationAttributes extends CreateAttributes<UserInviteAttributes> {}

// 用户邀请关系模型
class AppUserInvite
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
    user: Association<AppUserInvite, User>;
    inviter: Association<AppUserInvite, User>;
  };
}

// 初始化模型
AppUserInvite.init(
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
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('user_invite'),
    ...sequelizeCommonConfig(),
  }
);

export default AppUserInvite;
