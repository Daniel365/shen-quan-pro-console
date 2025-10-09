/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 21:35:00
 * @Description: 用户邀请模型
 */
import { getDbName, sequelizeCommonConfig, sequelizeCommonFields } from '@/database/common';
import { DataTypes, Model } from 'sequelize';
// type
import sequelize from '@/database';
import type { CreateAttributes } from '@/types/database';

// 定义邀请码属性接口
interface UserInviteAttributes {
  uuid: string;
  user_uuid: string;
  invite_code: string;
  inviter_uuid?: string; // 邀请人UUID（上级）
  level: number; // 层级（1-一级，2-二级等）
  created_at: Date;
  updated_at: Date;
}

// 定义创建邀请码时的可选属性
interface UserInviteCreationAttributes extends CreateAttributes<UserInviteAttributes> {}
// 邀请码模型
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
}

// 初始化模型
UserInvite.init(
  {
    invite_code: {
      allowNull: false,
      comment: '邀请码',
      type: DataTypes.STRING(20),
    },
    inviter_uuid: {
      allowNull: true,
      comment: '邀请人UUID（上级）',
      references: {
        key: 'uuid',
        model: 'app_user',
      },
      type: DataTypes.UUID,
    },
    level: {
      allowNull: false,
      comment: '层级（1-一级，2-二级等）',
      defaultValue: 1,
      type: DataTypes.TINYINT,
    },
    user_uuid: {
      allowNull: false,
      comment: '用户UUID',
      references: {
        key: 'uuid',
        model: 'app_user',
      },
      type: DataTypes.UUID,
    },
    uuid: {
      comment: '记录UUID',
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getDbName('user_invite'),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        fields: ['user_uuid'],
        name: 'idx_user_uuid',
      },
      {
        fields: ['inviter_uuid'],
        name: 'idx_inviter_uuid',
      },
      {
        fields: ['invite_code'],
        name: 'idx_invite_code',
      },
      {
        fields: ['user_uuid', 'inviter_uuid', 'level'],
        name: 'uk_user_inviter_level',
        unique: true,
      },
    ],
  }
);

export default UserInvite;
