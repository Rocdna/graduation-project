import { request } from '../request';

/**
 * 获取所有订单（支持分页和筛选）
 * @param params 查询参数
 * @returns 订单列表和分页信息
 */
export function fetchGetAllOrders(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}){
  return request({
    url: '/admin/orders',
    method: 'get',
    params
  });
}

/**
 * 获取订单详情
 * @param id 订单 ID
 * @returns 订单详情
 */
export function fetchGetOrderDetails(id: string) {
  return request({
    url: `/admin/orders/${id}`,
    method: 'get'
  });
}


/**
 * 更新订单状态
 * @param id 订单 ID
 * @param data 状态和取消原因
 * @returns 更新后的订单
 */
export function fetchUpdateOrderStatus(id: string, data: {
  status: 'pending' | 'matched' | 'confirmed' | 'cancelled' | 'completed';
  cancelReason?: string;
}){
  return request({
    url: `/admin/orders/${id}/status`,
    method: 'patch',
    params: data
  });
}

/**
 * 创建订单（乘客专用）
 * @param data 订单数据
 * @returns 创建后的订单
 */
export function fetchCreateOrder(data: {
  startAddress: string;
  endAddress: string;
  startLocation: [number, number];
  endLocation: [number, number];
  estimatedTime: number;
  startTime: string;
  seatCount: number;
  totalPrice: number;
  distance: number;
}) {
  return request({
    url: '/orders',
    method: 'post',
    data
  });
}

/**
 * 司机接受订单（司机或管理员）
 * @param id 订单 ID
 * @param data 订单匹配数据
 * @returns 更新后的订单和行程
 */
export function fetchAcceptOrder(id: string, data: {
  status: 'matched';
  startLocation: [number, number];
  endLocation: [number, number];
  startAddress: string;
  endAddress: string;
  estimatedTime: number;
  price: number;
  seats: number;
  distance: number;
}) {
  return request({
    url: `orders/${id}/match`,
    method: 'patch',
    data
  });
}

/**
 * 确认订单（司机或管理员）
 * @param id 订单 ID
 * @param data 确认状态
 * @returns 更新后的订单和行程
 */
export function fetchConfirmOrder(id: string, data: { status: 'confirmed' }) {
  return request({
    url: `/orders/${id}/confirm`,
    method: 'patch',
    data
  });
}

/**
 * 完成订单（司机或管理员）
 * @param id 订单 ID
 * @param data 完成状态
 * @returns 更新后的订单和行程
 */
export function fetchCompleteOrder(id: string, data: { status: 'completed' }) {
  return request({
    url: `/orders/${id}/complete`,
    method: 'patch',
    data
  });
}

/**
 * 取消订单（乘客或管理员）
 * @param id 订单 ID
 * @param data 取消状态和原因
 * @returns 更新后的订单和行程
 */
export function fetchCancelOrder(id: string, data: { status: 'cancelled'; reason?: string }) {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'delete',
    data
  });
}


/**
 * 给订单评价
 * @param id 订单 ID
 * @param data 评价信息
 * @returns 订单评价信息
 */
export function fetchReviewOrder(id: string, data: { rating: number; comment: string, isAnonymous: boolean }) {
  return request({
    url: `/orders/${id}/rate`,
    method: 'post',
    data
  });
}

/**
 * 支付费用
 * @param id 订单 ID
 * @param data 订单状态信息
 * @returns 订单支付信息
 */
export function fetchPayOrder(id: string, data: { status: 'paid' }) {
  return request({
    url: `/orders/${id}/payment`,
    method: 'patch',
    data
  });
}


/**
 * 获取司机可接单列表（司机专用）
 * @returns 可接单订单列表
 */
export function fetchAvailableOrders() {
  return request({
    url: '/orders/available',
    method: 'get'
  });
}

/**
 * 获取司机任务列表（司机专用）
 * @returns 已接受订单和可接受订单的列表
 */
export function fetchDriverTasks() {
  return request({
    url: '/orders/driverTasks',
    method: 'get'
  });
}

/**
 * 获取乘客当前运行订单（乘客专用）
 * @returns 已发布，未结束订单
 */
export function fetchPassengerOrder() {
  return request({
    url: '/orders/passengerOrder',
    method: 'get'
  });
}

/**
 * 获取订单详情
 * @param id 订单ID
 * @returns 订单详细信息
 */
export function fetchOrderById(id: string) {
  return request({
    url: `/orders/${id}`,
    method: 'get',
  });
}

/**
 * 获取用户订单列表（支持分页和筛选）
 * @param userId 用户ID
 * @param params 查询参数
 * @returns 用户的订单列表和分页信息
 */
export function fetchUserOrders(userId: string, params: {
  page?: number;
  pageSize?: number;
  status?: string; // 订单状态：pending, matched, confirmed, cancelled, completed
}) {
  return request({
    url: `/orders/users/${userId}`,
    method: 'get',
    params,
  });
}


