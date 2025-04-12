import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "./db.js";


let User;
try {
  User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    register_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    last_login: {
      type: DataTypes.DATE
    },
    total_visits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    avg_stay_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    preferred_categories: {
      type: DataTypes.JSON
    },
    accessibility_settings: {
      type: DataTypes.JSON,
    }
  })
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}表出错`, error);
}

export default User;