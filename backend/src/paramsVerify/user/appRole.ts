import { DataTypes } from "sequelize";
import { ReqParamsVerifyRule } from "../../types/interfaceRequest";

/** 创建角色表单校验 */
export const createRoleRule: ReqParamsVerifyRule[] = [
  {
    filed: "name",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.nameRequired",
      },
    ],
  },
  {
    filed: "code",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.codeRequired",
      },
    ],
  },
  {
    filed: "description",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: false,
        messageKey: "validation.descriptionRequired",
      },
    ],
  },
  {
    filed: "permission_ids",
    dataType: DataTypes.JSON,
    rule: [
      {
        required: false,
        messageKey: "validation.permissionIdsRequired",
      },
    ],
  },
];

/** 更新角色表单校验 */
export const updateRoleRule: ReqParamsVerifyRule[] = [
  {
    filed: "uuid",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.uuidRequired",
      },
    ],
  },
  {
    filed: "name",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: false,
        messageKey: "validation.nameRequired",
      },
    ],
  },
  {
    filed: "code",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: false,
        messageKey: "validation.codeRequired",
      },
    ],
  },
  {
    filed: "description",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: false,
        messageKey: "validation.descriptionRequired",
      },
    ],
  },
  {
    filed: "permission_ids",
    dataType: DataTypes.JSON,
    rule: [
      {
        required: false,
        messageKey: "validation.permissionIdsRequired",
      },
    ],
  },
  {
    filed: "status",
    dataType: DataTypes.INTEGER,
    rule: [
      {
        required: false,
        messageKey: "validation.statusRequired",
      },
    ],
  },
];

/** 删除角色表单校验 */
export const deleteRoleRule: ReqParamsVerifyRule[] = [
  {
    filed: "uuid",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.uuidRequired",
      },
    ],
  },
];

/** 获取角色详情表单校验 */
export const detailRoleRule: ReqParamsVerifyRule[] = [
  {
    filed: "uuid",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.uuidRequired",
      },
    ],
  },
];