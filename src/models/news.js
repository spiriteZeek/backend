import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "./db.js";

let News;
try {
  News = sequelize.define('news', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publish_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    source: {
      type: DataTypes.STRING(255)
    },
    author: {
      type: DataTypes.STRING(100),
    },
    popularity_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_breaking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
} catch (error) {
  console.error("sequelize定义错误", error)
}


export default News