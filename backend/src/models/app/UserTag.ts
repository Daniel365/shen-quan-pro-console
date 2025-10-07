import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface UserTagAttributes {
  uuid: string;
  user_uuid: string;
  tag_uuid: string;
  created_at: Date;
  updated_at: Date;
}

interface UserTagCreationAttributes extends CreateAttributes<UserTagAttributes> {}

class UserTag
  extends Model<UserTagAttributes, UserTagCreationAttributes>
  implements UserTagAttributes
{
  public uuid!: string;
  public user_uuid!: string;
  public tag_uuid!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserTag.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_uuid: {
      comment: '用户ID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    tag_uuid: {
      comment: '标签ID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('user_tag'),
    ...sequelizeCommonConfig(),
  }
);

export default UserTag;
