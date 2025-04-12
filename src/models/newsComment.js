import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "./db.js";


let NewsComment;
try {
  NewsComment = sequelize.define('news_comments', {
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
        key: 'id'
      }
    },
    news_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'news',
        key: 'id'
      }
    },
    comment_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parent_comment_id: {
      type: DataTypes.INTEGER,
    }
  })
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}表出错`, error);
}

export default NewsComment;