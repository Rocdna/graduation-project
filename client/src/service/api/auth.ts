import { request } from '../request';

/**
 * 登录
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(userName: string, password: string, role: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password,
      role
    }
  });
}

/** 获取用户信息 */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/auth/getUserInfo' });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * 用户注册
 *
 * @param userName User name
 * @param phone Phone number
 * @param password Password
 * @param role Role
 */
export function fetchRegister(userName: string, phone: string, password: string, role: string, code: string) {
  return request({
    url: '/auth/register',
    method: 'post',
    data: {
      userName,
      phone,
      password,
      role,
      code
    }
  });
}

/**
 * Reset password
 *
 * @param phone Phone number
 * @param password New password
 * @param role Role
 */
export function fetchResetPassword(phone: string, password: string, role: string) {
  return request({
    url: '/auth/resetPassword',
    method: 'post',
    data: {
      phone,
      password,
      role
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}

/**
 * 发送短信验证码
 *
 * @param phoneNumber Phone number (e.g., +8612345678900)
 */
export function fetchSendVerification(phoneNumber: string) {
  return request({
    url: '/auth/sendVerification',
    method: 'post',
    data: {
      phoneNumber: "+86" + phoneNumber
    }
  });
}

/**
 * 验证短信验证码
 *
 * @param phoneNumber Phone number (e.g., +8612345678900)
 * @param code Verification code
 */
export function fetchVerifyCode(phoneNumber: string, code: string) {
  return request({
    url: '/auth/verifyCode',
    method: 'post',
    data: {
      phoneNumber: "+86" + phoneNumber,
      code
    }
  });
}

