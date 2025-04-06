import User from '../models/user.model.js'
import Notification from '../models/notification.model.js'
import createLog from '../utils/logger.js' 
import mongoose from 'mongoose';

// 通知列表
export const getNotifications = async (req, res) => {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;
  
      if (!userId) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户未登录',
        });
      }
  
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const skip = (page - 1) * limit;
      const isRead = req.query.isRead ? req.query.isRead === 'true' : undefined; // 可选筛选未读通知
      const type = req.query.type; // 可选筛选通知类型
  
      // 构建查询条件
      const query = { recipientId: new mongoose.Types.ObjectId(userId) };
      if (isRead !== undefined) query.isRead = isRead;
      if (type && ['system', 'order', 'payment', 'review', 'trip'].includes(type)) query.type = type;
  
      // 查询通知总数
      const totalNotifications = await Notification.countDocuments(query);
  
      // 查询通知列表
      const notifications = await Notification.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // 按时间降序
  
      // 格式化返回数据
      const notificationList = notifications.map((notification) => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        orderId: notification.orderId,
        tripId: notification.tripId,
        createdAt: notification.createdAt,
      }));
  
      // 记录日志
      await createLog(userRole, 'get_notifications', true, '查看通知列表成功', userId, req.user.username);
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          notifications: notificationList,
          pagination: {
            total: totalNotifications,
            page,
            limit,
            totalPages: Math.ceil(totalNotifications / limit),
          },
        },
        message: '查看通知列表成功',
      });
    } catch (error) {
      console.error('查看通知列表失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 通知设置
export const updateNotificationSettings = async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
  
      if (!userId) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户未登录',
        });
      }
  
      // 获取请求体中的字段
      const {
        orderNotifications,
        paymentNotifications,
        reviewNotifications,
        systemNotifications,
      } = req.body;
  
      // 构建更新对象
      const updateData = { notificationSettings: {} };
      if (orderNotifications !== undefined) updateData.notificationSettings.orderNotifications = orderNotifications;
      if (paymentNotifications !== undefined) updateData.notificationSettings.paymentNotifications = paymentNotifications;
      if (reviewNotifications !== undefined) updateData.notificationSettings.reviewNotifications = reviewNotifications;
      if (systemNotifications !== undefined) updateData.notificationSettings.systemNotifications = systemNotifications;
  
      // 验证是否有字段更新
      if (Object.keys(updateData.notificationSettings).length === 0) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '请提供至少一个字段进行更新',
        });
      }
  
      // 更新通知设置
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('notificationSettings');
  
      if (!user) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户不存在',
        });
      }
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          notificationSettings: user.notificationSettings,
        },
        message: '更新通知设置成功',
      });
    } catch (error) {
      console.error('更新通知设置失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 标记通知为已读
export const markNotificationAsRead = async (req, res) => {
    try {
      const userId = req.user._id;
      const notificationId = req.params.id;
  
      if (!userId) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户未登录',
        });
      }
  
      // 验证通知ID
      if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无效的通知ID',
        });
      }
  
      // 查询通知
      const notification = await Notification.findOne({
        _id: new mongoose.Types.ObjectId(notificationId),
        recipientId: new mongoose.Types.ObjectId(userId),
      });
  
      if (!notification) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '通知不存在或无权访问',
        });
      }
  
      // 标记为已读
      notification.isRead = true;
      await notification.save();
  
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: notification,
        message: '标记通知为已读成功',
      });
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 删除通知
export const deleteNotification = async (req, res) => {
    try {
      const userId = req.user._id;
      const notificationId = req.params.id;
  
      if (!userId) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户未登录',
        });
      }
  
      // 验证通知ID
      if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无效的通知ID',
        });
      }
  
      // 查询并删除通知
      const notification = await Notification.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(notificationId),
        recipientId: new mongoose.Types.ObjectId(userId),
      });
  
      if (!notification) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '通知不存在或无权删除',
        });
      }
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          notificationId: notification._id,
        },
        message: '删除通知成功',
      });
    } catch (error) {
      console.error('删除通知失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 批量删除通知
export const batchDeleteNotifications = async (req, res) => {
    try {
      const userId = req.user.id;
      const { notificationIds, isRead } = req.body;
  
      if (!userId) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '用户未登录',
        });
      }
  
      // 构建删除条件
      const query = { recipientId: new mongoose.Types.ObjectId(userId) };
  
      let deletedCount = 0;
  
      if (notificationIds) {
        // 按通知 ID 列表删除
        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
          return res.status(203).json({
            code: 203,
            data: { success: false },
            message: '请提供有效的通知ID列表',
          });
        }
  
        // 验证通知ID格式
        const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length !== notificationIds.length) {
          return res.status(203).json({
            code: 203,
            data: { success: false },
            message: '包含无效的通知ID',
          });
        }
  
        query._id = { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) };
        const result = await Notification.deleteMany(query);
        deletedCount = result.deletedCount;
      } else if (isRead !== undefined) {
        // 按已读状态删除
        query.isRead = isRead;
        const result = await Notification.deleteMany(query);
        deletedCount = result.deletedCount;
      } else {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '请提供通知ID列表或已读状态条件',
        });
      }
  
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          deletedCount,
        },
        message: `成功删除 ${deletedCount} 条通知`,
      });
    } catch (error) {
      console.error('批量删除通知失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};


