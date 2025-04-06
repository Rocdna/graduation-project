import mongoose from "mongoose";

/**
 * 行程模型 - Trip Model
 * 
 * 该模型用于存储司机发布的拼车行程信息，主要包含以下信息：
 * 1. 行程编号：tripId（TRIP-YYYYMMDD-0001格式）
 * 2. 司机信息：driverId 关联用户模型
 * 3. 行程路线：startLocation（起点）和 endLocation（终点）
 * 4. 时间信息：departureTime（出发时间）
 * 5. 座位信息：availableSeats（可用座位数）和 pricePerSeat（座位价格）
 * 6. 行程状态：status（当前行程状态）
 * 7. 途经点：waypoints（可选，包含位置和预计到达时间）
 * 
 * 状态说明：
 * - created: 行程创建（默认状态）
 * - ongoing: 行程开始
 * - completed: 已完成（行程结束）
 * - cancelled: 已取消（行程被取消）
 */

// 定义行程模型结构
const tripSchema = new mongoose.Schema(
  {
    // 行程编号
    tripNumber: {
      type: String,
      unique: true,
      index: true
    },

    // 订单ID, 关联订单模型
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    }, 

    // 司机ID，关联用户模型
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 乘客ID，关联用户模型
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 行程起点位置
    startAddress: {
      type: String,
      required: true,
    },

    // 行程终点位置
    endAddress: {
      type: String,
      required: true,
    },
    // 起点坐标
    startLocation: {
      type: [Number], // 起始地坐标 [lng, lat] 
      required: true
    },
    // 终点坐标
    endLocation: {
      type: [Number], // 终点坐标 [lng, lat] 
      required: true
    },
    // 预计时间，单位为分钟
    estimatedTime: {
      type: Number, // 预计所需时间（分钟）
      required: true
    },

    // 行程距离，公里为单位
    distance: {
      type: Number,
      required: true,
    },

    // 行程开始时间
    startTime: {
      type: Date, 
      default: null // 默认空，等待司机确认开始 
    },

    // 行程结束时间
    endTime: {
      type: Date, 
      default: null // 默认空，等待行程完成 
    },

    // 所用座位数，最小值为1
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },

    // 总价格，单位为元
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // 行程当前状态
    status: {
      type: String,
      enum: ["created", "ongoing", "completed", "cancelled"],
      default: "created",
    },

    // 行程取消时间
    canceledTime: {
      type: Date, 
      default: null // 默认空，等待取消操作 
    },
  },
  // 自动添加 createdAt 和 updatedAt 时间戳
  { timestamps: true }
);

// 行程编号生成逻辑
tripSchema.pre('save', async function(next) {
  if (!this.tripNumber) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const lastTrip = await this.constructor.findOne(
      { tripNumber: new RegExp(`^TRIP-${today}`) },
      { tripNumber: 1 },
      { sort: { tripNumber: -1 } }
    );
    const lastNumber = lastTrip ? parseInt(lastTrip.tripNumber.slice(-4)) : 0;
    this.tripNumber = `TRIP-${today}-${String(lastNumber + 1).padStart(4, '0')}`;
  }
  next();
});

// 导出行程模型
export default mongoose.model("Trip", tripSchema);
