# MongoDB 学习笔记

## 项目更新记录

- 2025-01-11: 实现MVC架构
  - 创建controllers目录
  - 分离业务逻辑到product.controller.js
  - 重构路由使用controller方法
  - 添加createdAt和updatedAt时间戳

## 连接配置

- 连接时间：2025-01-11
- 测试接口：
  - GET /api/products
  - POST /api/products
  - PUT /api/products/:id
  - DELETE /api/products/:id

## 连接字符串
- 环境变量：`MONGO_URL`
- 默认值：`mongodb://localhost:27017`
- 当前配置：`mongodb://localhost:27017/test`

## 连接日志
成功连接时输出：
```
MongoDB Connected to database: product_db
Collections: [集合列表]
```

## 错误处理
- 连接失败时输出错误信息并退出进程
- 常见错误：
  - 连接超时
  - 认证失败
  - 网络不可达

## 最佳实践
1. 在生产环境中使用环境变量配置连接字符串
2. 添加重试机制
3. 使用连接池提高性能
   
## 项目目录结构
```
├── serve/                  # 后端代码
│   ├── config/             # 配置文件（如数据库连接）
│   ├── controllers/        # 控制器（处理请求逻辑）
│   ├── models/             # 数据模型（MongoDB Schema）
│   ├── routes/             # 路由（API端点）
│   ├── middleware/         # 中间件（如身份验证）
│   ├── utils/              # 工具函数（如JWT生成）
│   ├── app.js              # Express应用入口
│   └── server.js           # 服务器启动文件
├── client/                 # 前端代码
│   ├── public/             # 静态资源
│   ├── src/                # Vue.js源码
│   │   ├── assets/         # 静态资源（如图片）
│   │   ├── components/     # Vue组件
│   │   ├── router/         # 路由配置
│   │   ├── store/          # Vuex状态管理
│   │   ├── views/          # 页面视图
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 前端入口文件
│   └── package.json        # 前端依赖管理
├── .env                    # 环境变量配置文件
└── README.md               # 项目说明文档
```