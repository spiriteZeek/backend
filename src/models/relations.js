import User from "./user.js";
import UserBrowsingHistory from "./userBrowsingHistory.js";
import UserAudioHistory from "./userAudioHistory.js";
import UserCommentHistory from "./userCommentHistory.js";
import News from "./news.js";
import NewsCategory from "./newsCategory.js";
import NewsCategoryRel from "./newsCategoryRel.js";
import NewsAudio from "./newsAudio.js";
import NewsComment from "./newsComment.js";
import Admin from "./admin.js";
import AdminLog from "./adminLog.js";
import AdminRole from "./adminRole.js";
import AdminRoleRel from "./adminRoleRel.js";

// 封装关联关系定义函数
function defineAssociations() {
  try {
    // 用户与浏览历史、音频历史、评论历史、新闻评论的关联
    User.hasMany(UserBrowsingHistory, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    UserBrowsingHistory.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(UserAudioHistory, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    UserAudioHistory.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(UserCommentHistory, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    UserCommentHistory.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(NewsComment, { foreignKey: "user_id", onDelete: "CASCADE" });
    NewsComment.belongsTo(User, { foreignKey: "user_id" });

    // 新闻与浏览历史、音频历史、评论历史、分类关联、音频、新闻评论的关联
    News.hasMany(UserBrowsingHistory, {
      foreignKey: "news_id",
      onDelete: "CASCADE",
    });
    UserBrowsingHistory.belongsTo(News, { foreignKey: "news_id" });

    News.hasMany(UserAudioHistory, {
      foreignKey: "news_id",
      onDelete: "CASCADE",
    });
    UserAudioHistory.belongsTo(News, { foreignKey: "news_id" });

    News.hasMany(UserCommentHistory, {
      foreignKey: "news_id",
      onDelete: "CASCADE",
    }); // 统一使用 news_id
    UserCommentHistory.belongsTo(News, { foreignKey: "news_id" });

    News.hasMany(NewsCategoryRel, {
      foreignKey: "news_id",
      onDelete: "CASCADE",
    });
    NewsCategoryRel.belongsTo(News, { foreignKey: "news_id" });

    NewsCategory.hasMany(NewsCategoryRel, {
      foreignKey: "category_id",
      onDelete: "CASCADE",
    });
    NewsCategoryRel.belongsTo(NewsCategory, { 
      foreignKey: "category_id",
      as: 'news_category',
    });

    News.hasOne(NewsAudio, { foreignKey: "news_id", onDelete: "CASCADE" });
    NewsAudio.belongsTo(News, { foreignKey: "news_id" });

    News.hasMany(NewsComment, { foreignKey: "news_id", onDelete: "CASCADE" }); // 统一使用 news_id
    NewsComment.belongsTo(News, { foreignKey: "news_id" });

    // 新闻评论的自关联
    NewsComment.belongsTo(NewsComment, { foreignKey: "parent_comment_id" });

    // 管理员与操作日志
    Admin.hasMany(AdminLog, {
      foreignKey: "admin_id",
      onDelete: "CASCADE",
    });
    AdminLog.belongsTo(Admin, { foreignKey: "admin_id"});

    // 多对多关系：管理员<-->角色
    Admin.belongsToMany(AdminRole, {
      through: AdminRoleRel,
      foreignKey: "admin_id",
      otherKey: "role_id",
      onDelete: "CASCADE",
    });
    AdminRole.belongsToMany(Admin, {
      through: AdminRoleRel,
      foreignKey: "role_id",
      otherKey: "admin_id",
      onDelete: "CASCADE",
    });

    // 直接使用AdminRoleRel模型做CURD
    AdminRoleRel.belongsTo(Admin, { foreignKey: "admin_id" });
    AdminRoleRel.belongsTo(AdminRole, { foreignKey: "role_id" });
  } catch (error) {
    console.error("定义模型关联关系时出错:", error);
  }
}

// 调用关联关系定义函数
defineAssociations();

export {
  User,
  UserBrowsingHistory,
  UserAudioHistory,
  UserCommentHistory,
  News,
  NewsCategory,
  NewsCategoryRel,
  NewsAudio,
  NewsComment,
  Admin,
  AdminLog,
  AdminRole,
  AdminRoleRel
};
