import express from "express";
import { 
    createTrip,
    getTripDetails,
    updateTrip,
    cancelTrip,
    startTrip,
    completeTrip,
    getDriverTrips,
    getTripOrders,
    getAvailableSeats

} from "../controllers/trip.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


// 创建行程（司机或管理员）
router.post('/', authMiddleware(['driver', 'admin']), createTrip);

// 查看行程详情（司机或管理员）
router.get('/:tripId', authMiddleware(['driver', 'admin']), getTripDetails);

// 更新行程信息（司机或管理员）
router.patch('/:tripId', authMiddleware(['driver', 'admin']), updateTrip);

// 取消行程（司机或管理员）
router.patch('/:tripId/cancel', authMiddleware(['driver', 'admin']), cancelTrip);

// 开始行程（仅司机）
router.patch('/:tripId/start', authMiddleware(['driver']), startTrip);

// 完成行程（仅司机）
router.patch('/:tripId/complete', authMiddleware(['driver']), completeTrip);

// 查看司机行程列表（司机或管理员）
router.get('/driver/:driverId', authMiddleware(['driver', 'admin']), getDriverTrips);

// 查看行程关联订单（司机或管理员）
router.get('/:tripId/orders', authMiddleware(['driver', 'admin']), getTripOrders);

// 查看可用座位（司机、管理员或乘客）
router.get('/:tripId/seats', authMiddleware(['driver', 'admin', 'passenger']), getAvailableSeats);


export default router