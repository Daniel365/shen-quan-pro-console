import { DataTypes } from "sequelize";
import { ReqParamsVerifyRule } from "../../types/interfaceRequest";

/** 更新用户信息表单校验 */
export const updateUserRule: ReqParamsVerifyRule[] = [
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
    filed: "role_uuids",
    dataType: DataTypes.JSON,
    rule: [
      {
        required: false,
        messageKey: "validation.roleUuidsRequired",
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
  {
    filed: "invite_code",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: false,
        messageKey: "validation.inviteCodeRequired",
      },
    ],
  },
];

/** 批量更新用户表单校验 */
export const batchUpdateUserRule: ReqParamsVerifyRule[] = [
  {
    filed: "user_list",
    dataType: DataTypes.JSON,
    rule: [
      {
        required: true,
        messageKey: "validation.userListRequired",
      },
    ],
  },
];