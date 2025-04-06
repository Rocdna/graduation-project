import Order from '../models/order.model.js'
import Trip from '../models/trip.model.js'
import createLog from '../utils/logger.js' 
import { createNotification } from '../utils/notification.js';

// 司机或管理员创建行程
export const createTrip = async (req, res) => {
    try {
      // 权限验证
      const userRole = req.user.role;
      if (userRole !== 'driver' && userRole !== 'admin') {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权访问，仅司机或管理员可创建行程',
        });
      }
  
      // 输入验证
      const { startLocation, endLocation, startTime, availableSeats, pricePerSeat } = req.body;
      if (!startLocation || !endLocation || !startTime || !availableSeats || !pricePerSeat) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '缺少必要字段：startLocation, endLocation, startTime, availableSeats, pricePerSeat',
        });
      }
  
      const start = new Date(startTime);
      if (isNaN(start.getTime()) || start <= new Date()) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '出发时间无效或早于当前时间',
        });
      }
  
      if (!Number.isInteger(availableSeats) || availableSeats < 1 || availableSeats > 4) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '座位数必须为 1 到 4 之间的整数',
        });
      }
  
      if (!Number.isInteger(pricePerSeat) || pricePerSeat < 0) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '价格必须为 0 或更大的整数',
        });
      }
  
  
      // 创建行程
      const trip = new Trip({
        driverId: req.user.id,
        startLocation,
        endLocation,
        startTime: start,
        availableSeats,
        pricePerSeat,
        status: 'pending',
      });
  
      const savedTrip = await trip.save();
  
      // 记录日志
  
      // 返回结果
      return res.status(201).json({
        code: 201,
        data: {
          success: true,
          trip: {
            id: savedTrip._id,
            tripNumber: savedTrip.tripNumber,
            driverId: savedTrip.driverId,
            startLocation: savedTrip.startLocation,
            endLocation: savedTrip.endLocation,
            startTime: savedTrip.startTime,
            availableSeats: savedTrip.availableSeats,
            pricePerSeat: savedTrip.pricePerSeat,
            status: savedTrip.status,
          },
        },
        message: '创建行程成功',
      });
    } catch (error) {
      console.error('创建行程失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 查看行程详情
export const getTripDetails = async (req, res) => {
    try {
      // 权限验证
      const userRole = req.user.role;
      const { tripId } = req.params;
      if (userRole !== 'admin' && userRole !== 'driver') {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权访问，仅司机或管理员可查看',
        });
      }
  
      // 输入验证
      if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '无效的行程ID',
        });
      }
  
      // 查询行程
      const trip = await Trip.findById(tripId).select(
        'tripNumber driverId startLocation endLocation startTime availableSeats pricePerSeat status'
      );
      if (!trip) {
        return res.status(204).json({
          code: 404,
          data: { success: false },
          message: '行程不存在',
        });
      }
  
      // 司机权限验证（仅限查看自己的行程）
      if (userRole === 'driver' && trip.driverId.toString() !== req.user.id) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权查看其他司机的行程',
        });
      }
  
      // 格式化返回数据
      const tripDetails = {
        id: trip._id,
        tripNumber: trip.tripNumber,
        driverId: trip.driverId,
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        startTime: trip.startTime,
        availableSeats: trip.availableSeats,
        pricePerSeat: trip.pricePerSeat,
        status: trip.status,
      };
  
      // 记录日志
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          trip: tripDetails,
        },
        message: '查看行程详情成功',
      });
    } catch (error) {
      console.error('查看行程详情失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 更新行程信息
export const updateTrip = async (req, res) => {
    try {
      // 权限验证
      const userRole = req.user.role;
      const { tripId } = req.params;
      if (userRole !== 'admin' && userRole !== 'driver') {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权访问，仅司机或管理员可更新',
        });
      }
  
      // 输入验证
      if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '无效的行程ID',
        });
      }
  
      // 查询行程
      const trip = await Trip.findById(tripId).select('driverId status');
      if (!trip) {
        return res.status(204).json({
          code: 404,
          data: { success: false },
          message: '行程不存在',
        });
      }
  
      // 司机权限验证（仅限查看自己的行程）
      if (userRole === 'driver' && trip.driverId.toString() !== req.user.id) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权更新其他司机的行程',
        });
      }
  
      // 状态验证（仅限 pending 或 scheduled）
      if (!['pending', 'in_progress'].includes(trip.status)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '仅可更新 pending 或 in_progress 状态的行程',
        });
      }
  
      // 获取更新内容
      const { startLocation, endLocation, startTime, availableSeats, pricePerSeat } = req.body;
      const updates = {};
      if (startLocation !== undefined) updates.startLocation = startLocation;
      if (endLocation !== undefined) updates.endLocation = endLocation;
      if (startTime) {
        const start = new Date(startTime);
        if (isNaN(start.getTime()) || start <= new Date()) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '出发时间无效或早于当前时间',
          });
        }
        updates.startTime = start;
      }
      if (availableSeats !== undefined) {
        if (!Number.isInteger(availableSeats) || availableSeats < 1 || availableSeats > 4) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '座位数必须为 1 到 4 之间的整数',
          });
        }
        updates.availableSeats = availableSeats;
      }
      if (pricePerSeat !== undefined) {
        if (!Number.isInteger(pricePerSeat) || pricePerSeat < 0) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '价格必须为 0 或更大的整数',
          });
        }
        updates.pricePerSeat = pricePerSeat;
      }
  
      // 如果没有更新内容
      if (Object.keys(updates).length === 0) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '无有效的更新内容',
        });
      }
  
      // 更新行程
      const updatedTrip = await Trip.findByIdAndUpdate(tripId, { $set: updates }, { new: true, runValidators: true }).select(
        'tripNumber driverId startLocation endLocation startTime availableSeats pricePerSeat status'
      );
  
      // 记录日志
  
      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          trip: {
            id: updatedTrip._id,
            tripNumber: updatedTrip.tripNumber,
            driverId: updatedTrip.driverId,
            startLocation: updatedTrip.startLocation,
            endLocation: updatedTrip.endLocation,
            startTime: updatedTrip.startTime,
            availableSeats: updatedTrip.availableSeats,
            pricePerSeat: updatedTrip.pricePerSeat,
            status: updatedTrip.status,
          },
        },
        message: '更新行程成功',
      });
    } catch (error) {
      console.error('更新行程失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 取消行程，同时取消所有未完成的订单
export const cancelTrip = async (req, res) => {
    try {
      // 权限验证
      const userRole = req.user.role;
      const { tripId } = req.params;
      if (userRole !== 'admin' && userRole !== 'driver') {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权访问，仅司机或管理员可取消',
        });
      }
  
      // 输入验证
      if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '无效的行程ID',
        });
      }
  
      // 查询行程
      const trip = await Trip.findById(tripId).select('driverId status availableSeats');
      if (!trip) {
        return res.status(204).json({
          code: 404,
          data: { success: false },
          message: '行程不存在',
        });
      }
  
      // 司机权限验证（仅限查看自己的行程）
      if (userRole === 'driver' && trip.driverId.toString() !== req.user.id) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权取消其他司机的行程',
        });
      }
  
      // 状态验证（仅限 pending 或 scheduled 状态可取消）
      if (!['pending', 'in_progress'].includes(trip.status)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '仅可取消 pending 或 in_progress 状态的行程',
        });
      }
  
      // 开始事务
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // 更新行程状态为 cancelled
        const updatedTrip = await Trip.findByIdAndUpdate(
          tripId,
          { $set: { status: 'cancelled' } },
          { new: true, runValidators: true, session }
        ).select('tripNumber driverId startLocation endLocation startTime availableSeats pricePerSeat status');
  
        // 同步关联订单状态为 cancelled
        await Order.updateMany(
          { tripId: new mongoose.Types.ObjectId(tripId), status: { $in: ['pending', 'matched', 'confirmed'] } },
          { $set: { status: 'cancelled' } },
          { session }
        );
  
        // 记录日志
  
        // 提交事务
        await session.commitTransaction();
        session.endSession();
  
        // 返回结果
        return res.status(200).json({
          code: 200,
          data: {
            success: true,
            trip: {
              id: updatedTrip._id,
              tripNumber: updatedTrip.tripNumber,
              driverId: updatedTrip.driverId,
              startLocation: updatedTrip.startLocation,
              endLocation: updatedTrip.endLocation,
              startTime: updatedTrip.startTime,
              availableSeats: updatedTrip.availableSeats,
              pricePerSeat: updatedTrip.pricePerSeat,
              status: updatedTrip.status,
            },
          },
          message: '取消行程成功',
        });
      } catch (error) {
        // 回滚事务
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      console.error('取消行程失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 开始行程
export const startTrip = async (req, res) => {
    try {
      // 权限验证
      const userRole = req.user.role;
      const { tripId } = req.params;
      if (userRole !== 'driver') {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权访问，仅司机可确认行程',
        });
      }
  
      // 输入验证
      if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '无效的行程ID',
        });
      }
  
      // 查询行程
      const trip = await Trip.findById(tripId).select('driverId status');
      if (!trip) {
        return res.status(204).json({
          code: 404,
          data: { success: false },
          message: '行程不存在',
        });
      }
  
      // 司机权限验证（仅限自己的行程）
      if (trip.driverId.toString() !== req.user.id) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权确认其他司机的行程',
        });
      }
  
      // 状态验证（仅限 pending 状态）
      if (trip.status !== 'pending') {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '仅可确认 pending 状态的行程',
        });
      }
  
      // 检查是否有匹配的订单
      const matchedOrders = await Order.countDocuments({ tripId: new mongoose.Types.ObjectId(tripId), status: 'matched' });
      if (matchedOrders === 0) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '行程无匹配订单，无法确认',
        });
      }
  
      // 更新行程状态为 scheduled
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        { $set: { status: 'scheduled' } },
        { new: true, runValidators: true }
      ).select('tripNumber driverId startLocation endLocation startTime availableSeats pricePerSeat status');
  
      // 记录日志
  
      // 通知乘客（伪代码，需实现通知逻辑）
      const orders = await Order.find({ tripId: new mongoose.Types.ObjectId(tripId), status: 'matched' }).select('passengerId');
      for (const order of orders) {
          await createNotification(
              order.passengerId,
              'trip_update',
              '行程确认通知',
              `您的行程（${updatedTrip.tripNumber}）已确认，请准备出发。`,
              order._id,
              tripId
          );
      }

      // 记录日志

      // 返回结果
      return res.status(200).json({
          code: 200,
          data: {
            success: true,
            trip: {
                id: updatedTrip._id,
                tripNumber: updatedTrip.tripNumber,
                driverId: updatedTrip.driverId,
                startLocation: updatedTrip.startLocation,
                endLocation: updatedTrip.endLocation,
                startTime: updatedTrip.startTime,
                availableSeats: updatedTrip.availableSeats,
                pricePerSeat: updatedTrip.pricePerSeat,
                status: updatedTrip.status,
            },
          },
        message: '确认行程成功',
      });
    } catch (error) {
      console.error('确认行程失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
};

// 完成行程
export const completeTrip = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    const { tripId } = req.params;
    if (userRole !== 'driver') {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权访问，仅司机可完成行程',
      });
    }

    // 输入验证
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无效的行程ID',
      });
    }

    // 查询行程
    const trip = await Trip.findById(tripId).select('driverId status');
    if (!trip) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '行程不存在',
      });
    }

    // 司机权限验证（仅限自己的行程）
    if (trip.driverId.toString() !== req.user.id) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权完成其他司机的行程',
      });
    }

    // 状态验证（仅限 in_progress 状态）
    if (trip.status !== 'in_progress') {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '仅可完成 in_progress 状态的行程',
      });
    }

    // 开始事务
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 更新行程状态为 completed
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        { $set: { status: 'completed' } },
        { new: true, runValidators: true, session }
      ).select('tripNumber driverId startLocation endLocation startTime availableSeats pricePerSeat status');

      // 同步关联订单状态为 completed
      await Order.updateMany(
        { tripId: new mongoose.Types.ObjectId(tripId), status: 'confirmed' },
        { $set: { status: 'completed' } },
        { session }
      );

      // 通知关联订单的乘客
      const orders = await Order.find({ tripId: new mongoose.Types.ObjectId(tripId), status: 'completed' }).select('passengerId');
      for (const order of orders) {
        await createNotification(
          order.passengerId,
          'trip_update',
          '行程完成通知',
          `您的行程（${updatedTrip.tripNumber}）已完成，感谢使用！`,
          order._id,
          tripId
        );
      }

      // 触发评价流程（伪代码，需实现评价逻辑）
      

      // 记录日志

      // 提交事务
      await session.commitTransaction();
      session.endSession();

      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          trip: {
            id: updatedTrip._id,
            tripNumber: updatedTrip.tripNumber,
            driverId: updatedTrip.driverId,
            startLocation: updatedTrip.startLocation,
            endLocation: updatedTrip.endLocation,
            startTime: updatedTrip.startTime,
            availableSeats: updatedTrip.availableSeats,
            pricePerSeat: updatedTrip.pricePerSeat,
            status: updatedTrip.status,
          },
        },
        message: '完成行程成功',
      });
    } catch (error) {
      // 回滚事务
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('完成行程失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};


// 获取司机行程列表
export const getDriverTrips = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    const { driverId } = req.params;
    if (userRole !== 'admin' && userRole !== 'driver') {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权访问，仅司机或管理员可查看',
      });
    }

    // 司机权限验证（仅限查看自己的行程）
    if (userRole === 'driver' && driverId !== req.user.id) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权查看其他司机的行程',
      });
    }

    // 输入验证
    if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无效的司机ID',
      });
    }

    // 获取查询参数（分页和状态筛选）
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // 可选状态筛选

    // 构建查询条件
    const query = { driverId: new mongoose.Types.ObjectId(driverId) };
    if (status) {
      if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(203).json({
          code: 203,
          data: { success: false },
          message: '无效的状态筛选，仅支持 pending, in_progress, completed, cancelled',
        });
      }
      query.status = status;
    }

    // 查询行程总数（用于分页）
    const totalTrips = await Trip.countDocuments(query);

    // 查询行程列表
    const trips = await Trip.find(query)
      .select('tripNumber driverId startLocation endLocation startTime availableSeats pricePerSeat status')
      .skip(skip)
      .limit(limit)
      .sort({ startTime: -1 }); // 按出发时间降序排序

    // 格式化返回数据
    const tripList = trips.map(trip => ({
      id: trip._id,
      tripNumber: trip.tripNumber,
      driverId: trip.driverId,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      startTime: trip.startTime,
      availableSeats: trip.availableSeats,
      pricePerSeat: trip.pricePerSeat,
      status: trip.status,
    }));

    // 记录日志

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        trips: tripList,
        pagination: {
          total: totalTrips,
          page,
          limit,
          totalPages: Math.ceil(totalTrips / limit),
        },
      },
      message: '查看司机行程列表成功',
    });
  } catch (error) {
    console.error('查看司机行程列表失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};


// 获取行程关联订单
export const getTripOrders = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    const { tripId } = req.params;
    if (userRole !== 'admin' && userRole !== 'driver') {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权访问，仅司机或管理员可查看',
      });
    }

    // 输入验证
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无效的行程ID',
      });
    }

    // 查询行程
    const trip = await Trip.findById(tripId).select('driverId');
    if (!trip) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '行程不存在',
      });
    }

    // 司机权限验证（仅限查看自己的行程订单）
    if (userRole === 'driver' && trip.driverId.toString() !== req.user.id) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权查看其他司机的行程订单',
      });
    }

    // 获取分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 查询订单总数（用于分页）
    const totalOrders = await Order.countDocuments({ tripId: new mongoose.Types.ObjectId(tripId) });

    // 查询关联订单
    const orders = await Order.find({ tripId: new mongoose.Types.ObjectId(tripId) })
      .select('passengerId status createdAt')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // 按创建时间降序排序

    // 格式化返回数据
    const orderList = orders.map(order => ({
      id: order._id,
      passengerId: order.passengerId,
      status: order.status,
      createdAt: order.createdAt,
    }));

    // 记录日志

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        orders: orderList,
        pagination: {
          total: totalOrders,
          page,
          limit,
          totalPages: Math.ceil(totalOrders / limit),
        },
      },
      message: '查看行程关联订单成功',
    });
  } catch (error) {
    console.error('查看行程关联订单失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};


// 获取剩余座位数
export const getAvailableSeats = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    const { tripId } = req.params;
    if (userRole !== 'admin' && userRole !== 'driver' && userRole !== 'passenger') {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权访问，仅司机、管理员或乘客可查看',
      });
    }

    // 输入验证
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无效的行程ID',
      });
    }

    // 查询行程
    const trip = await Trip.findById(tripId).select('availableSeats driverId');
    if (!trip) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '行程不存在',
      });
    }

    // 司机权限验证（仅限查看自己的行程）
    if (userRole === 'driver' && trip.driverId.toString() !== req.user.id) {
      return res.status(203).json({
        code: 203,
        data: { success: false },
        message: '无权查看其他司机的行程',
      });
    }

    // 动态计算已占座位数
    const occupiedSeats = await Order.countDocuments({
      tripId: new mongoose.Types.ObjectId(tripId),
      status: { $in: ['matched', 'confirmed'] },
    });
    const availableSeats = Math.max(0, trip.availableSeats - occupiedSeats); // 防止负数

    // 记录日志

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        tripId: trip._id,
        availableSeats: availableSeats,
      },
      message: '查看可用座位成功',
    });
  } catch (error) {
    console.error('查看可用座位失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};








