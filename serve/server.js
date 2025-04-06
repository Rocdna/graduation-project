import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import corsOptions from './config/cors.js'
import cookieParser from 'cookie-parser'
import chalk from 'chalk'
import orderRoutes from './routes/order.routes.js'
import reviewRoutes from './routes/review.routes.js'
import tripRoutes from './routes/trip.routes.js'
import userRoutes from './routes/user.routes.js'
import notificationRoutes from './routes/notifications.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { startExpirationCheck } from './controllers/order.controller.js'
import { Server } from 'socket.io';
import http from 'http';
import User from './models/user.model.js';


// 加载环境变量
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})

const app = express()
const server = http.createServer(app)   // 创建 HTTP 服务器
const io = new Server(server, {
  cors: corsOptions, // 使用现有 CORS 配置
});

// 启用跨域资源共享
app.use(cors(corsOptions))
// 解析请求体
app.use(express.json())
// 解析cookie
app.use(cookieParser())

const PORT = process.env.PORT || 3000

// WebSocket 连接管理
const clients = new Map(); // 存储 userId 与 socket 的映射

io.on('connection', (socket) => {
  console.log(chalk.cyan(`WebSocket 客户端连接: ${socket.id}`));

  // 用户注册
  socket.on('register', async (data) => {
    const { userId, token } = data;
    try {
      // 验证 JWT
      const decoded = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
      if (decoded.id !== userId) {
        socket.disconnect();
        console.log(chalk.red(`用户 ${userId} 身份验证失败`));
        return;
      }

      // 检查用户角色
      const user = await User.findById(userId);
      const allowedRoles = ['passenger', 'driver', 'admin'];
      if (!user || !allowedRoles.includes(user.role)) {
        socket.disconnect();
        console.log(chalk.red(`用户 ${userId} 无权限使用 WebSocket`));
        return;
      }

      socket.userId = userId;
      clients.set(userId, socket);
      console.log(chalk.green(`用户 ${userId} 已注册 WebSocket，角色: ${user.role}`));
    } catch (error) {
      
    }
    socket.userId = userId; // 标记 userId
    clients.set(userId, socket);
    console.log(chalk.green(`用户 ${userId} 已注册 WebSocket`));
  });

  // 用户注销
  socket.on('disconnect', () => {
    if (socket.userId) {
      clients.delete(socket.userId);
      console.log(chalk.yellow(`用户 ${socket.userId} 已断开 WebSocket`));
    }
  });
});

// 通知函数：推送给指定用户
export const notifyUser = (userId, event, data) => {
  const socket = clients.get(userId.toString());
  if (socket) {
    socket.emit(event, data);
    console.log(chalk.blue(`推送 ${event} 给用户 ${userId}`));
  } else {
    console.log(chalk.red(`用户 ${userId} 未在线，无法推送 ${event}`));
  }
};

// 认证路由_登录、注册、获取用户信息
app.use('/auth', authRoutes)
// 订单路由
app.use('/orders', orderRoutes)
// 评价路由
app.use('/reviews', reviewRoutes)
// 行程路由
app.use('/trips', tripRoutes)
// 用户路由
app.use('/users', userRoutes)
// 通知路由
app.use('/notifications', notificationRoutes)
// 管理员路由
app.use('/admin', adminRoutes)

// 根路由
app.get('/', (req, res) => {
    res.send('Hello World!123')
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 提供 uploads 目录的静态访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 启动订单过期检查任务并保存任务引用
// const expirationTask = startExpirationCheck();


// 启动服务器
const startServer = async () => {
  try {
    await connectDB()
    console.log(chalk.green('MongoDB connected successfully')) // 绿色
    server.listen(PORT, () => {
      console.log(chalk.blue(`Server is running on port ${PORT}`)) // 蓝色
    })
    // 处理 nodemon 重启信号
    process.once('SIGUSR2', () => {
      expirationTask.stop(); // 停止 cron 任务
      server.close(() => {
        console.log(chalk.yellow('Server closed for nodemon restart'));
        process.kill(process.pid, 'SIGUSR2');
      });
    });
    // 处理手动退出 (Ctrl+C)
    process.on('SIGINT', () => {
      expirationTask.stop();
      server.close(() => {
        console.log(chalk.bgCyanBright('Server stopped'));
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(chalk.red('Failed to connect to MongoDB:', error)) // 红色
    process.exit(1)
  }
}

// 仅在非测试环境下启动服务器
if (process.env.NODE_ENV !== 'test') {
  startServer()
}


// 导出app实例用于测试
export default app