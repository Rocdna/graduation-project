import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import productRoutes from './routes/product.routes.js'
import authRoutes from './routes/auth.routes.js'
import corsOptions from './config/cors.js'
import cookieParser from 'cookie-parser'

// 加载环境变量
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})

const app = express()

// 启用跨域资源共享
app.use(cors(corsOptions))
// 解析请求体
app.use(express.json())
// 解析cookie
app.use(cookieParser())

const PORT = process.env.PORT || 3000

// 使用产品路由
app.use('/api/products', productRoutes)
// 认证路由_登录、注册、获取用户信息
app.use('/api/auth', authRoutes)
// 根路由
app.get('/', (req, res) => {
    res.send('Hello World!123')
})

// 导出app实例用于测试
export default app

// 启动服务器
const startServer = async () => {
  try {
    await connectDB()
    console.log('MongoDB connected successfully')
    app.listen(PORT, () => {
      console.log('Server is running on port ' + PORT)
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

// 仅在非测试环境下启动服务器
if (process.env.NODE_ENV !== 'test') {
  startServer()
}
