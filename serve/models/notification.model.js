import mongoose from "mongoose";

/**
 * 通知模型 - Notification Model
 * 
 * 该模型用于存储系统通知信息，主要包含以下信息：
 * 1. 接收者：userId 关联用户模型
 * 2. 通知类型：type（系统通知、订单通知等）
 * 3. 通知内容：content
 * 4. 是否已读：isRead
 * 5. 相关数据：data（可选，存储通知相关的额外数据）
 * 
 * 通知类型说明：
 * - system: 系统通知
 * - order: 订单相关通知
 * - payment: 支付相关通知
 * - review: 评价相关通知
 * - trip: 行程相关通知
 */

// 定义通知模型结构
const notificationSchema = new mongoose.Schema(
  {
    // 接收者ID
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 通知类型
    type: {
      type: String,
      enum: ["system", "order", "payment", "review", "trip", "order_matched", "order_confirmed", "order_cancelled", "order_completed", "order_cancelled"],
      required: true,
      default: "system",
    },

    // 通知标题
    title: {
      type: String,
      max: 100
    },

    // 通知内容
    message: {
      type: String,
      max: 500,
      required: true,
    },

    // 是否已读
    isRead: {
      type: Boolean,
      default: false,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true, // 添加索引优化查询
    },

    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      index: true, // 添加索引优化查询
    },
  },
  { timestamps: true }
);

// 导出通知模型
export default mongoose.model("Notification", notificationSchema);
