import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

let AdminLog;
try {
  AdminLog = sequelize.define("admin_log", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admin',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING(50),
    },
    target_id: {
      type: DataTypes.INTEGER,
    },
    ip_address: {
      type: DataTypes.STRING(50),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
} catch (error) {
  console.error("定义AdminLog模型失败", error);
}

export default AdminLog;