import express from "express";
import { 
    uploadAvatar,
    updateProfile,
    updateDriverStatus,
    updateUserStatus,
} from "../controllers/user.controller.js";
import { upload } from '../utils/uploadAvatar.js'
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


// 上传头像
router.post('/avatar', authMiddleware(["passenger", "driver"]), upload.single('avatar'), uploadAvatar);

// 更新个人信息（乘客、司机、管理员）
router.patch('/profile', authMiddleware(['driver', 'passenger', 'admin']), updateProfile );

// 更新用户状态（司机）
router.patch('/status', authMiddleware(['driver']), updateDriverStatus);

// 更新用户状态（管理员）
router.patch('/:userId/status', authMiddleware(['admin']), updateUserStatus);


export default router