import express from 'express'
import {
  createOrder,
  getOrderById,
  acceptOrder,
  cancelOrder,
  getUserOrders,
  getTripOrders,
  confirmOrder,
  updatePaymentStatus,
  rateOrder,
  completeOrder,
  getAvailableOrders,
  getDriverTasks,
  getPassengerOrder
} from '../controllers/order.controller.js'

import authMiddleware from '../middleware/auth.middleware.js'

const router = express.Router()

// 创建订单（仅乘客）
router.post('/', authMiddleware(['passenger']), createOrder);

// 司机接受订单（司机、管理员）
router.patch('/:id/match', authMiddleware(['driver', 'admin']), acceptOrder);

// 确认订单（司机）
router.patch('/:id/confirm', authMiddleware(['driver', 'admin']), confirmOrder);

// 完成订单（司机、管理员）
router.patch('/:id/complete', authMiddleware(['driver', 'admin']), completeOrder);

// 取消订单（乘客、管理员）
router.delete('/:id/cancel', authMiddleware(['passenger', 'admin']), cancelOrder);


// 更新支付状态（乘客、管理员）
router.patch('/:id/payment', authMiddleware(['passenger', 'admin']), updatePaymentStatus);

// 提交订单评价（乘客、司机）
router.post('/:id/rate', authMiddleware(['passenger', 'driver']), rateOrder);

// 获取司机任务列表（司机）
router.get('/driverTasks', authMiddleware(['driver', 'admin']), getDriverTasks);

// 获取乘客当前订单
router.get('/passengerOrder', authMiddleware(['passenger', 'admin']), getPassengerOrder);

// 获取用户订单列表（乘客、司机、管理员）
router.get('/users/:userId', authMiddleware(['passenger', 'driver', 'admin']), getUserOrders);

// 获取订单详情（乘客、司机、管理员）
router.get('/:id', authMiddleware(['passenger', 'driver', 'admin']), getOrderById);

// 获取行程相关订单（司机、管理员）
router.get('/trips/:tripId', authMiddleware(['driver', 'admin']), getTripOrders);

// 司机获取可接单订单列表（司机、管理员）
router.get('/available', authMiddleware(['driver', 'admin']), getAvailableOrders);



// 定期检查订单是否过期，自动处理

export default router
