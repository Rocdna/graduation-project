import express from 'express'
import { register, login, isExists, refreshToken } from '../controllers/auth.controller.js'

const router = express.Router()

// 用户注册
router.post('/register', register)
// 用户登录
router.post('/login', login)
// 用户是否已存在
router.get('/userIsExists', isExists)
// 刷新token
router.post('/refresh', refreshToken)

export default router
