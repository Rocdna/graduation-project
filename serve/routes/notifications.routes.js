import express from "express";
import {
    getNotifications,
    updateNotificationSettings,
    markNotificationAsRead,
    deleteNotification,
    batchDeleteNotifications
} from '../controllers/notification.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


// 通知列表
router.get('/', authMiddleware(['passenger', 'driver', 'admin']), getNotifications);

// 更新通知设置（乘客或司机）【O】
router.patch('/settings', authMiddleware(['passenger', 'driver']), updateNotificationSettings);

// 标记通知为已读（乘客或司机）
router.patch('/:id/read', authMiddleware(['passenger', 'driver']), markNotificationAsRead);

// 删除单个通知（乘客或司机）
router.delete('/:id', authMiddleware(['passenger', 'driver']), deleteNotification);

// 批量删除通知（乘客或司机）
router.delete('/', authMiddleware(['passenger', 'driver']), batchDeleteNotifications);



export default router

