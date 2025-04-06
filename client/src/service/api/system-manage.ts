import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}
/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getMenuList/v2',
    method: 'get'
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/systemManage/getAllPages',
    method: 'get'
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}


/**
 * 后台仪表盘今天数据统计
 */
export function fetchGetTodayDashboardStats() {
  return request({
    url: '/admin/dashboardStats',
    method: 'get',
  })
}

/**
 * 后台仪表盘过去7天数据统计
 */
export function fetchGetDashboardStats() {
  return request({
    url: '/admin/dashboardStats/last7Days',
    method: 'get',
  })
}

/**
 * 统计过去任意天的订单相关数据
 * @param startDate 开始日期，格式 YYYY-MM-DD
 * @param endDate 结束日期，格式 YYYY-MM-DD
 * @returns 统计数据
 */
export function fetchGetNOrderStats(startDate: string, endDate: string) {
  return request({
    url: `/admin/dashboardStats/${startDate}/${endDate}`,
    method: 'get'
  });
}


/**
 * 获取全部乘客信息列表
 * @param params 查询参数，包括分页和筛选条件
 * @returns 乘客列表数据
 */
export function fetchGetPassengerList(params: {
  current?: number;
  size?: number;
  username?: string;
  name?: string;
  phone?: string;
  status?: string;
  gender?: string;
  ratingMin?: number;
  ratingMax?: number;
}) {
  return request({
    url: '/admin/passengers',
    method: 'get',
    params // 传递查询参数
  });
}

/**
 * 修改乘客信息
 * @param id 乘客ID
 * @param data 更新的乘客信息
 * @returns 更新后的乘客数据
 */
export function fetchUpdatePassenger(id: string, data: {
  username?: string;
  password?: string;
  phone?: string;
  profile?: {
    name?: string;
    idNumber?: string;
    avatar?: string;
    birthDate?: string;
    gender?: string;
    defaultPaymentMethod?: string;
    status?: string;
  };
  notificationSettings?: {
    orderNotifications?: boolean;
    paymentNotifications?: boolean;
    reviewNotifications?: boolean;
    systemNotifications?: boolean;
  };
}) {
  return request({
    url: `/admin/passengers/${id}`,
    method: 'patch',
    data // 传递更新数据
  });
}

/**
 * 查看某个乘客的订单和评价信息
 * @param id 乘客ID
 * @param params 分页参数
 * @returns 乘客的订单和评价数据
 */
export function fetchGetPassengerDetails(id: string, params: {
  orderCurrent?: number;
  orderSize?: number;
  reviewCurrent?: number;
  reviewSize?: number;
}) {
  return request({
    url: `/admin/passengers/${id}/details`,
    method: 'get',
    params // 传递分页参数
  });
}

/**
 * 添加乘客
 * @param data 乘客信息
 * @returns 添加结果
 */
export function fetchAddPassenger(data: {
  username: string;
  phone: string;
  password: string;
  profile: {
    name?: string;
    gender?: string;
    status?: string;
    idNumber?: string;
    rating?: number;
    defaultPaymentMethod?: string;
  };
}) {
  return request({
    url: '/admin/passenger',
    method: 'post',
    data
  });
}

/**
 * 删除某个乘客
 * @param id 乘客ID
 * @returns 删除结果
 */
export function fetchDeletePassenger(id: string) {
  return request({
    url: `/admin/passengers/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除乘客
 * @param ids 要删除的乘客ID列表
 * @returns 删除结果
 */
export function fetchBatchDeletePassengers(ids: string[]) {
  return request({
    url: '/admin/passengers',
    method: 'delete',
    data: { ids }
  });
}


/**
 * 获取全部司机信息列表
 * @param params 查询参数，包括分页和筛选条件
 * @returns 司机列表数据
 */
export function fetchGetDriverList(params: {
  current?: number;
  size?: number;
  username?: string;
  name?: string;
  phone?: string;
  status?: string;
  gender?: string;
  ratingMin?: number;
  ratingMax?: number;
  licensePlate?: string;
  vehicleModel?: string;
}) {
  return request({
    url: '/admin/drivers',
    method: 'get',
    params // 传递查询参数
  });
}

/**
 * 修改司机信息
 * @param id 司机ID
 * @param data 更新的司机信息
 * @returns 更新后的司机数据
 */
export function fetchUpdateDriver(id: string, data: {
  username?: string;
  phone?: string;
  password?: string;
  profile?: {
    name?: string;
    idNumber?: string;
    avatar?: string;
    birthDate?: string;
    gender?: string;
    licensePlate?: string;
    vehicleModel?: string;
    status?: string;
  };
  notificationSettings?: {
    orderNotifications?: boolean;
    paymentNotifications?: boolean;
    reviewNotifications?: boolean;
    systemNotifications?: boolean;
  };
}) {
  return request({
    url: `/admin/drivers/${id}`,
    method: 'patch',
    data // 传递更新数据
  });
}

/**
 * 查看某个司机的订单和评价信息
 * @param id 司机ID
 * @param params 分页参数
 * @returns 司机的订单和评价数据
 */
export function fetchGetDriverDetails(id: string, params: {
  orderCurrent?: number;
  orderSize?: number;
  reviewCurrent?: number;
  reviewSize?: number;
}) {
  return request({
    url: `/admin/drivers/${id}/details`,
    method: 'get',
    params // 传递分页参数
  });
}


/**
 * 删除某个司机
 * @param id 司机ID
 * @returns 删除结果
 */
export function fetchDeleteDriver(id: string) {
  return request({
    url: `/admin/drivers/${id}`,
    method: 'delete'
  });
}



/**
 * 批量删除司机
 * @param ids 要删除的司机ID列表
 * @returns 删除结果
 */
export function fetchBatchDeleteDriver(ids: string[]) {
  return request({
    url: '/admin/drivers',
    method: 'delete',
    data: { ids }
  });
}



/**
 * 添加司机
 * @param data 司机信息
 * @returns 添加结果
 */
export function fetchAddDriver(data: {
  username: string;
  phone: string;
  password: string;
  profile: {
    name?: string;
    gender?: string;
    status?: string;
    idNumber?: string;
    rating?: number;
    licensePlate?: string;
    vehicleModel?: string;
  };
}) {
  return request({
    url: '/admin/driver',
    method: 'post',
    data
  });
}


/**
 * 获取所有评价列表
 * @param params 查询参数
 * @returns 评价列表数据
 */
export function fetchReviewsList(params: {
  current?: number;
  size?: number;
  isAnonymous?: boolean;
  status?: string; // pending, under_review, completed, rejected
  reviewType?: string; // passenger_to_driver, driver_to_passenger
  reviewerId?: string;
  revieweeId?: string;
  rating?: number; // 1-5
  sortBy?: string; // createdAt, rating
  sortOrder?: 'asc' | 'desc'; // asc, desc
}) {
  return request({
    url: '/admin/reviews',
    method: 'get',
    params,
  });
}

/**
 * 审核评价
 * @param data 审核信息
 * @returns 审核结果
 */
export function fetchAuditReview(data: {
  id: string;
  status: 'completed' | 'rejected';
  reason?: string; // 拒绝时必填
}) {
  return request({
    url: '/admin/reviews/audit',
    method: 'post',
    data,
  });
}


/**
 * 删除评价
 * @param id 评价ID
 * @param data 删除理由
 * @returns 删除结果
 */
export function fetchDeleteReview(id: string, data: {
  reason: string;
}) {
  return request({
    url: `/admin/reviews/${id}`,
    method: 'delete',
    data,
  });
}
