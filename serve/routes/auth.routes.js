import express from 'express'
import { register, login, isExists, refreshToken, logout, resetPassword, getUserInfo } from '../controllers/auth.controller.js'

const router = express.Router()

// 用户注册
router.post('/register', register)
// 用户登录
router.post('/login', login)
// 用户退出登录
router.post('/logout', logout)
// 用户是否已存在
router.get('/userIsExists', isExists)
// 重置密码
router.post('/resetPassword', resetPassword)
// 刷新token
router.post('/refreshToken', refreshToken)
// 获取用户信息
router.get('/getUserInfo', getUserInfo)

export default router
