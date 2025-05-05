import express from 'express'
import authMiddleware from "../middleware/auth.middleware.js";
import { 
    getDashboardStats, 
    getLast7DaysStats, 
    getLastNDaysStats, 
    getAllOrders, 
    updateOrderStatus,
    getAllPassengers,
    getDriverList,
    updatePassengerInfo,
    getPassengerDetails,
    updateDriverInfo,
    getDriverDetails,
    deletePassenger,
    deleteDriver,
    addPassenger,
    addDriver,
    batchDeletePassengers,
    batchDeleteDriver,
    auditReview,
    deleteReview,
    getReviewsList,
    getLogsList,
    getNotificationsList,
    deleteNotification
} from "../controllers/admin.controller.js";
import { getOrderById } from '../controllers/order.controller.js'


const router = express.Router();

// 今天数据统计
router.get('/dashboardStats', authMiddleware(["admin"]), getDashboardStats);

// 过去7天数据统计
router.get('/dashboardStats/last7Days', authMiddleware(["admin"]), getLast7DaysStats);

// 选择过去任意天的数据
router.get('/dashboardStats/:startDate/:endDate', authMiddleware(["admin"]), getLastNDaysStats);

// 获取全部订单
router.get('/orders', authMiddleware(["admin"]), getAllOrders);

// 获取订单详情
router.get('/orders/:id', authMiddleware(["admin"]), getOrderById);

// 调整订单运行状态
router.patch('/orders/:id/status', authMiddleware(["admin"]), updateOrderStatus);

// 调整订单支付状态

//--------------------------------------------------------------------------------

// 获取乘客列表
router.get('/passengers', authMiddleware(["admin"]), getAllPassengers);

// 修改乘客信息
router.patch('/passengers/:id', authMiddleware(["admin"]), updatePassengerInfo);

// 查看乘客所有订单和评价信息
router.get('/passengers/:id/details', authMiddleware(["admin"]), getPassengerDetails);

// 删除乘客
router.delete('/passengers/:id', authMiddleware(["admin"]), deletePassenger);

// 添加乘客
router.post('/passenger', authMiddleware(["admin"]), addPassenger);

// 批量删除乘客
router.delete('/passengers', authMiddleware(["admin"]), batchDeletePassengers);


// ----------------------------------------------------------------------


// 获取司机列表
router.get('/drivers', authMiddleware(["admin"]), getDriverList);

// 修改司机信息
router.patch('/drivers/:id', authMiddleware(["admin"]), updateDriverInfo);

// 查看司机所有订单和评价信息
router.get('/drivers/:id/details', authMiddleware(["admin"]), getDriverDetails);

// 删除司机
router.delete('/driver/:id', authMiddleware(["admin"]), deleteDriver);

// 添加司机
router.post('/driver', authMiddleware(["admin"]), addDriver);

// 批量删除司机
router.delete('/drivers', authMiddleware(["admin"]), batchDeleteDriver);


//------------------------------------------------------------------------


// 获取所有评价列表
router.get('/reviews', authMiddleware(["admin"]), getReviewsList);

// 审核评价
router.post('/reviews/audit', authMiddleware(["admin"]), auditReview)

// 删除评价
router.delete('/reviews/:id', authMiddleware(["admin"]), deleteReview)


//------

// 获取所有操作日志
router.get('/logs', authMiddleware(["admin"]), getLogsList)


// 获取通知消息列表
router.get('/notifications', authMiddleware(["admin"]), getNotificationsList)

// 删除通知消息
router.delete('/notifications/:id', authMiddleware(["admin"]), deleteNotification)

export default router