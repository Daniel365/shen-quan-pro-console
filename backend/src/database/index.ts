/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 23:06:01
 * @Description: 连接数据库
 */
import { Sequelize } from "sequelize";

// 数据库配置
const params = {
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "root",
  dbName: process.env.DB_NAME || "single_economy",
  dbPort: parseInt(process.env.DB_PORT || "3306"),
};

// 数据库配置
const sequelize = new Sequelize(
  params.dbName,
  params.dbUser,
  params.dbPassword,
  {
    host: params.dbHost,
    dialect: "mysql", // 可以根据需要改为 'postgres', 'sqlite', 'mssql'
    port: params.dbPort,
    logging: false, // 生产环境可以设置为false关闭SQL日志
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// 自动创建时间配置
export const sequelizeTimeConfig = {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
};

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testConnection();

export default sequelize;
