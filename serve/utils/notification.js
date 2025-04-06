// 创建通知的通用函数
import Notification from '../models/notification.model.js'
import { notifyUser } from '../server.js';

export const createNotification = async (recipientId, type, title, message, orderId = null, tripId = null) => {
    try {   
        const notification = new Notification({
            recipientId,
            type,
            title: title || '系统通知', // 默认标题
            message,
            orderId,
            tripId,
        });
        await notification.save();
        try {
            notifyUser(recipientId, notification.type, notification);
        } catch (pushError) {
            console.error('推送通知失败:', pushError);
        }
        return notification;
    } catch (error) {
        console.error('创建通知失败:', error);
        throw error;
    }
};