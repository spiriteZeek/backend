import { sequelize } from "./db.js";
import { DataTypes, DATE } from "sequelize";

let UserLikeHistory;
try {
  UserLikeHistory = sequelize.define('user_like_history', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    news_id: { type: DataTypes.INTEGER, allowNull: false },
    liked_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'user_like_history',
    timestamps: false,
    indexes: [{ unique: true, fields: ['user_id', 'news_id'] }]
  });
} catch (error) {
  console.error('定义用户点赞历史表失败', error);
  throw new Error('Error define user_like_history')
}

export default UserLikeHistory;