import Order from '../models/order.model.js'
import User from '../models/user.model.js'
import Review from '../models/review.model.js'
import Trip from '../models/trip.model.js'
import createLog from '../utils/logger.js';
import { createNotification } from '../utils/notification.js';

import mongoose from 'mongoose';

// 获取今天的数据统计
export const getDashboardStats = async (req, res) => {
    try {
      // 获取订单相关统计
      const orderStats = await Order.getTodayStats();
      // 获取用户相关统计
      const userStats = await User.getTodayStats();
    
      res.status(200).json({
        code: 200,
        data: {
          totalOrders: orderStats.totalOrders,
          matchRate: orderStats.matchRate,
          totalRevenue: orderStats.totalRevenue,
          newUsers: userStats.newUsers,
          activeDrivers: userStats.activeDrivers,
          activePassengers: userStats.activePassengers
        },
        message: '获取统计数据成功',
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: { success: false },
        message: '无法获取统计数据',
      });
    }
};

// 获取过去7天的统计数据
export const getLast7DaysStats = async (req, res) => {
  try {
    const stats = await Order.getLast7DaysStats();
    res.status(200).json({
      code: 200,
      data: {
        success: true,
        stats
      },
      message: '获取过去7天的统计数据成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      data: { success: false },
      message: '无法获取过去7天的统计数据',
    });
  }
};

// 获取过去任意天的统计数据
export const getLastNDaysStats = async (req, res) => {
  try {
    // 从路径参数中获取 startDate 和 endDate
    const { startDate, endDate } = req.params;

    // 参数校验
    if (!startDate || !endDate) {
      return res.status(203).json({ code: 203, data: { success: false }, message: '开始时间和结束时间是必须的' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(203).json({ code: 203, data: { success: false }, message: '无效日期格式' });
    }

    if (start > end) {
      return res.status(203).json({ code: 203, data: { success: false }, message: '开始时间必须小于结束时间' });
    }

    // 调用模型方法获取统计数据
    const stats = await Order.getLastNStats(start, end);

    res.status(200).json({
      code: 200,
      data: stats,
      message: '获取过去任意天的统计数据成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, dasta: { success: false } , message: 'Failed to get stats', error: error.message });
  }
};

// 获取全部订单列表
export const getAllOrders = async (req, res) => {
  try {
    // 解析查询参数
    const { page = 1, pageSize = 10, status, startDate, endDate } = req.query;
    // 构建查询条件
    const query = {};
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 计算分页参数
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);
    const skip = (pageNum - 1) * pageSizeNum;

    // 查询订单数据
    const orders = await Order.find(query)
      .skip(skip)
      .limit(pageSizeNum)
      .populate('passengerId', 'username') // 填充乘客信息
      .populate('driverId', 'username') // 填充司机信息
      .sort({ createdAt: -1 }); // 按创建时间降序排序

    // 查询总条数
    const total = await Order.countDocuments(query);

    // 返回响应
    res.status(200).json({
      code: 200,
      data: {
        orders,
        total,
        totalPages: Math.ceil(total / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum
      },
      message: "订单列表获取成功"
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      data: { success: false },
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// 更新订单运行状态
export const updateOrderStatus = async (req, res) => {
  try {
    // 输入验证
    const { id } = req.params;
    const { status, cancelReason } = req.query;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的订单ID",
      });
    }

    // 验证订单状态
    const validStatuses = ['pending', 'matched', 'confirmed', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的状态值",
      });
    }

    // 如果状态为 cancelled，必须提供 cancelReason
    if (status === 'cancelled' && !cancelReason) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "取消订单时必须提供取消原因",
      });
    }

    // 查询订单
    const order = await Order.findById(id)
      .populate("passengerId", "username")
      .populate("driverId", "username")
      .populate("tripId", "startLocation endLocation startTime");
    if (!order) {
      return res.status(200).json({
        code: 404,
        data: { success: false },
        message: "订单不存在",
      });
    }

    // 权限验证
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(200).json({
        code: 403,
        data: { success: false },
        message: "无权访问",
      });
    }

    // 状态转换验证
    const statusOrder = ['pending', 'matched', 'confirmed', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);

    // 规则 1：不能逆向修改状态（例如从 confirmed 改回 matched）
    if (newIndex !== -1 && currentIndex !== -1 && newIndex < currentIndex) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: `状态不可从 ${order.status} 逆向修改为 ${status}`,
      });
    }
    // 规则 2：可以从 pending、matched、confirmed 改为 cancelled，但不能从 completed 改为 cancelled
    if (status === 'cancelled') {
      if (order.status === 'completed') {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: "已完成订单不可取消",
        });
      }
    }
    // 规则 3：不能从 cancelled 改为其他状态
    if (order.status === 'cancelled') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "已取消订单不可修改状态",
      });
    }

    // 更新状态
    const oldStatus = order.status;
    order.status = status;
    if (status === 'cancelled') {
      order.canceledReason = cancelReason;
    }
    await order.save();

    // 触发通知
    const passengerId = order.passengerId._id;
    const driverId = order.driverId ? order.driverId._id : null;
    if (status === "confirmed") {
      await createNotification(
        passengerId,
        "system",
        "订单确认通知",
        `您的订单 (${order.orderNumber}) 已确认`,
        order
      );
      if (driverId) {
        await createNotification(
          driverId,
          "system",
          "订单确认通知",
          `订单 (${order.orderNumber}) 已确认`,
          order._id
        );
      }
    } else if (status === "completed") {
      await createNotification(
        passengerId,
        "system",
        "订单完成通知",
        `您的订单 (${order.orderNumber}) 已完成，请评价`,
        order
      );
      if (driverId) {
        await createNotification(
          driverId,
          "system",
          "订单完成通知",
          `订单 (${order.orderNumber}) 已完成，请评价`,
          order
        );
      }
    } else if (status === "cancelled") {
      await createNotification(
        passengerId,
        "system",
        "订单取消通知",
        `您的订单 (${order.orderNumber}) 已取消，原因：${cancelReason}`,
        order
      );
      if (driverId) {
        await createNotification(
          driverId,
          "system",
          "订单取消通知",
          `订单 (${order.orderNumber}) 已取消，原因：${cancelReason}`,
          order
        );
      }
    }

    // 记录成功日志
    await createLog(
      req.user.role,
      "update_order_status",
      true,
      `状态从 ${oldStatus} 更新为 ${status}`,
      req.user.id,
      req.user.username,
      id
    );

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: order,
      message: "订单状态更新成功",
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "update_order_status",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
      req.params.id || "未知",
    );
    console.error("更新订单状态失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误",
    });
  }
};

// 更新订单支付状态
export const updateOrderPaymentStatus = async (req, res) => {
};

// 获取乘客列表
/*
  前端参数：
  current（可选，默认为 1）：当前页码。
  size（可选，默认为 10）：每页条数。
  username（可选）：按用户名筛选（模糊匹配）。
  phone（可选）：按手机号筛选（精确匹配）。
  status（可选）：按用户状态筛选（offline、online、locked）。
  gender（可选）：按性别筛选（male、female、other）。
  ratingMin（可选）：按最低评分筛选。
  ratingMax（可选）：按最高评分筛选。
*/
export const getAllPassengers = async (req, res) => {
  try {
    const {
      current = 1,
      size = 10,
      username,
      name,
      phone,
      status,
      gender,
      ratingMin,
      ratingMax
    } = req.query;


    // 构建查询条件
    const query = { role: 'passenger' };
    if (username) query.username = { $regex: username, $options: 'i' }; // 模糊匹配
    if (phone) query.phone = phone; // 精确匹配
    if (status) query['profile.status'] = status;
    if (gender) query['profile.gender'] = gender;
    if (name) query['profile.name'] = name;
    if (ratingMin || ratingMax) {
      query['profile.rating'] = {};
      if (ratingMin) query['profile.rating'].$gte = Number(ratingMin);
      if (ratingMax) query['profile.rating'].$lte = Number(ratingMax);
    }

    // 分页查询
    const total = await User.countDocuments(query);
    const records = await User.find(query)
      .skip((current - 1) * size)
      .limit(Number(size))
      .select('-tripHistory -orderHistory -reviewHistory -notificationSettings') // 排除敏感字段
      .lean();

    return res.status(200).json({
      code: 200,
      data: { total, records, current, size },
      message: "获取乘客列表成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "get_passenger_list",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
    );
    console.error("获取乘客列表失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 删除乘客
export const deletePassenger = async (req, res) => {
  try {
    const { id } = req.params;

    // 输入验证
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的用户ID"
      });
    }

    // 确保用户是乘客
    const passenger = await User.findById(id);
    if (!passenger) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "用户不存在"
      });
    }
    if (passenger.role !== 'passenger') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "该用户不是乘客"
      });
    }

    // 删除用户
    await User.findByIdAndDelete(id);

    // 记录日志
    await createLog(
      req.user.role,
      "delete_passenger",
      true,
      "用户删除成功",
      req.user.id,
      req.user.username,
      id
    );

    return res.status(200).json({
      code: 200,
      data: { success: true },
      message: "用户删除成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "delete_passenger",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
      req.params.id || "未知"
    );
    console.error("删除乘客失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 修改乘客信息
export const updatePassengerInfo = async (req, res) => { 
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 输入验证
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的乘客ID"
      });
    }

    // 确保用户是乘客
    const passenger = await User.findById(id);
    if (!passenger) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "乘客不存在"
      });
    }

    if (passenger.role !== 'passenger') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "该用户不是乘客"
      });
    }

    // 禁止修改某些字段
    delete updateData.role; // 禁止修改角色
    // delete updateData.password; // 禁止直接修改密码
    delete updateData.tripHistory; // 禁止修改行程历史
    delete updateData.orderHistory; // 禁止修改订单历史
    delete updateData.reviewHistory; // 禁止修改评价历史

    // 更新乘客信息
    const updatedPassenger = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).select('-tripHistory -orderHistory -reviewHistory');

    // 发送通知给乘客
    await createNotification(
      updatedPassenger._id, // 接收者ID（乘客ID）
      'system', // 通知类型
      '用户信息更新通知', // 通知标题
      '您的信息已被管理员更新', // 通知内容
      null, // orderId
      null // tripId
    );

    return res.status(200).json({
      code: 200,
      data: updatedPassenger,
      message: "乘客信息更新成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "update_passenger",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
    );
    console.error("更新乘客信息失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 添加乘客
export const addPassenger = async (req, res) => {
  try {
    const {
      username,
      phone,
      password,
      profile: { name, gender, status, idNumber, rating, defaultPaymentMethod } = {},
    } = req.body;

    // 必填字段校验
    if (!phone || !password || !username || !status) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "手机号、密码、昵称和状态为必填字段"
      });
    }

    // 校验手机号是否已存在
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "手机号已存在"
      });
    }

    // 加密密码
    // const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新乘客
    const newPassenger = new User({
      username: username || `passenger_${Date.now()}`, // 如果未提供用户名，生成默认值
      phone,
      password: password,
      role: 'passenger',
      profile: {
        name,
        gender: gender || 'other', // 默认值
        status,
        idNumber,
        defaultPaymentMethod: defaultPaymentMethod || 'alipay', // 默认值
        rating: rating || 5, // 默认评分
      }
    });

    await newPassenger.save();

    // 发送通知给乘客
    await createNotification(
      newPassenger._id, // 接收者ID（乘客ID）
      'system', // 通知类型
      '欢迎加入平台', // 通知标题
      '您的乘客账户已开通，可以开始拼车啦', // 通知内容
      null, // orderId
      null // tripId
    );

    // 记录日志
    // await createLog(
    //   req.user.role,
    //   "add_passenger",
    //   true,
    //   "添加乘客成功",
    //   req.user.id,
    //   req.user.username,
    //   newPassenger.id
    // );

    return res.status(200).json({
      code: 200,
      data: { success: true, id: newPassenger.id },
      message: "添加乘客成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "add_passenger",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username
    );
    console.error("添加乘客失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 查看乘客订单和评价信息
// orderCurrent（可选，默认为 1）：订单分页的当前页码。
// orderSize（可选，默认为 10）：订单每页条数。
// reviewCurrent（可选，默认为 1）：评价分页的当前页码。
// reviewSize（可选，默认为 10）：评价每页条数。
export const getPassengerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orderCurrent = 1,
      orderSize = 10,
      reviewCurrent = 1,
      reviewSize = 10
    } = req.query;

    // 输入验证
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的乘客ID"
      });
    }

    // 确保用户是乘客
    const passenger = await User.findById(id);
    if (!passenger) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "乘客不存在"
      });
    }
    if (passenger.role !== 'passenger') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "该用户不是乘客"
      });
    }


    // 查询订单
    const orderTotal = await Order.countDocuments({ passengerId: id });
    const orders = await Order.find({ passengerId: id })
      .skip((orderCurrent - 1) * orderSize)
      .limit(Number(orderSize))
      .populate('tripId', 'startLocation endLocation startTime')
      .lean();

    // 查询评价
    const reviewTotal = await Review.countDocuments({ userId: id });
    const reviews = await Review.find({ userId: id })
      .skip((reviewCurrent - 1) * reviewSize)
      .limit(Number(reviewSize))
      .lean();

    return res.status(200).json({
      code: 200,
      data: {
        orders: { total: orderTotal, records: orders },
        reviews: { total: reviewTotal, records: reviews }
      },
      message: "获取乘客详情成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "get_passenger_details",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
    );
    console.error("获取乘客详情失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 批量删除乘客
export const batchDeletePassengers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的ID列表"
      });
    }

    // 查找所有要删除的记录
    const users = await User.find({ _id: { $in: ids }, role: 'passenger' })
    // 记录哪些ID不存在
    const existingIds = users.map(user => user._id.toString());
    const notFoundIds = ids.filter(item => !existingIds.includes(item._id));

    // 如果没有找到任何记录，返回失败
    if (existingIds.length === 0) {
      return res.status(200).json({
        code: 200,
        data: {
          success: false,
          failed: notFoundIds.map(id => ({ id, reason: "记录不存在" }))
        },
        message: "没有找到任何要删除的记录"
      });
    }

    // 删除存在的记录
    await User.deleteMany({ _id: { $in: existingIds }, role: 'passenger' })

    // 记录日志（仅在实际删除时记录）
    await Promise.all(existingIds.map(id =>
      createLog(
        req.user.role,
        "batch_delete_passenger",
        true,
        "批量删除乘客成功",
        req.user.id,
        req.user.username,
        id
      )
    ));

    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        failed: notFoundIds.length > 0 ? notFoundIds.map(id => ({ id, reason: "记录不存在" })) : []
      },
      message: notFoundIds.length > 0 ? "批量删除部分成功" : "批量删除完成"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "batch_delete_passenger",
      false,
      `批量删除失败: ${error.message}`,
      req.user.id,
      req.user.username
    );
    console.error("批量删除失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};



// 获取司机列表
/* 
  current（可选，默认为 1）：当前页码。
  size（可选，默认为 10）：每页条数。
  username（可选）：按用户名筛选（模糊匹配）。
  phone（可选）：按手机号筛选（精确匹配）。
  status（可选）：按用户状态筛选（offline、online、locked）。
  gender（可选）：按性别筛选（male、female、other）。
  ratingMin（可选）：按最低评分筛选。
  ratingMax（可选）：按最高评分筛选。
  licensePlate（可选）：按车牌号筛选（模糊匹配）。
  vehicleModel（可选）：按车型筛选（模糊匹配）。
*/
export const getDriverList = async (req, res) => {
  try {
    const {
      current = 1,
      size = 10,
      username,
      name,
      phone,
      status,
      gender,
      ratingMin,
      ratingMax,
      licensePlate,
      vehicleModel
    } = req.query;

    // 构建查询条件
    const query = { role: 'driver' };
    if (username) query.username = { $regex: username, $options: 'i' }; // 模糊匹配
    if (phone) query.phone = phone; // 精确匹配
    if (status) query['profile.status'] = status;
    if (gender) query['profile.gender'] = gender;
    if (name) query['profile.name'] = name;
    if (ratingMin || ratingMax) {
      query['profile.rating'] = {};
      if (ratingMin) query['profile.rating'].$gte = Number(ratingMin);
      if (ratingMax) query['profile.rating'].$lte = Number(ratingMax);
    }
    if (licensePlate) query['profile.licensePlate'] = { $regex: licensePlate, $options: 'i' };
    if (vehicleModel) query['profile.vehicleModel'] = { $regex: vehicleModel, $options: 'i' };

    // 分页查询
    const total = await User.countDocuments(query);
    const records = await User.find(query)
      .skip((current - 1) * size)
      .limit(Number(size))
      .select('-tripHistory -orderHistory -reviewHistory -notificationSettings') // 排除敏感字段
      .lean();

    /// 记录日志
    // await createLog(
    //   req.user.role, // role
    //   "get_driver_list", // action
    //   true, // success
    //   "获取司机列表成功", // message
    //   req.user.id, // userId
    //   req.user.username // username
    // );

    return res.status(200).json({
      code: 200,
      data: { total, records, current, size },
      message: "获取司机列表成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "get_driver_list",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username
    );
    console.error("获取司机列表失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 删除司机
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // 输入验证
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的用户ID"
      });
    }

    // 确保用户是司机
    const driver = await User.findById(id);
    if (!driver) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "用户不存在"
      });
    }
    if (driver.role !== 'driver') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "该用户不是司机"
      });
    }

    // 删除用户
    await User.findByIdAndDelete(id);

    // 记录日志
    await createLog(
      req.user.role,
      "delete_driver",
      true,
      "用户删除成功",
      req.user.id,
      req.user.username,
      id
    );

    return res.status(200).json({
      code: 200,
      data: { success: true },
      message: "用户删除成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "delete_driver",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
      req.params.id || "未知"
    );
    console.error("删除司机失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 更新司机信息
export const updateDriverInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 输入验证
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的司机ID"
      });
    }

    // 确保用户是司机
    const driver = await User.findById(id);
    if (!driver) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "司机不存在"
      });
    }
    if (driver.role !== 'driver') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "该用户不是司机"
      });
    }

    // 禁止修改某些字段
    delete updateData.role;
    // delete updateData.password;
    delete updateData.tripHistory;
    delete updateData.orderHistory;
    delete updateData.reviewHistory;

    // 更新司机信息
    const updatedDriver = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).select('-password -tripHistory -orderHistory -reviewHistory');

    // 发送通知给司机
    await createNotification(
      updatedDriver._id, // 接收者ID（司机ID）
      'system', // 通知类型
      '用户信息更新通知', // 通知标题
      '您的司机信息已被管理员更新', // 通知内容
      null, // orderId
      null // tripId
    );

    // 记录日志
    // await createLog(
    //   req.user.role,
    //   "update_driver",
    //   true,
    //   "司机信息更新成功",
    //   req.user.id,
    //   req.user.username,
    //   id
    // );

    return res.status(200).json({
      code: 200,
      data: updatedDriver,
      message: "司机信息更新成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "update_driver",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
      req.params.id || "未知"
    );
    console.error("更新司机信息失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 查看某个司机的订单和评价信息
export const getDriverDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orderCurrent = 1,
      orderSize = 10,
      reviewCurrent = 1,
      reviewSize = 10
    } = req.query;

    // 输入验证
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的司机ID"
      });
    }

    // 确保用户是司机
    const driver = await User.findById(id);
    if (!driver) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "司机不存在"
      });
    }
    if (driver.role !== 'driver') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "该用户不是司机"
      });
    }

    // 查询订单
    const orderTotal = await Order.countDocuments({ driverId: id });
    const orders = await Order.find({ driverId: id })
      .skip((orderCurrent - 1) * orderSize)
      .limit(Number(orderSize))
      .populate('tripId', 'startLocation endLocation startTime')
      .populate('passengerId', 'username')
      .lean();

    // 查询评价
    const reviewTotal = await Review.countDocuments({ userId: id });
    const reviews = await Review.find({ userId: id })
      .skip((reviewCurrent - 1) * reviewSize)
      .limit(Number(reviewSize))
      .lean();

    // 记录日志
    // await createLog(
    //   req.user.role,
    //   "get_driver_details",
    //   true,
    //   "获取司机详情成功",
    //   req.user.id,
    //   req.user.username,
    //   id
    // );

    return res.status(200).json({
      code: 200,
      data: {
        orders: { total: orderTotal, records: orders },
        reviews: { total: reviewTotal, records: reviews }
      },
      message: "获取司机详情成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "get_driver_details",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
      req.params.id || "未知"
    );
    console.error("获取司机详情失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 添加司机
export const addDriver = async (req, res) => {
  try {
    const {
      username,
      phone,
      password,
      profile: { name, gender, status, rating, idNumber, licensePlate, vehicleModel } = {},
    } = req.body;

    // 必填字段校验
    if (!phone || !password || !username || !status) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "手机号、密码、昵称和状态为必填字段"
      });
    }

    // 校验手机号是否已存在
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "手机号已存在"
      });
    }

    // 加密密码
    // const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新司机
    const newDriver = new User({
      username: username || `driver_${Date.now()}`, // 如果未提供用户名，生成默认值
      phone,
      password: password,
      role: 'driver',
      profile: {
        name,
        gender: gender || 'other', // 默认值
        status,
        idNumber,
        licensePlate: licensePlate || '', // 司机特有字段
        vehicleModel: vehicleModel || '', // 司机特有字段
        rating: rating || 5 // 默认评分
      }
    });

    await newDriver.save();

    // 发送通知给司机
    await createNotification(
      newDriver._id, // 接收者ID（司机ID）
      'user', // 通知类型
      '欢迎加入平台', // 通知标题
      '您的司机账户已创建，请完善驾驶证和车辆信息', // 通知内容
      null, // orderId
      null // tripId
    );

    // 记录日志
    // await createLog(
    //   req.user.role,
    //   "add_driver",
    //   true,
    //   "添加司机成功",
    //   req.user.id,
    //   req.user.username,
    //   newDriver.id
    // );

    return res.status(200).json({
      code: 200,
      data: { success: true, id: newDriver.id },
      message: "添加司机成功"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "add_driver",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username
    );
    console.error("添加司机失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};

// 批量删除司机
export const batchDeleteDriver = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的ID列表"
      });
    }
    // 查找所有要删除的记录
    const users = await User.find({ _id: { $in: ids }, role: 'driver' });

    // 记录哪些ID不存在
    const existingIds = users.map(user => user._id.toString());
    const notFoundIds = ids.filter(id => !existingIds.includes(id));

    // 删除存在的记录
    await User.deleteMany({ _id: { $in: existingIds }, role: 'driver' });

    // 记录日志
    await Promise.all(existingIds.map(id =>
      createLog(
        req.user.role,
        "batch_delete_driver",
        true,
        "批量删除乘客成功",
        req.user.id,
        req.user.username,
        id
      )
    ));
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        failed: notFoundIds.map(id => ({ id, reason: "记录不存在" }))
      },
      message: "批量删除完成"
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "batch_delete_driver",
      false,
      `批量删除失败: ${error.message}`,
      req.user.id,
      req.user.username
    );
    console.error("批量删除失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误"
    });
  }
};


// 获取评价列表
export const getReviewsList = async (req, res) => {
  try {
    // 权限验证：仅管理员可访问
    if (req.user.role !== 'admin') {
      return res.status(203).json({
        code: 403,
        message: '无权限，仅管理员可访问',
      });
    }

    // 获取查询参数
    const {
      current = 1,
      size = 10,
      isAnonymous,
      reviewerId,
      reviewedId,
      status, // 筛选：状态 (pending, under_review, completed, rejected)
      reviewType, // 筛选：评价类型 (passenger_to_driver, driver_to_passenger)
      rating, // 筛选：评分 (1-5)
      sortBy = 'createdAt', // 排序字段 (createdAt, rating)
      sortOrder = 'desc', // 排序顺序 (asc, desc)
    } = req.query;

    // 分页参数
    const pageNum = parseInt(current, 10);
    const pageSizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * pageSizeNum;

    // 构建查询条件
    const query = {};
    if (status) query.status = status;
    if (isAnonymous) query.isAnonymous = isAnonymous;
    if (reviewerId) query.reviewerId = reviewerId;
    if (reviewedId) query.reviewedId = reviewedId;
    if (reviewType) query.reviewType = reviewType;
    if (rating) query.rating = parseInt(rating, 10);

    // 构建排序条件
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 查询评价
    const records = await Review.find(query)
      .populate('reviewerId', 'username') // 填充评价者用户名
      .populate('revieweeId', 'username') // 填充被评价者用户名
      .populate('orderId', 'orderNumber') // 填充订单编号（假设 Order 模型有 orderNumber 字段）
      .skip(skip)
      .limit(pageSizeNum)
      .sort(sort)
      .lean();

    // 查询总数
    const total = await Review.countDocuments(query);

    return res.status(200).json({
      code: 200,
      data: { records, total, current, size },
      message: '获取评价列表成功',
    });
  } catch (error) {
    await createLog(
      'admin',
      'get_all_reviews',
      false,
      `获取评价列表失败：${error.message}`,
      req.user.id,
      req.user.username,
      null
    );
    console.error('获取评价列表失败:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
};

// 管理员审核评价
export const auditReview = async (req, res) => {
  try {
    const { id, status, reason } = req.body;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(204).json({ code: 404, message: '评价不存在' });
    }

    if (review.status !== 'under_review') {
      return res.status(200).json({ code: 400, message: '该评价不在审核中状态' });
    }

    review.status = status; // completed 或 rejected
    if (status === 'rejected') {
      review.auditReason = reason;
      await createNotification(
        review.reviewerId,
        'review',
        '评价被拒绝',
        `您的评价因"${reason}"被拒绝`,
        review.orderId
      );
    }

    // 记录状态变更历史
    review.statusHistory = review.statusHistory || [];
    review.statusHistory.push({
      status,
      changedBy: req.user.id, // 管理员ID
      reason
    });

    await review.save();

    await createNotification(
      review.reviewerId,
      'review',
      '审核通过',
      `您的审核已通过，感谢您的评价`,
      review.orderId
    );

    return res.status(200).json({ code: 200, message: '审核成功' });
  } catch (error) {
    console.error('审核评价失败:', error);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 删除评价
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // 输入验证
    if (!reason || typeof reason !== 'string') {
      return res.status(200).json({
        code: 400,
        message: '删除理由必须为字符串',
      });
    }

    // 查询评价
    const review = await Review.findById(id);
    if (!review) {
      await createLog(
        'admin',
        'delete_review',
        false,
        '评价不存在',
        req.user.id,
        req.user.username,
        review?.orderId || null
      );
      return res.status(204).json({
        code: 404,
        message: '评价不存在',
      });
    }

    // 权限验证：仅管理员可删除
    if (req.user.role !== 'admin') {
      await createLog(
        req.user.role,
        'delete_review',
        false,
        '无权限删除评价',
        req.user.id,
        req.user.username,
        review.orderId
      );
      return res.status(403).json({
        code: 403,
        message: '无权限，仅管理员可删除评价',
      });
    }

    // 更新评价状态
    review.status = 'rejected';
    review.auditReason = reason;
    review.deletedAt = new Date();

    // 记录状态变更历史
    review.statusHistory = review.statusHistory || [];
    review.statusHistory.push({
      status: 'rejected',
      changedBy: req.user.id,
      reason,
    });

    await review.save();

    // 发送删除通知
    await createNotification(
      review.reviewerId,
      'review',
      '评价被删除',
      `您的评价因-"${reason}"-被删除`,
      review.orderId
    );

    // 记录日志
    await createLog(
      'admin',
      'delete_review',
      true,
      `删除评价成功，理由：${reason}`,
      req.user.id,
      req.user.username,
      review.orderId
    );

    return res.status(200).json({
      code: 200,
      data: { success: true },
      message: '删除成功',
    });
  } catch (error) {
    await createLog(
      'admin',
      'delete_review',
      false,
      `删除评价失败：${error.message}`,
      req.user.id,
      req.user.username,
      null
    );
    console.error('删除评价失败:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
};





