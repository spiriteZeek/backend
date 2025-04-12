import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "./db.js";

let UserCommentHistory

try {
  UserCommentHistory = sequelize.define("user_comment_history", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      indexes: [
        {
          fields: ["user_id"],
        },
      ],
    },
    comment_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    news_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "news",
        key: "id",
      },
      indexes: [
        {
          fields: ["news_id"],
        },
      ],
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "news_categories",
        key: "id",
      },
      indexes: [
        {
          fields: ["category_id"],
        },
      ],
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parent_comment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user_comment_history",
        key: "id",
      },
    },
  });
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}表出错`, error);
}

export default UserCommentHistory;
