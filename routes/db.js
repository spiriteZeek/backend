import mysql from 'mysql2/promise';

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'news_db',
})

// 用户名查询
async function getUserByUsername(username) {
  const [rows] = await pool.execute('SELECT * FROM `users` WHERE `username` = ?', [username]);
  return rows[0];
}

// 邮箱查询
async function getUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM `users` WHERE `email` = ?', [email]);
  return rows[0];
}

// 插入新用户
async function insertUser(username, email, hashedPassword, isAdmin) {
  const [result] = await pool.execute('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, isAdmin]);
  return result.insertId;
}

export {
  getUserByUsername,
  getUserByEmail,
  insertUser
}