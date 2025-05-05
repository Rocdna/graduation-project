import { request } from '../request';


/**
 * 上传用户头像
 *
 * @param avatar 用户头像文件
 * @returns Promise 返回上传结果
 */
export function fetchUploadAvatar(avatar: File) {
  const formData = new FormData();
  formData.append('avatar', avatar);
  return request({
    url: '/users/avatar',
    method: 'post',
    data: formData,
  });
}

/**
 * 更新个人信息
 *
 * @param profile 用户个人信息对象（部分字段可选）
 * @param profile.name 姓名（可选）
 * @param profile.idNumber 身份证号（可选）
 * @param profile.birthDate 出生日期（可选，格式如 "YYYY-MM-DD"）
 * @param profile.gender 性别（可选，如 "male" 或 "female"）
 * @param profile.licensePlate 车牌号（可选）
 * @param profile.vehicleModel 车型（可选）
 * @param profile.defaultPaymentMethod 默认支付方式（可选）
 * @returns Promise 返回更新结果
 */
export function fetchUpdateProfile(profile: {
  name?: string;
  idNumber?: string;
  birthDate?: string | Date;
  gender?: string;
  licensePlate?: string;
  vehicleModel?: string;
  defaultPaymentMethod?: string;
}) {
  return request({
    url: '/users/profile',
    method: 'patch',
    data: profile,
  });
}

/**
 * 更新司机状态
 *
 * @param status 司机状态（如 "online", "offline"）
 */
export function fetchUpdateDriverStatus(status: string) {
  return request({
    url: '/users/status',
    method: 'patch',
    data: { status },
  });
}

/**
 * 用户通知设置
 * 
 * @param settings 通知设置对象（部分字段可选）
 */
export function fetchUpdateNotificationSettings(settings: {
  orderNotifications?: boolean;
  paymentNotifications?: boolean;
  reviewNotifications?: boolean;
  systemNotifications?: boolean;
}) {
  return request({
    url: '/notifications/settings',
    method: 'patch',
    data: settings,
  });
}


/**
 * 全屏特效设置
 * 
 * @param flag 是否使用全屏特效
 */
export function fetchBgEffectSettings(flag: boolean) {
  return request({
    url: '/users/bgEffectSetting',
    method: 'patch',
    data: { flag },
  })
}




