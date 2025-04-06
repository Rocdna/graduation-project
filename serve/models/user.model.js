import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // 用户名
    username: {
      type: String,
      required: true,
      unique: false,
    },

    // 密码
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // 手机号
    phone: {
      type: String,
      required: true,
      minlength: 11,
      maxlength: 11,
      unique: true,
      index: true
    },

    // 用户角色
    role: {
      type: String,
      enum: ["passenger", "driver", "admin"],
      default: "passenger",
    },

    // 最后登录时间
    lastLogin: Date,

    // 个人资料
    profile: {
      // 姓名
      name: String,

      // 身份证号
      idNumber: String,

      // 头像URL
      avatar: String,

      // 出生日期
      birthDate: String,

      // 性别
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other",
      },

      // 平均评分（1-5）
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
      },

      // 司机特有字段
      licensePlate: String,    // 车牌号
      vehicleModel: String,    // 车型
      availableSeats: {        // 可用座位数，可选，默认为4
        type: Number,
        min: 0,
        max: 4,
        default: 4
      },
      totalSeats: { 
        type: Number, 
        min: 1, 
        default: 4
      }, // 车辆总座位数

      
      

      // 乘客特有字段
      defaultPaymentMethod: String,

      // 用户状态
      //- 0: 离线
      //- 1: 在线
      //- 2: 冻结
      status: {
        type: String,
        enum: ["offline", "online", "locked"],
        default: "online"
      },
    },

    // 用户的位置
    location: {
      address: {
        type: String,
      },
      coordinates: {
        type: [Number],
      },
    },

    // 行程历史
    tripHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    }],

    // 订单历史
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    }],

    // 评价历史
    reviewHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    }],

    // 通知设置
    notificationSettings: {
      // 订单通知
      orderNotifications: {
        type: Boolean,
        default: true,
      },

      // 支付通知
      paymentNotifications: {
        type: Boolean,
        default: false,
      },

      // 评价通知
      reviewNotifications: {
        type: Boolean,
        default: true,
      },

      // 系统通知
      systemNotifications: {
        type: Boolean,
        default: true,
      },
    },
  }, {  timestamps: true }
);


// 在更新操作时更新 updatedAt
// userSchema.pre('update', function (next) {
//   this.set({ updatedAt: new Date() });
//   next();
// });

// 密码加密
// userSchema.pre("save", async function (next) {
//   try {
//     if (!this.isModified("password")) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// 密码验证
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     throw new Error('密码验证失败');
//   }
// };


// 统计今日用户相关数据
userSchema.statics.getTodayStats = async function () {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // 今日0点
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // 今日23:59:59

  // 今日新增用户数
  const newUsers = await this.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  // 今日活跃司机数
  const activeDrivers = await this.countDocuments({
    role: 'driver',
    'profile.status': 'online'
  });

  // 今日活跃乘客数
  const activePassengers = await this.countDocuments({
    role: 'passenger',
    'profile.status': 'online'
  });

  return {
    newUsers,
    activeDrivers,
    activePassengers
  };
};



export default mongoose.model("User", userSchema);
