import mongoose from "mongoose";

/**
 * 订单模型 - Order Model
 * 
 * 该模型用于存储乘客创建的拼车订单信息，主要包含以下信息：
 * 1. 订单编号：orderNumber（YYYYMMDD-0001格式）
 * 2. 乘客信息：passengerId 关联用户模型
 * 3. 行程信息：tripId 关联行程模型
 * 4. 订单状态：status（当前订单状态）
 * 5. 座位数量：seatCount（预订的座位数）
 * 6. 总价：totalPrice（订单总金额）
 * 7. 支付信息：paymentStatus（支付状态）
 * 
 * 状态说明：
 * - pending: 待确认（默认状态）
 * - matched: 匹配
 * - confirmed: 已确认
 * - cancelled: 已取消
 * - completed: 已完成
 * 
 * 支付状态说明：
 * - unpaid: 未支付
 * - paid: 已支付
 * - refunded: 已退款
 */

// 定义订单模型结构
const orderSchema = new mongoose.Schema(
  {
    // 订单编号
    orderNumber: {
      type: String,
      unique: true,
      index: true
    },
    // 乘客ID，关联用户模型
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 司机ID，关联用户模型，订单创建时为空，接单后填充
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // 行程ID，关联行程模型，接单后由系统或司机生成
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      index: true
    },

    // 订单状态
    status: {
      type: String,
      enum: ["pending", "matched", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // 临时行程详情，用于临时存储未确认订单的详细信息
    // 起点，终点，时间，距离
    startAddress: { type: String },     // 临时起点
    endAddress: { type: String },       // 临时终点
    startLocation: { type: [Number] },  // 起点坐标
    endLocation: { type: [Number] },    // 终点坐标
    startTime: { type: Date },          // 计划开始时间
    distance: { type: Number },         // 临时距离
    estimatedTime: {  type: Number },  // 预计所需时间（分钟）

    // 预订的座位数
    seatCount: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },

    // 订单总金额
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    // 支付状态
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
    },

    // 支付时间
    paymentTime: {
      type: Date,
    },

    //支付方式
    paymentMethod: {
      type: String,
      enum: ["alipay", "wechat", "card"],
    },

    // 订单取消原因
    canceledReason: {
      type: String,
    },

    // 评价字段（可选）
    rating: {
      type: Number,
      min: 1,
      max: 5, // 评分范围 1-5
    },

    // 评价内容
    comment: {
      type: String,
      trim: true, // 去除首尾空格
      maxlength: 200, // 限制评论长度
    }
  },
  // 自动添加 createdAt 和 updatedAt 时间戳
  { timestamps: true }
);


// 订单号生成逻辑，用户发起订单后即生成
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const lastOrder = await this.constructor.findOne(
      { orderNumber: new RegExp(`^${today}`) },
      { orderNumber: 1 },
      { sort: { orderNumber: -1 } }
    );
    const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.slice(-4)) : 0;
    this.orderNumber = `${today}-${String(lastNumber + 1).padStart(4, '0')}`;
  }
  next();
});


// 统计今日订单相关数据
orderSchema.statics.getTodayStats = async function () {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // 今日0点
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // 今日23:59:59

  // 今日订单量
  const totalOrders = await this.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  // 今日成功匹配的订单数
  const matchedOrders = await this.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd },
    status: 'matched'
  });

  // 今日收入（已支付订单的总金额）
  const revenueResult = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  // 计算匹配率
  const matchRate = totalOrders > 0 ? (matchedOrders / totalOrders) * 100 : 0;

  return {
    totalOrders,
    matchedOrders,
    matchRate: parseFloat(matchRate.toFixed(2)),
    totalRevenue
  };
};

// 统计过去7天的订单相关数据
orderSchema.statics.getLast7DaysStats = async function () {
  // 计算时间范围：过去7天（不包括今天）
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 今天0点
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1); // 昨天
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7); // 7天前

  // 按日期分组统计订单数据
  const stats = await this.aggregate([
    // 筛选过去7天的订单
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    // 按日期分组
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalOrders: { $sum: 1 }, // 总订单数
        matchedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'matched'] }, 1, 0] } // 匹配订单数
        },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0] // 已支付订单的收入
          }
        }
      }
    },
    // 按日期排序
    {
      $sort: { _id: 1 }
    }
  ]);

  // 格式化结果并计算匹配率
  const result = stats.map(day => ({
    date: day._id,
    totalOrders: day.totalOrders,
    matchRate: day.totalOrders > 0 ? parseFloat(((day.matchedOrders / day.totalOrders) * 100).toFixed(2)) : 0,
    totalRevenue: day.totalRevenue
  }));

  // 补全缺失的日期（如果某天没有订单，填充0）
  const fullResult = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
    const dayData = result.find(d => d.date === dateStr) || {
      date: dateStr,
      totalOrders: 0,
      matchRate: 0,
      totalRevenue: 0
    };
    fullResult.push(dayData);
  }
  return fullResult;
};

// 统计过去任意天的订单数据
orderSchema.statics.getLastNStats = async function (start, end) {
  try {
    // 按日期分组统计订单数据
    const stats = await this.aggregate([
      // 筛选时间范围
      {
        $match: {
          createdAt: { $gte: new Date(start), $lte: new Date(end) }
        }
      },
      // 按日期分组
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          matchedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      // 计算匹配率
      {
        $project: {
          date: '$_id',
          totalOrders: 1,
          totalRevenue: 1,
          matchRate: {
            $multiply: [
              { $divide: ['$matchedOrders', '$totalOrders'] },
              100
            ]
          },
          _id: 0
        }
      },
      // 按日期排序
      { $sort: { date: 1 } }
    ]);

    // 计算总计数据
    const totalOrders = stats.reduce((sum, item) => sum + item.totalOrders, 0);
    const totalRevenue = stats.reduce((sum, item) => sum + item.totalRevenue, 0);
    const avgMatchRate = stats.length
      ? (stats.reduce((sum, item) => sum + item.matchRate, 0) / stats.length).toFixed(2)
      : 0;

    return {
      totalOrders,
      totalRevenue,
      avgMatchRate: parseFloat(avgMatchRate),
      dailyStats: stats
    };
  } catch (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }
};



// 导出订单模型
export default mongoose.model("Order", orderSchema);
