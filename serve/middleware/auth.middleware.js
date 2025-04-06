import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const authMiddleware = (allowedRoles = [], excludedRoles = []) => {
    return async (req, res, next) => {
        try {
            // 从请求头获取 token
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(200).json({
                    code: 401,
                    data: { success: false }, 
                    message: '未提供认证令牌' 
                });
            }
            // 提取 token
            const token = authHeader?.split(' ')[1];
            try {
                // 验证 token
                const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
                // 查找用户
                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(200).json({
                        code: 401,
                        data: { success: false }, 
                        message: '用户不存在' 
                    });
                }
                // 将用户信息添加到请求对象中
                req.user = user;
                
                // 添加权限检查：检查角色是否在 allowedRoles 中，且不在 excludedRoles 中
                if (!user.role || !allowedRoles.includes(user.role) || excludedRoles.includes(user.role)) {
                    return res.status(200).json({
                        code: 403,
                        data: { success: false }, 
                        message: `权限不足，允许的角色为: ${allowedRoles.join(', ')}，排除的角色为: ${excludedRoles.join(', ')}`
                    });
                }
                next();
            } catch (error) {
                return res.status(200).json({
                    code: 401,
                    data: { success: false }, 
                    message: '无效的认证令牌' 
                });
            }
        } catch (error) {
            return res.status(500).json({ 
                code: 500,
                data: { success: false }, 
                message: '服务器错误' 
            });
        }
    };
};

export default authMiddleware; 