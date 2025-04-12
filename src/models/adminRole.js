import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

let AdminRole;
try {
  AdminRole = sequelize.define("admin_role", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
  }, {
    timestamps: false
  });
} catch (error) {
  console.error("定义AdminRole模型失败", error);
}

export default AdminRole;