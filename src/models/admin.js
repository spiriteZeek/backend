import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

let Admin;
try {
  Admin = sequelize.define("admin", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_login: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: false
  });
} catch (error) {
  console.error("定义Admin模型失败：", error);
}

export default Admin;