import express from "express";
import { 
    getReview,
    getReviews,
    getAdminOverview,
    getDriverStats,
    getPassengerStats,
    getOrderStats
} from "../controllers/review.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/** 用户 */

// 查看订单的评价（乘客、司机、管理员）
router.get('/orders/:orderId', authMiddleware(['passenger', 'driver', 'admin']), getReview);

// 查看用户评价列表（乘客、司机、管理员）
router.get('/users/:userId', authMiddleware(['passenger', 'driver', 'admin']), getReviews);


/** 管理员 */

// 查看所有评价概览（仅管理员）
router.get('/admin/overview', authMiddleware(['admin']), getAdminOverview);

// 查看司机评价统计（仅管理员）
router.get('/admin/drivers/:driverId/stats', authMiddleware(['admin']), getDriverStats);

// 查看乘客评价统计（仅管理员）
router.get('/admin/passengers/:passengerId/stats', authMiddleware(['admin']), getPassengerStats);

// 查看订单相关评价统计（仅管理员）
// router.get('/admin/orders/:orderId/stats', authMiddleware(['admin']), getOrderStats);


export default router;
