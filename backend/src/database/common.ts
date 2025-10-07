import { formatDateTime } from '@/utils/format/time';
import { DataTypes } from 'sequelize';

/** 获取表名 */
export const getDbName = (name: string) => {
  return `console_${name}`;
};

/** 获取app端表名 */
export const getAppDbName = (name: string) => {
  return `app_${name}`;
};

/** 创建iso86时间字段配置 */
export const createISO8601Field = (fieldName: string) => {
  return {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => formatDateTime(new Date()),
    get(this: any) {
      const rawValue = this.getDataValue(fieldName);
      return rawValue;
    },
    set(this: any, value: any) {
      if (value instanceof Date) {
        this.setDataValue(fieldName, formatDateTime(value));
      } else if (typeof value === 'string') {
        // 如果已经是带时区的格式，直接使用
        if (value.includes('+') || (value.includes('-') && !value.endsWith('Z'))) {
          this.setDataValue(fieldName, value);
        } else {
          // 否则转换为带时区格式
          this.setDataValue(fieldName, formatDateTime(new Date(value)));
        }
      } else {
        this.setDataValue(fieldName, value);
      }
    },
  };
};

// const deleteOptions = {
//   deleted_at: {
//     comment: "删除时间",
//     type: DataTypes.DATE,
//   },
//   deleted_by_uuid: {
//     comment: "删除人UUID",
//     type: DataTypes.UUID,
//   },
// };
const byOptions = {
  created_by_uuid: {
    comment: '创建人UUID',
    type: DataTypes.UUID,
  },
  updated_by_uuid: {
    comment: '更新人UUID',
    type: DataTypes.UUID,
  },
};
/**
 * 生成完整的公共时间字段配置（包含 created_at, updated_at, created_by_uuid, updated_by_uuid）
 * @returns 完整的公共时间字段配置对象
 */
export const sequelizeCommonFields = () => {
  return {
    created_at: {
      comment: '创建时间',
      ...createISO8601Field('created_at'),
    },
    updated_at: {
      comment: '更新时间',
      ...createISO8601Field('updated_at'),
    },
    ...byOptions,
  };
};

// 软删除配置
export const sequelizeDeleteConfig = {
  paranoid: true,
  deletedAt: 'deleted_at',
};

// 自动创建时间配置
export const sequelizeCommonConfig = () => ({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
