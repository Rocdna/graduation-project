import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// 密码强度要求
const passwordRequirements = {
  minLength: 6,
  maxLength: 20,
  requireUppercase: false,
  requireNumber: false,
  requireSpecialChar: false,
};

// 验证密码强度
const validatePassword = (password) => {
  if (password.length < passwordRequirements.minLength) {
    return "密码至少需要6个字符";
  }
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    return "密码必须包含至少一个大写字母";
  }
  if (passwordRequirements.requireNumber && !/[0-9]/.test(password)) {
    return "密码必须包含至少一个数字";
  }
  if (passwordRequirements.requireSpecialChar && !/[!@#$%^&*.]/.test(password)) {
    return "密码必须包含至少一个特殊字符";
  }
  if (password.length > passwordRequirements.maxLength) {
    return "密码不能超过20个字符";
  }
  return null;
};

// 生成JWT
const generateTokens = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: '15m' } // 短期有效
  );
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: '30d' } // 长期有效
  );
  return { token, refreshToken };
};

// 用户是否已存在
export const isExists = async (req, res) => {
  const { username, role } = req.query;
  try {
    let user = null;
    if (username && role) {
      user = await User.findOne({ username, role });
    }
    if (user) {
      res.status(200).json({ code: 200, message: "用户存在", data: { exists: true, user }});
    } else {
      res.status(200).json({ code: 201, message: "用户不存在", data: { exists: false, user: null }});
    }
  } catch (error) {
    console.error('检查用户存在性时出错:', error);
    res.status(500).json({ code: 400, message: '内部服务器错误', data: {}});
  }
}

// 注册
export const register = async (req, res) => {
  try {
    const { userName, password, role, phone } = req.body;

    // 验证请求体
    if (!userName || !password) {
      return res.status(200).json({ code: 201, message: "用户名和密码是必填项", data:{} });
    }

    // 验证密码强度
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(200).json({ code: 201, message: passwordError, data:{} });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(200).json({ code: 201, message: "该用户已存在!", data: { exists: true }});
    }

    // 创建新用户
    const user = new User({
      username: userName,
      password,
      phone,
      role: role || "passenger",
      lastLogin: null,
      profile: {
        name: userName,
        avatar: 'https://truth.bahamut.com.tw/s01/202311/ef035e9530a6934772b4fa9cdb7de40b.JPG',
        birthDate: '2025-03-01'
      }
    });
    
    await user.save();

    // 移除敏感信息
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      code: 200,
      message: "注册成功",
      data: {
        ...userResponse
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ code: 400, message: error.message, data:{} });
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({ code: 400, message: "*********", data:{} });
    }
    // Log the error with more context
    console.error(`Registration error for username ${username}:`, error);
    // Return a more structured error response
    res.status(500).json({
      code: 400,
      message: "注册失败，请稍后重试",
      data: {
        errorCode: "REG_500",
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === "development" ? {
          message: error.message,
          stack: error.stack
        } : undefined,
      }
    });
  }
};

// 登录
export const login = async (req, res) => {
  try {
    const { userName, password, role } = req.body;
    // 验证请求体
    if (!userName || !password) {
      return res.status(200).json({ 
        code: 201, 
        message: "用户名和密码是必填项" ,
        data:{}
      });
    }
    const username = userName
    // 查找用户
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(200).json({
        code: 201, 
        message: "该用户不存在" ,
        data: { exists: false }
      });
    }
    // 验证密码，有加密
    // const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "密码错误"
    //   });
    // }

    //验证密码，无加密
    const pwd = await User.findOne({ username, role, password });
    if (!pwd) {
      return res.status(200).json({
        code: 201, 
        message: "用户名或密码错误" ,
        data: { success: false }
      });
    }

    // 更新最后登录时间和状态
    user.lastLogin = new Date();
    
    await user.save();
    // 生成JWT
    const tokens = generateTokens(user);
    // 移除敏感信息
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json({ 
      data: { 
        ...userResponse, 
        token: tokens.token,
        refreshToken: tokens.refreshToken
      }, 
      code: 200 
    });
  } catch (error) {
    console.error("登录错误:", error);
    // Log the error with more context
    return res.status(500).json({
      code: 400,
      message: "登录失败，请稍后重试",
      data: {
        errorCode: "AUTH_500",
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === "development" ? {
          message: error.message,
          stack: error.stack
        } : undefined
      }
    });
  }
};

// 退出登录
export const logout = async (req, res) => {
  try {
    res.status(200).json({ code: 200, message: '退出登录成功', data: {} });
  } catch (error) {
    console.error("退出登录时出错:", error);
    res.status(500).json({ code: 500, message: '内部服务器错误', data: {} });
  }
};

// 重置密码，简洁
export const resetPassword = async (req, res) => {
  const { phone, password, role } = req.body;
  try {
    if (!phone || !password || !role) {
      return res.status(200).json({ code: 200, error: 'Missing required fields', data:{} });
    }
    // 验证密码强度
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(200).json({ code: 200, message: passwordError, data: {} });
    }
     // 查找用户
     const user = await User.findOne({ phone, role });
     if (!user) {
       return res.status(200).json({ code: 200, message: '该用户不存在', data: { exists: true } });
     }

    // 更新密码
    user.password = password;
    await user.save();

    // 移除敏感信息
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ code: 200, message: '密码重置成功', data: userResponse });

  } catch (error) {
    console.error("重置密码时出错:", error);
    res.status(500).json({ code: 500, message: '内部服务器错误', data: {} });
  }
};

// 刷新 Token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      console.warn('Refresh token not provided');
      return res.status(200).json({ 
        code: 777, 
        message: '未提供 Refresh token', 
        data: {} 
      });
    }

    // 验证 refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    
    // 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn(`User not found for refresh token: ${decoded.id}`);
      return res.status(200).json({ 
        code: 777, 
        message: '未找到用户', 
        data: {} 
      });
    }

    // 生成新的 tokens
    const tokens = generateTokens(user);

    // 返回新的 tokens
    return res.json({ 
      code: 200, 
      message: 'token 刷新成功', 
      data: { 
        token: tokens.token,
        refreshToken: tokens.refreshToken
      } 
    });

  } catch (error) {
    console.error('Refresh token error:', error);

    // refresh token 过期
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        code: 777, 
        message: 'Refresh token expired', 
        data: {} 
      });
    }

    // refresh token 无效
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        code: 777, 
        message: '无效 refresh token', 
        data: {} 
      });
    }

    return res.status(500).json({ 
      code: 777, 
      message: 'Internal server error', 
      data: {} 
    });
  }
}

// 获取用户信息
export const getUserInfo = async (req, res) => {
  try {
    // 从JWT中获取用户ID, token 过期
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(203).json({ code: 333, message: '未授权', data: { success: false } });
    }
    // 验证token  
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    // 查询用户信息
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(203).json({ code: 201, message: '用户不存在', data: { success: false } });
    }
    res.status(200).json({ 
      code: 200, 
      message: '获取用户信息成功',
      data: user 
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(200).json({ code: 333, message: '无效的token', data: {} });
    }
    res.status(500).json({ 
      code: 500, 
      message: '获取用户信息失败',
      data: {} 
    });
  }
}
