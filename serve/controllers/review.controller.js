import Order from '../models/order.model.js'
import Trip from '../models/trip.model.js'
import Review from '../models/review.model.js'
import User from '../models/user.model.js'
import mongoose from 'mongoose'


// 检查权限许可
const checkOrderPermission = async (req, order) => {
    const userRole = req.user.role;
    if (userRole === 'passenger') {
      return order.passengerId.toString() === req.user.id;
    } else if (userRole === 'driver') {
      if (!order.tripId) return false;
      const trip = await Trip.findById(order.tripId);
      return trip && trip.driverId.toString() === req.user.id;
    }
    return true; // admin 无限制
};


/** 乘客和司机 */

// 查看用户评价列表
// 乘客查看评价 reviewType === 'passenger_to_driver'
// 如果查看的是对司机的评价 type === reviewer 如果是司机对自己的评价 type === reviewee
// 司机是 reviewType === 'passenger_to_driver'  type 一样的
export const getReviews = async(req, res) => {
    try {
      // 输入验证
      const { userId } = req.params;
      const { page = 1, limit = 10, reviewType, type, rating, status } = req.query; // 分页和筛选参数
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '无效的用户ID',
        });
      }

      // 评价类型校验
      if (reviewType && !['passenger_to_driver', 'driver_to_passenger'].includes(reviewType)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '评价类型必须为 passenger_to_driver 或 driver_to_passenger',
        });
      }


      // 权限验证
      const userRole = req.user.role;
      if (userRole !== 'admin' && req.user._id.toString() !== userId) {
        return res.status(203).json({
          code: 403,
          data: { success: false },
          message: '无权查看其他用户的评价，仅限本人或管理员',
        });
      }

      // 验证 rating
      let ratingNum;
      if (rating) {
        ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '评分必须为 1 到 5 的整数',
          });
        }
      }

      // 验证 status
      const validStatuses = ['pending', 'under_review', 'completed', 'rejected'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: '状态必须为 pending, under_review, completed 或 rejected',
        });
      }

      // 查询用户
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(204).json({
          code: 404,
          data: { success: false },
          message: '用户不存在',
        });
      }

      // 构建查询条件
      const query = {};

      if (type === 'reviewer') {
        query.reviewerId = userId;
      } else if (type === 'reviewee') {
        query.revieweeId = userId;
      } else {
        query.$or = [{ reviewerId: userId }, { revieweeId: userId }];
      }

      if (reviewType) {
        query.reviewType = reviewType;
      }

      if (ratingNum) {
        query.rating = ratingNum;
      }

      if (status) {
        query.status = status;
      } else if (userRole !== 'admin') {
        query.status = 'completed'; // Non-admins see only completed reviews
      }

      // 查询评价
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const reviews = await Review.find(query)
        .populate('orderId')
        .populate('reviewerId')
        .populate('revieweeId')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }); // 按创建时间降序排序

      const total = await Review.countDocuments(query);

      // 处理匿名评价
      const formattedReviews = reviews.map(review => {
        const reviewData = {
          id: review._id,
          orderId: review.orderId._id,
          orderCreatedAt: review.orderId.createdAt,
          reviewType: review.reviewType,
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          reply: review.reply,
          reviewer: review.isAnonymous ? { id: null, username: '匿名用户' } : { id: review.reviewerId._id, username: review.reviewerId.username },
          reviewee: { id: review.revieweeId._id, username: review.revieweeId.username },
        };
        return reviewData;
      });

      // 返回结果
      return res.status(200).json({
        code: 200,
        data: {
          success: true,
          reviews: formattedReviews,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        message: '查询用户评价列表成功',
      });
    } catch (error) {
      console.error('查询用户评价列表失败:', error);
      return res.status(500).json({
        code: 500,
        data: { success: false },
        message: '服务器错误',
      });
    }
}

// 查看订单评价
export const getReview = async(req, res) => {
  try {
    // 输入验证
    const { orderId } = req.params;
    const { page = 1, limit = 10 } = req.query; // 分页参数，默认每页10条
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的订单ID',
      });
    }

    // 查询订单
    const order = await Order.findById(orderId)
      .populate('passengerId', 'username role')
      .populate('tripId', 'driverId startLocation endLocation startTime');
    if (!order) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '订单不存在',
      });
    }

    if (!(await checkOrderPermission(req, order))) {
      return res.status(203).json({ code: 403, message: '无权查看此订单的评价' });
    }


    // 查询订单的评价
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ orderId })
      .populate('reviewerId', 'username')
      .populate('revieweeId', 'username')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // 按创建时间降序排序

    const total = await Review.countDocuments({ orderId });


    // 处理匿名评价
    const formattedReviews = reviews.map(review => {
      const reviewData = {
        id: review._id,
        orderId: review.orderId,
        reviewType: review.reviewType,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        reply: review.reply,
        reviewer: review.isAnonymous ? { id: null, username: '匿名用户' } : { id: review.reviewerId._id, username: review.reviewerId.username },
        reviewee: { id: review.revieweeId._id, username: review.revieweeId.username },
      };
      return reviewData;
    });

    // 记录日志


    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        reviews: formattedReviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      message: '查询订单评价成功',
    });

  } catch (error) {
    console.error('查询订单评价失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
}

/** 管理员 */

// 查看所有评价概览
// 查询 一个月内的评价 1天的评价等，前端可以传递时间
// 按 reviewType 分组，计算每组的评价数量、平均评分和评分分布（1-5 星）
// 格式化按 reviewType 的统计结果，确保即使某种类型没有数据也能返回默认值（count: 0 等）。
// 评分分布以对象形式返回（star1 到 star5），表示每个评分的数量。
// 平均评分保留两位小数（toFixed(2)）。
export const getAdminOverview = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '无权访问，仅管理员可查看',
      });
    }

    // 时间范围筛选参数
    const { startDate, endDate } = req.query;
    const query = {};

    // 验证时间范围
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '无效的开始日期',
          });
        }
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            code: 400,
            data: { success: false },
            message: '无效的结束日期',
          });
        }
        query.createdAt.$lte = end;
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
          code: 400,
          data: { success: false },
          message: '开始日期不能晚于结束日期',
        });
      }
    }

    // 统计总评价数
    const totalReviews = await Review.countDocuments(query);

    // 统计总体平均评分
    const overallAvgRating = totalReviews
      ? (await Review.aggregate([
          { $match: query },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]))[0]?.avgRating || 0
      : 0;

    // 按 reviewType 统计
    const typeStats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$reviewType',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
      {
        $project: {
          count: 1,
          avgRating: 1,
          ratingDistribution: {
            $arrayToObject: {
              $map: {
                input: [1, 2, 3, 4, 5],
                as: 'star',
                in: [
                  `star${this.star}`,
                  {
                    $size: {
                      $filter: {
                        input: '$ratingDistribution',
                        as: 'rating',
                        cond: { $eq: ['$$rating', this.star] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    // 格式化按 reviewType 的统计结果
    const formattedTypeStats = {
      passenger_to_driver: { count: 0, avgRating: 0, ratingDistribution: { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 } },
      driver_to_passenger: { count: 0, avgRating: 0, ratingDistribution: { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 } },
    };

    typeStats.forEach(stat => {
      const reviewType = stat._id;
      formattedTypeStats[reviewType] = {
        count: stat.count,
        avgRating: stat.avgRating || 0,
        ratingDistribution: {
          star1: stat.ratingDistribution.star1 || 0,
          star2: stat.ratingDistribution.star2 || 0,
          star3: stat.ratingDistribution.star3 || 0,
          star4: stat.ratingDistribution.star4 || 0,
          star5: stat.ratingDistribution.star5 || 0,
        },
      };
    });

    // 记录日志

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        totalReviews,
        overallAvgRating: parseFloat(overallAvgRating.toFixed(2)),  // 总平均分
        typeStats: formattedTypeStats,
      },
      message: '查询所有评价概览成功',
    });
  } catch (error) {
    console.error('查询所有评价概览失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};


// 司机的评价数据统计
export const getDriverStats = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '无权访问，仅管理员可查看',
      });
    }

    // 输入验证
    const { driverId } = req.params;
    if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的司机ID',
      });
    }

    // 查询司机
    const driver = await User.findById(driverId).select('username role');
    if (!driver || driver.role !== 'driver') {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '司机不存在',
      });
    }

    // 时间范围筛选参数
    const { startDate, endDate } = req.query;
    const query = { revieweeId: new mongoose.Types.ObjectId(driverId), reviewType: 'passenger_to_driver' };

    // 验证时间范围
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '无效的开始日期',
          });
        }
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '无效的结束日期',
          });
        }
        query.createdAt.$lte = end;
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '开始日期不能晚于结束日期',
        });
      }
    }

    // 统计评价总数
    const totalReviews = await Review.countDocuments(query);

    // 统计平均评分
    const avgRating = totalReviews
      ? (await Review.aggregate([
          { $match: query },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]))[0]?.avgRating || 0
      : 0;

    // 统计评分分布
    const ratingDistribution = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          rating: '$_id',
          count: 1,
        },
      },
    ]);

    // 格式化评分分布（1-5 星）
    const distribution = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
    ratingDistribution.forEach(item => {
      if (item.rating >= 1 && item.rating <= 5) {
        distribution[`star${Math.round(item.rating)}`] = item.count;
      }
    });

    // 记录日志

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        driverId,
        driverUsername: driver.username,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(2)),
        ratingDistribution: distribution,
      },
      message: '查询司机评价统计成功',
    });
  } catch (error) {
    console.error('查询司机评价统计失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};


// 乘客的评价数据统计
export const getPassengerStats = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({
        code: 403,
        data: { success: false },
        message: '无权访问，仅管理员可查看',
      });
    }

    // 输入验证
    const { passengerId } = req.params;
    if (!passengerId || !mongoose.Types.ObjectId.isValid(passengerId)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的乘客ID',
      });
    }

    // 查询乘客
    const passenger = await User.findById(passengerId).select('username role');
    if (!passenger || passenger.role !== 'passenger') {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '乘客不存在',
      });
    }

    // 时间范围筛选参数
    const { startDate, endDate } = req.query;
    const query = { revieweeId: new mongoose.Types.ObjectId(passengerId), reviewType: 'driver_to_passenger' };

    // 验证时间范围
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '无效的开始日期',
          });
        }
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(200).json({
            code: 400,
            data: { success: false },
            message: '无效的结束日期',
          });
        }
        query.createdAt.$lte = end;
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '开始日期不能晚于结束日期',
        });
      }
    }

    // 统计评价总数
    const totalReviews = await Review.countDocuments(query);

    // 统计平均评分
    const avgRating = totalReviews
      ? (await Review.aggregate([
          { $match: query },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]))[0]?.avgRating || 0
      : 0;

    // 统计评分分布
    const ratingDistribution = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          rating: '$_id',
          count: 1,
        },
      },
    ]);

    // 格式化评分分布（1-5 星）
    const distribution = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
    ratingDistribution.forEach(item => {
      if (item.rating >= 1 && item.rating <= 5) {
        distribution[`star${Math.round(item.rating)}`] = item.count;
      }
    });

    // 记录日志

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        passengerId,
        passengerUsername: passenger.username,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(2)),
        ratingDistribution: distribution,
      },
      message: '查询乘客评价统计成功',
    });
  } catch (error) {
    console.error('查询乘客评价统计失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};

// 
export const getOrderStats = async (req, res) => {
  try {
    // 权限验证
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(203).json({
        code: 403,
        data: { success: false },
        message: '无权访问，仅管理员可查看',
      });
    }

    // 输入验证
    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(200).json({
        code: 400,
        data: { success: false },
        message: '无效的订单ID',
      });
    }

    // 查询订单
    const order = await Order.findById(orderId).select('createdAt');
    if (!order) {
      return res.status(204).json({
        code: 404,
        data: { success: false },
        message: '订单不存在',
      });
    }

    // 时间范围筛选参数
    const { startDate, endDate } = req.query;
    const query = { orderId: new mongoose.Types.ObjectId(orderId) };

    // 验证时间范围
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            code: 400,
            data: { success: false },
            message: '无效的开始日期',
          });
        }
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            code: 400,
            data: { success: false },
            message: '无效的结束日期',
          });
        }
        query.createdAt.$lte = end;
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(200).json({
          code: 400,
          data: { success: false },
          message: '开始日期不能晚于结束日期',
        });
      }
    }

    // 统计评价总数
    const totalReviews = await Review.countDocuments(query);

    // 统计平均评分
    const avgRating = totalReviews
      ? (await Review.aggregate([
          { $match: query },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]))[0]?.avgRating || 0
      : 0;

    // 记录日志

    // 返回结果
    return res.status(200).json({
      code: 200,
      data: {
        success: true,
        orderId,
        orderCreatedAt: order.createdAt,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(2)),
      },
      message: '查询订单评价统计成功',
    });
  } catch (error) {
    console.error('查询订单评价统计失败:', error);
    return res.status(500).json({
      code: 500,
      data: { success: false },
      message: '服务器错误',
    });
  }
};



