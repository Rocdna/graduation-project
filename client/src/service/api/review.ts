import { request } from '../request';

/**
 * 获取订单的评价详情
 * @param orderId 订单ID
 * @returns 评价详情
 */
export function fetchReviewById(orderId: string) {
    return request({
      url: `/reviews/orders/${orderId}`,
      method: 'get'
    });
}

/**
 * 获取用户的评价列表
 * @param userId 用户ID
 * @param params 查询参数
 * @returns 评价列表
 */
export function fetchUserReviews(userId: string, params?: {
    rating?: number;       // 按评分筛选
    type?: 'reviewer' | 'reviewee';
    reviewType?: 'passenger_to_driver' | 'driver_to_passenger';
    status?: 'pending' | 'under_review' | 'completed' | 'rejected';
    page?: number;         // 页码
    pageSize?: number;     // 每页数量
    sortBy?: 'rating' | 'createdAt'; // 排序字段
    sortOrder?: 'asc' | 'desc';      // 排序顺序
  }) {
    return request({
      url: `/reviews/users/${userId}`,
      method: 'get',
      params
    });
}