import sequelize from '@/database';
import {
  createISO8601Field,
  getAppDbName,
  sequelizeCommonConfig,
  sequelizeCommonFields,
} from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';
import ActivityTranslation from './ActivityTranslation';

interface ActivityAttributes {
  uuid: string;
  base_price: number;
  male_price: number;
  female_price: number;
  location: string;
  start_time: Date;
  end_time: Date;
  reg_limit: number;
  tags: string[];
  status: number;
  publisher_uuid: string;
  publish_source: number;
  created_at: Date;
  updated_at: Date;
}

interface ActivityAssociations {
  translations?: ActivityTranslation[];
}

interface ActivityCreationAttributes extends CreateAttributes<ActivityAttributes> {}

class Activity
  extends Model<ActivityAttributes, ActivityCreationAttributes>
  implements ActivityAttributes, ActivityAssociations
{
  public uuid!: string;
  public base_price!: number;
  public male_price!: number;
  public female_price!: number;
  public location!: string;
  public start_time!: Date;
  public end_time!: Date;
  public reg_limit!: number;
  public tags!: string[];
  public status!: number;
  public publisher_uuid!: string;
  public publish_source!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public translations?: ActivityTranslation[];
}

Activity.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    base_price: {
      comment: '基础价格',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    male_price: {
      comment: '男性专属价格',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    female_price: {
      comment: '女性专属价格',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    location: {
      comment: '活动地点',
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      comment: '标签',
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    start_time: {
      comment: '活动开始时间',
      ...createISO8601Field('start_time'),
    },
    end_time: {
      comment: '活动结束时间',
      ...createISO8601Field('end_time'),
    },
    reg_limit: {
      comment: '报名人数上限',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      comment: '状态：1启用，0禁用',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    publisher_uuid: {
      comment: '发布人UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    publish_source: {
      comment: '发布来源：1-console，2-app',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('activity'),
    ...sequelizeCommonConfig(),
  }
);

export default Activity;
