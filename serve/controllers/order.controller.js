import Order from "../models/order.model.js";
import Trip from "../models/trip.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";
import mongoose from "mongoose";
import createLog from "../utils/logger.js";
import { processRefund } from "../services/paymentService.js";
import { createNotification } from "../utils/notification.js";
import cron from "node-cron";
import { notifyUser, io, clients } from "../server.js";
// import detectSensitiveWords from "../utils/sensitiveWordDetector.js"


// 检查权限许可
const checkOrderPermission = async (req, order) => {
  const userRole = req.user.role;
  if (userRole === "passenger") {
    return order.passengerId.toString() === req.user.id;
  } else if (userRole === "driver") {
    if (!order.tripId) return false;
    const trip = await Trip.findById(order.tripId);
    return trip && trip.driverId.toString() === req.user.id;
  }
  return true; // admin 无限制
};

// 创建订单
export const createOrder = async (req, res) => {
  try {
    const { startAddress, endAddress, startLocation, estimatedTime, endLocation, startTime, seatCount, totalPrice, distance } =
      req.body;
    const passengerId = req.user._id; // 从认证中间件获取

    // 输入验证
    if (
      !startAddress ||
      !endAddress ||
      !startTime ||
      !seatCount ||
      !distance ||
      !startLocation ||
      !endLocation ||
      !estimatedTime ||
      !totalPrice
    ) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "请提供完整的行程信息、座位数和金额",
      });
    }

    if (seatCount < 1 || seatCount > 4) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "座位数必须在 1 到 4 之间",
      });
    }
    if (totalPrice < 0) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "金额不能小于 0",
      });
    }

    // 创建订单
    const order = new Order({
      passengerId,
      startAddress,
      endAddress,
      startLocation,
      endLocation,
      startTime: new Date(startTime),
      seatCount,
      estimatedTime,
      totalPrice,
      distance,
      status: "pending", // 初始状态
    });

    // 保存订单（orderNumber 由 pre-save 钩子自动生成）
    await order.save();

    // 通知管理员（假设管理员接收所有新订单通知）
    // 实际场景中可以匹配附近司机，这里简化为通知所有管理员
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "order",
        "新订单通知",
        `新订单已创建，订单编号：${order.orderNumber}，起点：${startAddress}，终点：${endAddress}`,
        order
      );
    }

    // 通知乘客
    await createNotification(
      passengerId,
      "order",
      "新订单通知",
      `您的订单已创建，订单编号：${order.orderNumber}，等待司机接单`,
      order
    );

    // 广播给所有司机
    io.to('drivers').emit('newOrder', { order });
    console.log(`广播 newOrder 到所有司机，订单 ID: ${order._id}`);

    res.status(200).json({
      code: 200,
      message: "订单创建成功，等待司机接单",
      data: order,
    });
  } catch (error) {
    console.error("创建订单失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误",
    });
  }
};

// 更新订单状态
export const updateOrderStatus = async (req, res) => {
  try {
    // 输入验证
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的订单ID",
      });
    }

    //TODO 验证订单状态
    if (!status || !["matched", "confirmed", "completed"].includes(status)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的状态值",
      });
    }

    // 查询订单
    const order = await Order.findById(id)
      .populate("passengerId", "username role")
      .populate("driverId", "username role")
      .populate("tripId", "startAddress endAddress startTime");
    if (!order) {
      return res.status(200).json({
        code: 404,
        data: { success: false },
        message: "订单不存在",
      });
    }

    // 权限验证
    const userRole = req.user.role;
    if (userRole === "driver") {
      if (!order.tripId) {
        return res.status(200).json({
          code: 403,
          data: { success: false },
          message: "行程未分配，无法更新",
        });
      }
      const trip = await Trip.findById(order.tripId);
      if (!trip || trip.driverId.toString() !== req.user._id) {
        await createLog(
          req.user._id,
          req.user.role,
          id,
          "update_order_status",
          false,
          "无权更新此订单"
        );
        return res.status(200).json({
          code: 403,
          data: { success: false },
          message: "无权更新此订单",
        });
      }
    } else if (userRole !== "admin") {
      return res.status(200).json({
        code: 403,
        data: { success: false },
        message: "无权访问",
      });
    }

    // 状态转换验证
    const validTransitions = {
      pending: ["matched"],
      matched: ["confirmed"],
      confirmed: ["completed"],
    };
    if (
      !validTransitions[order.status] ||
      !validTransitions[order.status].includes(status)
    ) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: `状态从 ${order.status} 不可转换为 ${status}`,
      });
    }

    // 更新状态
    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // 触发通知
    const passengerId = order.passengerId._id;
    const driverId = order.driverId ? order.driverId._id : null;
    if (status === "confirmed") {
      await Notification.create({
        recipientId: passengerId,
        type: "order_confirmed",
        message: `您的订单 (${order.orderNumber}) 已确认`,
        orderId: order._id,
      });
      if (driverId) {
        await Notification.create({
          recipientId: driverId,
          type: "order_confirmed",
          message: `订单 (${order.orderNumber}) 已确认`,
          orderId: order._id,
        });
      }
    } else if (status === "completed") {
      await Notification.create({
        recipientId: passengerId,
        type: "order_completed",
        message: `您的订单 (${order.orderNumber}) 已完成，请评价`,
        orderId: order._id,
      });
      if (driverId) {
        await Notification.create({
          recipientId: driverId,
          type: "order_completed",
          message: `订单 (${order.orderNumber}) 已完成，请评价`,
          orderId: order._id,
        });
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

// 司机接受订单, 更新订单状态为 "matched" 并创建行程
export const acceptOrder = async (req, res) => {
  try {
    // 输入验证：订单 ID
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的订单ID',
      });
    }

    // 输入验证：司机提交的数据
    const {
      status, 
      startLocation,    // 起始地坐标 [lng, lat]
      endLocation,      // 终点坐标 [lng, lat]
      startAddress,     // 起始地名称
      endAddress,       // 终点名称
      estimatedTime,    // 预计所需时间（分钟）
      price,            // 价格
      seats,            // 所需座位数
      distance          // 距离（公里）
    } = req.body;

    if (status !== 'matched') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '状态必须为 "matched"',
      });
    }

    if (!startLocation || !endLocation || !startAddress || !endAddress ||
        !estimatedTime || !price || !seats || !distance) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '缺少必要的行程信息',
      });
    }

    // 查询订单
    const order = await Order.findById(id)
      .populate('passengerId')
      .populate('driverId');
    if (!order) {
      return res.status(200).json({
        code: 404,
        data: { success: false },
        message: '订单不存在',
      });
    }

    // 权限验证：仅司机可接受订单
    const userRole = req.user.role;
    if (userRole !== 'driver') {
      return res.status(200).json({
        code: 403,
        data: { success: false },
        message: '仅司机可接受订单',
      });
    }


    // 验证司机是否匹配订单
    if (order.driverId && order.driverId._id.toString() !== req.user._id.toString()) {
      return res.status(200).json({
        code: 403,
        data: { success: false },
        message: '无权接受此订单',
      });
    }

    // 状态转换验证：仅从 "pending" 到 "matched"
    if (order.status !== 'pending') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: `订单状态 ${order.status} 不可更新为 matched`,
      });
    }

    // 检查并更新司机可用座位数
    const driver = await User.findOne({ _id: req.user._id });
    if (!driver) {
      return res.status(204).json({ code: 400, data: { success: false }, message: '司机信息不存在' });
    }
    if (driver.profile.availableSeats < seats) {
      return res.status(200).json({ code: 400, data: { success: false }, message: `可用座位数 ${driver.profile.availableSeats} 不足（需 ${seats}）` });
    }


    // 更新订单状态并绑定司机
    order.status = 'matched';
    order.driverId = driver; // 绑定当前司机
    driver.profile.availableSeats -= seats;
    await order.save();
    await driver.save();

    // 创建行程
    const trip = new Trip({
      orderId: order._id,        // 关联订单
      driverId: order.driverId,     // 司机信息
      passengerId: order.passengerId, // 乘客信息
      startLocation,             // 起始地坐标 [lng, lat]
      endLocation,               // 终点坐标 [lng, lat]
      startAddress,              // 起始地名称
      endAddress,                // 终点名称
      estimatedTime,             // 预计时间（分钟）
      price,                     // 价格
      seats,                     // 所需座位数
      distance,                  // 距离（公里）
      status: 'created'          // 行程初始状态
    });
    const savedTrip = await trip.save();

    // 将行程 ID 绑定到订单
    order.tripId = savedTrip._id;
    await order.save();

    // 触发通知，乘客
    await createNotification(
      order.passengerId._id,
      'order_matched',
      '匹配成功',
      `您的订单 (${order.orderNumber}) 已被司机接受，行程已创建`,
      order,
      savedTrip
    )

    // 给司机
    await createNotification(
      req.user._id,
      'order',
      '接单通知',
      `您已接受订单 (${order.orderNumber})，行程已创建`,
      order,
      savedTrip
    );

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: { order, trip: savedTrip },
      message: '订单状态更新为 matched，行程创建成功',
    });
  } catch (error) {
    console.error('接受订单失败', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};

// 司机确认订单，更新订单状态为 "confirmed" 并更新行程状态为 "ongoing"
export const confirmOrder = async (req, res) => {
  try {
    // 输入验证：订单 ID
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的订单ID',
      });
    }

    // 输入验证：状态必须为 "confirmed"
    const { status } = req.body;
    if (status !== 'confirmed') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '状态必须为 "confirmed"',
      });
    }

    // 查询订单并填充相关信息
    const order = await Order.findById(id)
      .populate('passengerId')
      .populate('driverId')
      .populate('tripId');
    if (!order) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '订单不存在',
      });
    }

    // 权限验证：仅司机可确认订单
    const userRole = req.user.role;
    if (userRole !== 'driver') {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '仅司机可确认订单',
      });
    }

    // 验证司机是否匹配订单
    if (!order.driverId || order.driverId._id.toString() !== req.user._id.toString()) {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '无权确认此订单',
      });
    }

    // 检查订单是否已有行程
    if (!order.tripId) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '订单未关联行程，无法确认',
      });
    }

    // 状态转换验证：订单从 "matched" 到 "confirmed"
    if (order.status !== 'matched') {
      return res.status(400).json({
        code: 400,
        data: { success: false },
        message: `订单状态 ${order.status} 不可更新为 confirmed`,
      });
    }

    // 查询行程
    const trip = await Trip.findById(order.tripId._id);
    if (!trip) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '行程不存在',
      });
    }

    // 状态转换验证：行程从 "created" 到 "ongoing"
    if (trip.status !== 'created') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: `行程状态 ${trip.status} 不可更新为 ongoing`,
      });
    }

    // 更新订单状态
    order.status = 'confirmed';
    await order.save();

    // 更新行程状态和开始时间
    trip.status = 'ongoing';
    trip.startTime = new Date();
    await trip.save();

    // 触发通知乘客
    await createNotification(
      order.passengerId._id,
      'order_confirmed',
      '司机确认订单',
      `您的订单 (${order.orderNumber}) 已确认，行程开始`,
      order,
      trip
    );

    // 通知司机
    await createNotification(
      req.user._id,
      'order',
      '订单确认',
      `您已确认订单 (${order.orderNumber})，行程开始`,
      order,
      trip
    );

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: { order, trip },
      message: '订单状态更新为 confirmed，行程开始',
    });
  } catch (error) {
    console.error('确认订单失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};

// 完成订单，司机将乘客送至目的地，更新订单状态为 "completed" 并更新行程状态为 "completed"
export const completeOrder = async (req, res) => {
  try {
    // 输入验证：订单 ID
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的订单ID',
      });
    }

    // 输入验证：状态必须为 "completed"
    const { status } = req.body;
    if (status !== 'completed') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '状态必须为 "completed"',
      });
    }

    // 查询订单并填充相关信息
    const order = await Order.findById(id)
      .populate('passengerId')
      .populate('driverId')
      .populate('tripId');
    if (!order) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '订单不存在',
      });
    }

    // 权限验证：仅司机可完成订单
    const userRole = req.user.role;
    if (userRole !== 'driver') {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '仅司机可完成订单',
      });
    }

    // 验证司机是否匹配订单
    if (!order.driverId || order.driverId._id.toString() !== req.user._id.toString()) {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '无权完成此订单',
      });
    }

    // 检查订单是否已有行程
    if (!order.tripId) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '订单未关联行程，无法完成',
      });
    }

    // 状态转换验证：订单从 "confirmed" 到 "completed"
    if (order.status !== 'confirmed') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: `订单状态 ${order.status} 不可更新为 completed`,
      });
    }

    // 查询行程
    const trip = await Trip.findById(order.tripId._id);
    if (!trip) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '行程不存在',
      });
    }

    // 状态转换验证：行程从 "ongoing" 到 "completed"
    if (trip.status !== 'ongoing') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: `行程状态 ${trip.status} 不可更新为 completed`,
      });
    }

    const driver = await User.findById(req.user._id );
    driver.profile.availableSeats += trip.seats; // 恢复座位数
    await driver.save();

    // 更新订单状态
    const previousOrderStatus = order.status;
    order.status = 'completed';
    await order.save();

    // 更新行程状态和结束时间
    const previousTripStatus = trip.status;
    trip.status = 'completed';
    trip.endTime = new Date(); // 记录当前时间作为结束时间
    await trip.save();


    // 触发通知
    await createNotification(
      order.passengerId._id,
      'order_completed',
      '订单完成',
      `您的订单 (${order.orderNumber}) 已完成，请支付`,
      order,
      trip
    );
    await createNotification(
      req.user._id,
      'order',
      '订单通知',
      `您已完成订单 (${order.orderNumber})，请等待乘客评价`,
      order,
      trip
    );

    // 记录成功日志
    await createLog(
      userRole,
      'complete_order',
      true,
      `订单状态从 ${previousOrderStatus} 更新为 completed，行程 ${trip._id} 状态从 ${previousTripStatus} 更新为 completed，结束时间 ${trip.endTime}`,
      req.user.id,
      req.user.username,
      id
    );

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: { order, trip },
      message: '订单状态更新为 completed，行程完成',
    });
  } catch (error) {
    await createLog(
      req.user.role || 'unknown',
      'complete_order',
      false,
      `服务器错误: ${error.message}`,
      req.user.id || null,
      req.user.username || null,
      req.params.id || null
    );
    console.error('完成订单失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};

// 更新支付状态 从 unpaid -> paid or unpaid -> refunded
export const updatePaymentStatus = async (req, res) => {
  try {
    // 输入验证
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的订单ID",
      });
    }
    if (!status || !["paid", "refunded"].includes(status)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "支付状态必须为 paid 或 refunded",
      });
    }

    // 查询订单
    const order = await Order.findById(id)
      .populate("passengerId")
      .populate("tripId");
    if (!order) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "订单不存在",
      });
    }

    // 权限验证
    const userRole = req.user.role;
    if (userRole === "passenger") {
      if (order.passengerId._id.toString() !== req.user._id.toString()) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: "无权更新此订单的支付状态",
        });
      }
    } else if (userRole !== "admin") {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: "无权访问，仅乘客或管理员可更新支付状态",
      });
    }

    // 状态检查和更新
    const currentStatus = order.paymentStatus || "unpaid";
    if (currentStatus === "refunded") {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "已退款的订单不可修改支付状态",
      });
    }
    if (status === "paid" && currentStatus !== "unpaid") {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "仅未支付订单可标记为 paid",
      });
    }
    if (status === "refunded" && currentStatus !== "paid") {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "仅已支付订单可退款",
      });
    }

    // 处理支付或退款
    if (status === "paid") {
      order.paymentStatus = "paid";
      order.paymentTime = new Date();
    } else if (status === "refunded") { 
      try {
        const refundSuccess = await processRefund(order._id, order.totalPrice);
        if (refundSuccess) {
          order.paymentStatus = "refunded";
          order.paymentTime = new Date();
        } else {
          throw new Error("退款失败");
        }
      } catch (error) {
        await createLog(
          req.user.role,
          "update_payment_status",
          false,
          `退款失败: ${error.message}`,
          req.user.id,
          req.user.username,
          id,

        );
        return res.status(500).json({
          code: 500,
          data: { success: false },
          message: "退款失败，请联系管理员",
        });
      }
    }

    await order.save();

    // 触发通知
    const passengerId = order.passengerId._id;
    const driverId = order.tripId ? order.tripId.driverId._id : null;
    console.log(driverId);
    await createNotification(
      passengerId,
      "payment",
      "支付状态更新",
      `您的订单支付状态已更新为 ${status}`,
      order
    );
    if (driverId) {
      await createNotification(
        driverId,
        "payment",
        "支付状态更新",
        `订单 ${order.orderNumber} 支付状态已更新为 ${status}`,
        order
      );
    }


    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        paymentStatus: order.paymentStatus,
        paymentTime: order.paymentTime,
      },
      message: "支付状态更新成功",
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "update_payment_status",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
      req.params.id || "未知",
    );
    console.error("更新支付状态失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误",
    });
  }
};

// 订单评价，在订单完成后
export const rateOrder = async (req, res) => {
  try {
    // 输入验证
    const { id } = req.params;
    const { rating, content, isAnonymous } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的订单ID",
      });
    }

    // 评价分数，内容字数限定，是否匿名校验
    if (!rating || rating < 1 || rating > 5) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "评分必须为 1-5 之间的数字",
      });
    }
    if (content && (typeof content !== "string" || content.length > 500)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "评论长度必须小于500字符",
      });
    }
    if (isAnonymous !== undefined && typeof isAnonymous !== "boolean") {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "匿名状态必须为布尔值",
      });
    }

    // 查询订单
    const order = await Order.findById(id)
      .populate("passengerId")
      .populate("tripId");
    if (!order) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "订单不存在",
      });
    }

    // 权限验证, 乘客 -> 司机 司机 -> 乘客， 管理员可以删除评价
    const userRole = req.user.role;
    let reviewType, revieweeId;
    if (userRole === "passenger") {
      if (order.passengerId._id.toString() !== req.user._id.toString()) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: "无权评价此订单",
        });
      }
      reviewType = "passenger_to_driver";
      revieweeId = order.tripId ? order.tripId.driverId : null;
      if (!revieweeId) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: "行程未分配，无需评价",
        });
      }
    } else if (userRole === "driver") {
      if (!order.tripId) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: "行程未分配，无法评价",
        });
      }
      const trip = order.tripId;
      if (trip.driverId.toString() !== req.user._id.toString()) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: "无权评价此订单",
        });
      }
      reviewType = "driver_to_passenger";
      revieweeId = order.passengerId._id;
    } else {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: "无权访问，仅乘客或司机可评价",
      });
    }

    // 状态检查
    if (order.status !== "completed") {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "仅已完成订单可评价",
      });
    }

    // 检查支付状态（补充）
    if (order.paymentStatus !== 'paid' && userRole === 'passenger') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '订单未支付，无法评价',
      });
    }

    // 检查评价时间窗口（补充）
    // const evaluationDeadline = new Date(order.completedAt + 7 * 24 * 60 * 60 * 1000); // 7 天
    // if (new Date() > evaluationDeadline) {
    //   return res.status(200).json({
    //     code: 400,
    //     data: { success: false },
    //     message: '评价已过期，订单完成7天后无法评价',
    //   });
    // }

    // 检查是否已评价
    const existingReview = await Review.findOne({
      orderId: id,
      reviewerId: req.user._id,
    });
    if (existingReview) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "您已评价此订单",
      });
    }

    /// 自动审核：检测敏感词
    // const foundSensitiveWords = detectSensitiveWords(content);
    // const hasSensitiveWord = foundSensitiveWords.length > 0;

    const sensitiveWords = ['垃圾', '辱骂', '广告'];
    const hasSensitiveWord = content && sensitiveWords.some(word => content.includes(word));

    // 折中方案：好评（4-5 星）直接通过，差评（1-3 星）需审核
    const initialStatus = hasSensitiveWord || rating <= 3 ? 'under_review' : 'completed';

    // 创建评价
    const review = new Review({
      orderId: id,
      reviewerId: req.user._id,
      revieweeId,
      reviewType,
      rating,
      content: content || "",
      isAnonymous: isAnonymous || false,
      status: initialStatus,
    });

    // 记录状态变更历史（可选）
    if (initialStatus === 'under_review') {
      review.statusHistory = review.statusHistory || [];
      review.statusHistory.push({
        status: 'under_review',
        changedBy: req.user.id,
        // reason: hasSensitiveWord ? `检测到敏感词：${foundSensitiveWords.join(', ')}` : '差评需审核'
        reason: hasSensitiveWord ? "检测到敏感词" : '差评需审核'
      });
    }

    await review.save();

    // 通知逻辑,触发通知
    if (initialStatus === 'under_review') {
      // 通知评价者：评价待审核
      await createNotification(
        req.user._id,
        'review',
        '评价待审核',
        '您的评价已提交，正在等待管理员审核',
        order
      );
    } else {
      // 通知被评价者：收到新评价
      await createNotification(
        revieweeId,
        'order',
        '收到新评价',
        `您收到来自 ${
          userRole === 'passenger' ? '乘客' : '司机'
        } 的评价，评分：${rating}${content ? `，评论：${content}` : ''}`,
        order
      );
    }

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        rating,
        content: content || "",
        isAnonymous: isAnonymous || false,
        status: initialStatus,
        message: initialStatus === 'under_review' ? '评价提交成功，待审核' : '评价提交成功'
      },
      message: initialStatus === 'under_review' ? '评价提交成功，待审核' : '评价提交成功'
    });
  } catch (error) {
    console.error("提交订单评价失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误",
    });
  }
};

// 取消订单，更新订单状态为 "canceled"，乘客专用
export const cancelOrder = async (req, res) => {
  try {
    // 输入验证：订单 ID
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的订单ID',
      });
    }

    // 输入验证：状态必须为 "canceleed"，取消原因可选
    const { status, reason } = req.body;
    if (status !== 'cancelled') {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '状态必须为 "cancelled"',
      });
    }

    // 查询订单并填充相关信息
    const order = await Order.findById(id)
      .populate('passengerId')
      .populate('driverId')
      .populate('tripId');
    if (!order) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '订单不存在',
      });
    }

    // 权限验证：仅乘客可取消订单
    const userRole = req.user.role;
    const userId = req.user._id;
    const isPassenger = userRole === 'passenger' && order.passengerId._id.toString() === userId.toString();

    if (!isPassenger) {
      await createLog(
        userRole,
        'cancel_order',
        false,
        '仅乘客可取消订单',
        req.user.id,
        req.user.username,
        id
      );
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '仅乘客可取消订单',
      });
    }

    // 状态转换验证：订单只能在 "pending"、"matched" 或 "confirmed" 状态下取消
    const cancellableOrderStatuses = ['pending', 'matched', 'confirmed'];
    if (!cancellableOrderStatuses.includes(order.status)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: `订单状态 ${order.status} 不可取消`,
      });
    }

    // 如果订单已有行程，检查并更新行程状态
    let trip;
    if (order.tripId) {
      trip = await Trip.findById(order.tripId._id);
      if (!trip) {
        return res.status(204).json({
          code: 404,
          data: { success: false },
          message: '行程不存在',
        });
      }

      // 如果订单状态为 "matched"，行程状态必须为 "created" 才能取消
      if (order.status === 'matched' && trip.status !== 'created') {
        return res.status(400).json({
          code: 400,
          data: { success: false },
          message: `订单为 matched 时，行程状态 ${trip.status} 不可取消`,
        });
      }
      // 对于 "confirmed" 状态，行程可能为 "ongoing"，仍允许取消，不限制行程状态
    }

    const driver = trip ? await User.findById(order.driverId._id) : null;
    // 更新订单状态和取消原因
    const previousOrderStatus = order.status;
    order.status = 'cancelled';
    order.canceledReason = reason || '乘客取消'; // 默认原因
    await order.save();

    // 如果有行程，更新行程状态和取消时间
    let previousTripStatus;
    if (trip) {
      previousTripStatus = trip.status;
      trip.status = 'cancelled';
      trip.canceledTime = new Date(); // 记录当前时间作为取消时间
      driver.profile.availableSeats += trip.seats; // 恢复座位数
      await trip.save();
      await driver.save();
    }

    // 触发通知
    const cancelMessage = reason ? `，原因：${reason}` : '';

    // 乘客
    await createNotification(
      order.passengerId._id,
      'order',
      '订单取消通知',
      `您已取消订单 (${order.orderNumber})${cancelMessage}`,
      order,
      trip ? trip : null
    );

    if (order.driverId) {
      await createNotification(
        order.driverId._id,
        'order_cancelled',
        '取消订单通知',
        `乘客已取消订单 (${order.orderNumber})${cancelMessage}`,
        order,
        trip ? trip : null
      );
    } else {
      io.to('drivers').emit('orderRemoved', { orderId: order._id });
      console.log(`广播 orderRemoved 到所有司机，订单 ID: ${order._id}`);
    }

    // 记录成功日志
    const logMessage = trip
      ? `订单状态从 ${previousOrderStatus} 更新为 canceled，行程 ${trip._id} 状态从 ${previousTripStatus} 更新为 canceled，取消时间 ${trip.canceledTime}`
      : `订单状态从 ${previousOrderStatus} 更新为 canceled，无关联行程`;
    await createLog(
      userRole,
      'cancel_order',
      true,
      logMessage,
      req.user.id,
      req.user.username,
      id
    );

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: { order, trip: trip || null },
      message: '订单已取消',
    });
  } catch (error) {
    await createLog(
      req.user.role || 'unknown',
      'cancel_order',
      false,
      `服务器错误: ${error.message}`,
      req.user.id || null,
      req.user.username || null,
      req.params.id || null
    );
    console.error('取消订单失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};


// 获取订单详情
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的订单ID",
      });
    }

    // 查询订单并填充关联数据
    const order = await Order.findById(id)
      .populate("passengerId", "username role")
      .populate("driverId")
      .populate("tripId");
    if (!order) {
      return res.status(200).json({
        code: 404,
        data: { success: false },
        message: "订单不存在",
      });
    }

    // 权限验证
    const userRole = req.user.role;
    if (userRole === "passenger") {
      if (order.passengerId._id.toString() !== req.user.id) {
        return res.status(200).json({
          code: 403,
          data: { success: false },
          message: "无权查看此订单",
        });
      }
    } else if (userRole === "driver") {
      if (order.driverId && order.driverId._id.toString() !== req.user.id) {
        if (order.tripId) {
          const trip = await Trip.findById(order.tripId);
          if (!trip || trip.driverId.toString() !== req.user.id) {
            return res.status(200).json({
              code: 403,
              data: { success: false },
              message: "无权查看此订单",
            });
          }
        } else {
          await createLog(
            req.user.id,
            req.user.role,
            id,
            "view_order",
            false,
            "无权查看此订单"
          );
          return res.status(403).json({
            code: 403,
            data: { success: false },
            message: "无权查看此订单",
          });
        }
      }
    } else if (userRole !== "admin") {
      return res.status(200).json({
        code: 403,
        data: { success: false },
        message: "无权访问",
      });
    }

    // 成功记录日志
    await createLog(
      req.user.role,
      "view_order",
      true,
      "订单详情获取成功",
      req.user.id,
      req.user.username,
      id
    );

    // 返回订单详情
    return res.status(200).json({
      code: 200,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          passenger: order.passengerId,
          driver: order.driverId || null,
          trip: order.tripId || {
            startAddress: order.startAddress,
            endAddress: order.endAddress,
            startTime: order.startTime,
          },
          status: order.status,
          seatCount: order.seatCount,
          totalPrice: order.totalPrice,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          paymentTime: order.paymentTime,
          canceledReason: order.canceledReason,
          createdAt: order.createdAt,
        },
      },
      message: "订单详情获取成功",
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "view_order",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username,
      req.params.id || "未知"
    );
    console.error("获取订单详情失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误",
    });
  }
};

// 获取用户订单列表
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        code: 400,
        data: { success: false },
        message: "无效的用户ID",
      });
    }

    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page < 1 || limit < 1) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "分页参数必须为正整数",
      });
    }
    if (
      status &&
      !["pending", "matched", "confirmed", "cancelled", "completed"].includes(
        status
      )
    ) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的状态值",
      });
    }

    // 权限验证
    const userRole = req.user.role;
    let query = { passengerId: userId }; // 默认查询该用户作为乘客的订单
    if (userRole === "passenger") {
      if (userId !== req.user._id.toString()) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: "无权查看其他用户的订单",
        });
      }
    } else if (userRole === "driver") {
      // 司机只能查看自己行程相关的订单
      const driverOrders = await Order.find({ tripId: { $exists: true } })
        .populate("tripId")
        .lean();
      const authorizedOrders = driverOrders.filter((order) => {
        const trip = order.tripId;
        return (
          trip && trip.driverId && trip.driverId.toString() === req.user._id.toString()
        );
      });
      query = { _id: { $in: authorizedOrders.map((o) => o._id) } };
    } else if (userRole !== "admin") {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: "无权访问",
      });
    }

    // 应用状态过滤
    if (status) {
      query.status = status;
    }

    // 查询订单并分页
    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate("passengerId", "username role")
      .populate("driverId")
      .populate("tripId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // 按创建时间降序
    const total = await Order.countDocuments(query);

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      message: "订单列表获取成功",
    });
  } catch (error) {
    await createLog(
      req.user.role,
      "get_user_orders",
      false,
      `服务器错误: ${error.message}`,
      req.params.userId || "未知",
      req.user.username || "未知"
    );
    console.error("获取用户订单列表失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误",
    });
  }
};

// 获取乘客当前运行订单（pending, matched, confirmed）
export const getPassengerOrder = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'passenger') {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '仅乘客可查看订单状态'
      });
    }

    const passengerId = req.user._id;

    // 查询乘客的订单
    const orders = await Order.find({
      passengerId,
      status: { $in: ['pending', 'matched', 'confirmed'] }
    })
      .populate('driverId'); // 可选：显示司机信息

    // 检查订单数量
    if (orders.length > 1) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '乘客存在多条运行中订单，请联系管理员处理'
      });
    }
    // 返回唯一订单（或空数组）
    return res.status(200).json({
      code: 200,
      data: orders[0] || null, // 如果没有订单，返回 null
      message: '成功获取订单状态'
    });
  } catch (error) {
    console.error('获取乘客订单列表失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误'
    });
  }
};

// 获取行程相关订单
export const getTripOrders = async (req, res) => {
  try {
    // 输入验证
    const { tripId } = req.params;
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的行程ID",
      });
    }

    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page < 1 || limit < 1) {
      
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "分页参数必须为正整数",
      });
    }

    if (
      status &&
      !["pending", "matched", "confirmed", "cancelled", "completed"].includes(
        status
      )
    ) {
      
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: "无效的状态值",
      });
    }

    // 查询行程并验证存在
    const trip = await Trip.findById(tripId);
    if (!trip) {
      
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: "行程不存在",
      });
    }

    // 权限验证
    const userRole = req.user.role;
    if (userRole === "driver") {
      if (trip.driverId.toString() !== req.user.id) {
       
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: "无权查看此行程的订单",
        });
      }
    } else if (userRole !== "admin") {
      
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: "无权访问",
      });
    }

    // 构建查询条件
    let query = { tripId };
    if (status) {
      query.status = status;
    }

    // 查询订单并分页
    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate("passengerId", "username role")
      .populate("driverId", "username role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // 按创建时间降序
    const total = await Order.countDocuments(query);

    // 记录日志
    await createLog(
      req.user.role,
      "get_trip_orders",
      true,
      `查询行程订单成功，总数: ${total}`,
      req.user.id,
      req.user.username
    );

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      message: "行程订单列表获取成功",
    });
  } catch (error) {
    await createLog(
      req.user.role,
      req.params.tripId || "未知",
      "get_trip_orders",
      false,
      `服务器错误: ${error.message}`,
      req.user.id,
      req.user.username
    );
    console.error("获取行程订单列表失败:", error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: "服务器错误",
    });
  }
};

// 获取可接单列表，仅返回状态为 "pending" 的订单
export const getAvailableOrders = async (req, res) => {
  try {
    // 权限验证：仅司机可访问接单列表
    const userRole = req.user.role;
    if (userRole !== 'driver') {
      await createLog(
        userRole,
        'get_available_orders',
        false,
        '仅司机可查看可接单列表',
        req.user.id,
        req.user.username,
        null
      );
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '仅司机可查看可接单列表',
      });
    }

    // 获取司机当前可用座位数
    const driver = await User.findOne({ driverId: req.user.id });
    if (!driver) {
      await createLog(
        req.user.id,
        userRole,
        false,
        '司机信息不存在',
        req.user.id,
        req.user.username,
        null
      );
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '司机信息不存在',
      });
    }
    // 可用座位数
    const availableSeats = driver.availableSeats;

    // 查询所有状态为 "pending" 的订单
    const orders = await Order.find({
      status: 'pending',
      driverId: null, // 确保订单未被其他司机接单
      seatCount: { $lte: availableSeats } // 座位需求小于等于可用座位数
    })
      .populate('passengerId', 'username') // 填充乘客用户名
      .select('startAddress endAddress passengerId startTime createdAt seatCount totalPrice'); // 选择需要的字段

    // 如果没有可接单的订单
    if (!orders || orders.length === 0) {
      await createLog(
        req.user.id,
        userRole,
        true,
        `当前无可接单订单（可用座位数: ${availableSeats}）`,
        req.user.id,
        req.user.username,
        null
      );
      return res.status(200).json({
        code: 200,
        data: [],
        message: '当前无可接单订单',
      });
    }

    // 记录成功日志
    await createLog(
      req.user.id,
      userRole,
      true,
      `成功获取 ${orders.length} 个可接单订单（可用座位数: ${availableSeats}）`,
      req.user.id,
      req.user.username,
      null
    );

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: orders,
      message: '成功获取可接单列表',
    });
  } catch (error) {
    await createLog(
      req.user.role || 'unknown',
      'get_available_orders',
      false,
      `服务器错误: ${error.message}`,
      req.user.id || null,
      req.user.username || null,
      null
    );
    console.error('获取可接单列表失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};

// 可加入智能匹配
// 获取当前可接单、可确认、可完成的订单列表，然回订单列表（司机）
export const getDriverTasks = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'driver') {
      return res.status(203).json({ code: 403, data: { success: false }, message: '仅司机可查看任务列表' });
    }

    const driverId = req.user._id;

    // 获取司机已接受的订单（matched 和 confirmed）
    const acceptedOrders = await Order.find({
      driverId,
      status: { $in: ['matched', 'confirmed'] }
    })
      .populate('passengerId', 'username')
      .select('startAddress endAddress startLocation endLocation estimatedTime passengerId orderNumber status startTime seatCount totalPrice tripId');

    // 获取可接受的订单（pending 且座位需求满足）
    const driver = await User.findOne({ _id: driverId });
    const availableOrders = await Order.find({
      status: 'pending',
      driverId: null,
      seatCount: { $lte: driver.profile.availableSeats }
    })
      .populate('passengerId', 'username')
      .select('startAddress endAddress startLocation endLocation estimatedTime passengerId orderNumber status startTime distance seatCount totalPrice');

    const tasks = [...acceptedOrders, ...availableOrders];

    return res.status(200).json({
      code: 200,
      data: tasks,
      message: '成功获取任务列表'
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return res.status(500).json({ code: 500, data: { success: false }, message: '服务器错误' });
  }
};


// 定期检查订单
export const startExpirationCheck = () => {
  // 每 30 分钟检查一次（可调整）
  cron.schedule("*/30 * * * *", async () => {
    try {
      const EXPIRATION_TIME = process.env.EXPIRATION_TIME || 30 * 60 * 1000; // 30 分钟
      const now = new Date();
      const expirationThreshold = new Date(now.getTime() - EXPIRATION_TIME);

      // 查询过期订单
      const expiredOrders = await Order.find({
        status: "matched",
        createdAt: { $lt: expirationThreshold },
      }).populate("passengerId", "username");

      if (expiredOrders.length === 0) {
        return;
      }

      // 更新订单状态，批量更新
      const orderIds = expiredOrders.map((order) => order._id);
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: { status: "cancelled" } }
      );

      // 触发通知
      for (const order of expiredOrders) {
        const passengerId = order.passengerId._id;
        await createNotification(
          passengerId,
          "order",
          "订单过期通知",
          "您的订单因超过30分钟未匹配，已自动取消",
          order._id
        );
      }
      // 记录日志
      await createLog(
        "system",
        "check_expiration",
        true,
        `处理 ${expiredOrders.length} 个过期订单`
      );
    } catch (error) {
      await createLog(
        "system",
        "check_expiration",
        false,
        `服务器错误: ${error.message}`
      );
      console.error("检查订单过期失败:", error);
    }
  });
};
