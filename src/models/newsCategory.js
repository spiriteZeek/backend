import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

let NewsCategory
try {
  NewsCategory = sequelize.define('news_categories', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    }
  });
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}表出错:`,error)
}

export default NewsCategory;