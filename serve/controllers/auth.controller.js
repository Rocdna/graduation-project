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
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: '15m' } // 短期有效
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: '30d' } // 长期有效
  );
  return { accessToken, refreshToken };
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
      res.status(200).json({ success: true, exists: true, user });
    } else {
      res.status(200).json({ success: true, exists: false });
    }
  } catch (error) {
    console.error('检查用户存在性时出错:', error);
    res.status(500).json({ error: '内部服务器错误' });
  }
}

// 注册
export const register = async (req, res) => {
  try {
    const { username, password, role, email } = req.body;

    // 验证请求体
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码是必填项" });
    }

    // 验证密码强度
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      return res.status(400).json({ message: "该用户已存在!" });
    }

    // 创建新用户
    const user = new User({
      username,
      password,
      email,
      role: role || "user",
      lastLogin: null,
    });
    await user.save();

    // 移除敏感信息
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "注册成功",
      ...userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({ message: "*********" });
    }
    // Log the error with more context
    console.error(`Registration error for username ${username}:`, error);
    // Return a more structured error response
    res.status(500).json({
      success: false,
      message: "注册失败，请稍后重试",
      errorCode: "REG_500",
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === "development" ? {
        message: error.message,
        stack: error.stack
      } : undefined,
    });
  }
};


// 登录
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    // 验证请求体
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "用户名和密码是必填项" 
      });
    }
    // 查找用户
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(401).json({
        success: false, 
        message: "该用户不存在" 
      });
    }
    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "密码错误" 
      });
    }
    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();
    // 生成JWT
    const tokens = generateTokens(user);
    // 移除敏感信息
    const userResponse = user.toObject();
    delete userResponse.password;
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false, // 使用 HTTPS 时设置为 true
      sameSite: 'strict'
    });
    return res.json({ ...userResponse, accessToken: tokens.accessToken, success: true });
  } catch (error) {
    console.error("登录错误:", error);
    // Log the error with more context
    console.error(`Login error for user ${username}:`, error);
    // Return a more structured error response
    return res.status(500).json({
      success: false,
      message: "登录失败，请稍后重试",
      errorCode: "AUTH_500",
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === "development" ? {
        message: error.message,
        stack: error.stack
      } : undefined,
    });
  }
};


// 刷新 Token
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }
  jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  });
}

