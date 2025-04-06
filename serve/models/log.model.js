import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usename: { type: String },
  role: { type: String, enum: ['passenger', 'driver', 'admin', 'system'] },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  action: { type: String, required: true }, // 例如 view_order
  success: { type: Boolean, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// 导出订单模型
export default mongoose.model("Log", logSchema);