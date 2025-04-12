import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

let NewsCategoryRel; 

try {
  NewsCategoryRel = sequelize.define('news_category_rel', {
    news_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    is_primary: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否为主分类',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '分类排序顺序',
    },
    source: {
      type: DataTypes.STRING(20),
      defaultValue: 'system',
      comment: '分类来源：system / user / custom',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    freezeTableName: true,  //表名不加s
    timestamps: false,  // 不自动生成createdAt/updatedAt
    index: [
      {
        unique: true,
        fields: ['news_id', 'category_id'],
        name: 'unique_news_category'
      },
      { fields: ['news_id'] },
      { fields: ['category_id'] }
    ],
  });
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}表出错`, error);
}

export default NewsCategoryRel;