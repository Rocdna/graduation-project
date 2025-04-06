import mongoose from "mongoose";

/**
 * 评价模型 - Review Model
 * 
 * 该模型用于存储拼车订单的评价信息，支持双向评价：
 * 1. 乘客对司机的评价
 * 2. 司机对乘客的评价
 * 
 * 主要包含以下信息：
 * 1. 订单信息：orderId 关联订单模型
 * 2. 评价者：reviewerId 关联用户模型
 * 3. 被评价者：revieweeId 关联用户模型
 * 4. 评价类型：reviewType（passenger_to_driver 或 driver_to_passenger）
 * 5. 评分：rating（1-5星）
 * 6. 评价内容：content
 * 7. 评价状态：status（pending 或 completed）
 * 8. 评价时间：createdAt（自动生成）
 * 
 * 评分说明：
 * - 1星：非常不满意
 * - 2星：不满意
 * - 3星：一般
 * - 4星：满意
 * - 5星：非常满意
 * 
 * 评价流程：
 * 1. 订单完成后，系统创建pending状态的评价记录
 * 2. 用户提交评价后，状态变为completed
 * 3. 被评价方可选择是否回复评价
 */

// 定义评价模型结构
const reviewSchema = new mongoose.Schema(
  {
    // 关联的订单ID
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // 评价者ID
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 被评价者ID
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 评价类型：passenger_to_driver（乘客对司机）或 driver_to_passenger（司机对乘客）
    reviewType: {
      type: String,
      enum: ["passenger_to_driver", "driver_to_passenger"],
      required: true,
    },

    // 评分（1-5星）
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // 评价内容
    content: {
      type: String,
      maxlength: 500,
    },

    // 是否匿名
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // 评价状态
    status: {
      type: String,
      enum: ["pending", "under_review", "completed", "rejected"],
      default: "pending",
    },
    
    auditReason: { type: String },  // 审核或删除理由
    deletedAt: { type: Date },      // 删除时间
    statusHistory: [                // 可选，记录状态变更历史
      {
        status: { type: String, enum: ['pending', 'under_review', 'completed', 'rejected'] },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: () => new Date() },
        reason: { type: String }
      }
    ]
  },
  // 自动添加 createdAt 和 updatedAt 时间戳
  { timestamps: true }
);

// 添加索引
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ revieweeId: 1 });
reviewSchema.index({ reviewType: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ isAnonymous: 1 });
reviewSchema.index({ createdAt: 1 });


// 导出评价模型
export default mongoose.model("Review", reviewSchema);
