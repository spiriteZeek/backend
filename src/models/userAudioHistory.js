import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "./db.js";

// TODO:增加索引，提高查询性能
// eg:
// user_id: {
//   type: DataTypes.INTEGER,
//   allowNull: false,
//   references: {
//       model: 'users',
//       key: 'id'
//   },
//   indexes: [
//       {
//           fields: ['user_id']
//       }
//   ]
// }

let UserAudioHistory;
try {
  UserAudioHistory = sequelize.define('user_audio_history', {
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
      },
    },
    news_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'news',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'news_categories',
        key: 'id',
    }
    },
    play_date: {
      type:DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    play_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  })
} catch (error) {
  console.error(`sequelize定义${import.meta.filename}表出错`, error);
}

export default UserAudioHistory;