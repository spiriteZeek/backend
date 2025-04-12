import Sequelize from 'sequelize'
import { DBConfig } from '../../config/config.js'


const sequelize = new Sequelize(DBConfig.DATABASE, DBConfig.USER, DBConfig.PASSWORD, {
  host: DBConfig.HOST,
  dialect: 'mysql',
})

// 测试数据库连接
sequelize.authenticate()
.then(() => {
  console.log("数据库连接成功");
})
.catch((error) => {
  console.log("数据库连接失败:",error)
})
export {
  sequelize,
}