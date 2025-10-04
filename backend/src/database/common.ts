import { DataTypes } from "sequelize";

/** 公共参数 */
export const publicOptions = {
  created_at: {
    comment: "创建时间",
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    comment: "更新时间",
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
};
