import User from '../models/user.model.js'
import fs from 'fs';


// 上传头像（乘客、司机）
export const uploadAvatar = async (req, res) => {
    try {

      // 权限验证
      const userRole = req.user.role;
      const userId = req.user.id;
      if (!userId) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户未登录',
        });
      }
  
      // 限制上传权限
      if (!['passenger', 'driver'].includes(userRole)) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无权上传头像，仅乘客和司机可操作',
        });
      }
  
      // 检查文件上传
      if (!req.file) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '请上传头像文件',
        });
      }
  
      // 获取新头像文件名
      const newAvatarPath = req.file.filename;
      // 构造完整的文件 URL
      const fileUrl = `http://localhost:3000/uploads/${newAvatarPath}`; // 例如 /uploads/123456789.jpg 
  
      // 查询用户以获取旧头像
      const user = await User.findById(userId).select('profile.avatar');
      if (!user) {
        // 删除新上传的文件
        fs.unlink(`serve/uploads/${newAvatarPath}`, (err) => {
          if (err) console.error('删除文件失败:', err);
        });
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户不存在',
        });
      }
  
      // 删除旧头像（如果存在）
      if (user.profile.avatar) {
        fs.unlink(`serve/uploads/${user.profile.avatar}`, (err) => {
          if (err) console.error('删除旧头像失败:', err);
        });
      }
  
      // 更新用户头像路径
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { 'profile.avatar': fileUrl } }, // 部分更新
        { new: true, runValidators: true }
      ).select('profile.avatar');
  
      if (!updatedUser) {
        // 删除新上传的文件
        fs.unlink(`serve/uploads/${newAvatarPath}`, (err) => {
          if (err) console.error('删除文件失败:', err);
        });
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '更新用户失败',
        });
      }
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          avatar: fileUrl,
        },
        message: '上传头像成功',
      });
    } catch (error) {
      // 错误处理，删除新上传的文件
      if (req.file) {
        fs.unlink(`uploads/${req.file.filename}`, (err) => {
          if (err) console.error('删除文件失败:', err);
        });
      }
      console.error('上传头像失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: error.message || '服务器错误',
      });
    }
};

// 用户更新个人信息
export const updateProfile = async (req, res) => {
    try {
      // 权限验证（假设用户已通过 authMiddleware 认证）
      const userRole = req.user.role;
      const userId = req.user.id;
      if (!userId) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户未登录',
        });
      }
  
      // 获取请求体中的字段
      const {
        name,
        idNumber,
        birthDate,
        gender,
        licensePlate,
        vehicleModel,
        defaultPaymentMethod,
      } = req.body;
  
      // 构建更新对象
      const updateData = {};
      if (name) updateData['profile.name'] = name;
      if (idNumber) updateData['profile.idNumber'] = idNumber;
      if (birthDate) updateData['profile.birthDate'] = birthDate;
      if (gender && ['male', 'female', 'other'].includes(gender)) updateData['profile.gender'] = gender;
  
      // 角色特有字段验证
      if (userRole === 'driver') {
        if (licensePlate) updateData['profile.licensePlate'] = licensePlate;
        if (vehicleModel) updateData['profile.vehicleModel'] = vehicleModel;
      } else if (userRole === 'passenger') {
        if (defaultPaymentMethod) {
          updateData['profile.defaultPaymentMethod'] = defaultPaymentMethod;
        }
      }
      // 验证是否有字段更新
      if (Object.keys(updateData).length === 0) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '请提供至少一个字段进行更新',
        });
      }
    
      // 更新用户信息
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData }, // 使用点号路径更新嵌套字段
        { new: true, runValidators: true }
      ).select('profile');
  
      if (!user) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户不存在',
        });
      }
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          profile: user.profile,
        },
        message: '更新个人信息成功',
      });
    } catch (error) {
      console.error('更新个人信息失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 更改用户状态，在线、离线、冻结（管理员）
export const updateUserStatus = async (req, res) => {
    try {
      const adminId = req.user.id;
      const adminRole = req.user.role;
      const userId = req.params.userId;
      const { status } = req.body;
  
      // 权限验证
      if (adminRole !== 'admin') {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无权操作，仅管理员可更新用户状态',
        });
      }
  
      // 验证用户ID
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无效的用户ID',
        });
      }
  
      // 验证状态
      const user = await User.findById(userId);
      if (!user) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户不存在',
        });
      }
  
      if (!['locked', 'online', 'offline'].includes(status)) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: `无效的状态，${user.role === 'driver' ? '司机支持 online, active, locked, online, offline' : '乘客支持 inactive, active, locked'}`,
        });
      }
  
      // 更新状态
      user.profile.status = status;
      await user.save();
  
      // 记录日志
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          userId: user._id,
          status: user.profile.status,
        },
        message: '更新用户状态成功',
      });
    } catch (error) {
      console.error('更新用户状态失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 更改用户状态（司机）
export const updateDriverStatus = async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { status } = req.body;
  
      // 权限验证
      if (userRole !== 'driver') {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无权操作，仅司机可更新状态',
        });
      }
  
      // 验证状态
      if (!['online', 'offline'].includes(status)) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无效的状态，仅支持 online 或 offline',
        });
      }
  
      // 查询用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户不存在',
        });
      }
  
      // 确保用户状态不是 locked
      if (user.status === 'locked') {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '账户已冻结，无法更新状态',
        });
      }
  
      // 更新状态
      user.profile.status = status;
      await user.save();
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          status: user.profile.status,
        },
        message: '更新状态成功',
      });
    } catch (error) {
      console.error('更新司机状态失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 全屏特效
export const bgEffectSetting = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { flag } = req.body;
    // 权限验证
    if (userRole !== 'passenger' && userRole !== 'driver') {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权操作，仅乘客、司机可设置全屏特效',
      });
    }

    // 查询用户
    const user = await User.findById(userId);
    if (!user) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '用户不存在',
      });
    }

    // 更新状态
    user.bgEffect = flag;
    await user.save();

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        bgEffect: user.bgEffect,
      },
      message: '全屏特效更新成功',
    });
  } catch (error) {
    console.error('更新全屏特效失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
}
