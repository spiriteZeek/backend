import bcrypt from 'bcryptjs';
import Admin from '../models/admin.js';
import { sign, verify } from '../utils/token.js'
import AdminRole from '../models/adminRole.js';

class adminService {
  // 注册管理员
  static async registerAdmin(username, password) {
    const existing = await Admin.findOne({ where: { username } });
    if (existing) {
      throw new Error("管理员已存在");
    }
  
    const hash = await bcrypt.hash(password, 10);
    await Admin.create({
      username,
      password_hash: hash,
    });
  }

  // 登录
  static async loginAdmin(username, password) {
    const admin = await Admin.findOne({
      where: { username },
      include: {
        model: AdminRole,
        through: { attributes: []}, //不带中间表字段
      },
    });

    if (!admin) throw new Error("用户名不存在");

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) throw new Error('密码错误');

    const roles = admin.admin_roles.map(r => r.role_name);

    const token = sign({
      admin_id: admin.id, 
      username: admin.username, 
      roles
    });

    return {
      admin_id: admin.id,
      username: admin.username,
      token,
    };
  };
}

export default adminService;