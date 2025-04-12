import { DataTypes, Sequelize } from 'sequelize'
import { sequelize } from './db.js'

let UserBrowsingHistory;
try {
  UserBrowsingHistory = sequelize.define('user_browsig_history', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      index: [
        {
          fields: ['user_id']
        }
      ]
    },
    browse_date: {
      type: DataTypes.NOW,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    news_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'news',
        key: 'id',
      },
      index: [
        {
          fields: ['news_id']
        }
      ]
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'news_categories',
        key: 'id',
      },
      index: [
        {
          fields: ['category_id'],
        }
      ]
    },
    stay_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}表出错`, error);
}

export default UserBrowsingHistory;