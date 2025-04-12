import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

let AdminRoleRel;
try {
  AdminRoleRel = sequelize.define("admin_role_rel", {
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
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    freezeTableName: true  // ✅ 禁止 Sequelize 自动加 s
  });
} catch (error) {
  console.error('定义AdminRoleRel模型失败', error);
}

export default AdminRoleRel;