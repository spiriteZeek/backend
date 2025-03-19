import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "./db.js";

let NewsAudio;
try {
  NewsAudio = sequelize.define('news_audio', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    news_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'news',
        key: 'id',
      },
      onDelete: 'CASCADE'
    },
    audio_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    format: {
      type:DataTypes.STRING(10),
      defaultValue: 'mp3',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    timestamps: false //禁用默认时间戳字段
  });
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}出错`, error)
}

export default NewsAudio;