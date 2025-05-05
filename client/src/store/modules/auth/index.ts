import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { SetupStoreId } from '@/enum';
import { useRouterPush } from '@/hooks/common/router';
import { fetchGetUserInfo, fetchLogin, fetchRegister, fetchVerifyCode, fetchBgEffectSettings ,fetchResetPassword, fetchUpdateProfile, fetchUpdateDriverStatus, fetchUploadAvatar, fetchUpdateNotificationSettings } from '@/service/api';
import { localStg } from '@/utils/storage';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();

  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());

  // 默认游客
  const userInfo: Api.Auth.UserInfo = reactive({
    _id: '',
    username: 'visitor',
    role: 'visitor',
    bgEffect: true,
    phone: '',
    profile: {},
    notificationSettings: {}
  });

  /** 在静态路由中，是超级管理员权限 */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static';
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    const authStore = useAuthStore();
    clearAuthStorage();
    authStore.$reset();
    if (!route.meta.constant) {
      await toLogin();
    }
    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param role Role
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(userName: string, password: string, role: string, rememberMe: boolean, redirect = false) {
    startLoading();

    const { data: loginToken, error } = await fetchLogin(userName, password, role);
    if (!error) {
      const pass = await loginByToken(loginToken);
      if (pass) {
        await redirectFromLogin(redirect);
        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          message: $t('page.login.common.welcomeBack', { userName: userInfo.username }),
          duration: 4500,
          position: role == 'admin' ? 'top-right' : 'top-left'
        });
      }
    } else {
      resetStore();
    }
    endLoading();
  }
  /**
   * 验证码登录
   *
   * @param phoneNumber Phone number (e.g., +8612345678900)
   * @param code Verification code
   * @param [redirect=true] Whether to redirect after login. Default is `true`
  */
  async function loginByCode(phoneNumber: string, code: string, redirect = true) {
    startLoading();
    const { data: loginToken, error } = await fetchVerifyCode(phoneNumber, code);
    if (!error && loginToken) {
      const pass = await loginByToken(loginToken);
      if (pass) {
        await redirectFromLogin(redirect);
        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          message: $t('page.login.common.welcomeBack', { userName: userInfo.username }),
          duration: 4500,
          position: 'top-left'
        });
      }
    } else {
      resetStore();
    }
    endLoading();
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. 存储在 localStorage, the later requests need it in headers
    localStg.set('token', loginToken.token);
    localStg.set('refreshToken', loginToken.refreshToken);
    // 2. 获取用户信息
    const pass = await getUserInfo();
    if (pass) {
      token.value = loginToken.token;
      return true;
    }
    return false;
  }



  async function getUserInfo() {
    const { data: user, error } = await fetchGetUserInfo();
    if (!error) {
      localStg.set('role', user.role);
      localStg.set('bgEffect', user.bgEffect as boolean);
      // update store
      Object.assign(userInfo, user);

      return true;
    }
    return false;
  }

  // 初始化用户信息
  async function initUserInfo() {
    const hasToken = getToken();
    if (hasToken) {
      const pass = await getUserInfo();
      if (!pass) {
        resetStore();
      }
    }
  }

   /**
   * 注册
   *
   * @param userName Username
   * @param phone Phone number
   * @param password Password
   * @param role Role
   */
   async function register(userName: string, phone: string, password: string, role: string, code: string) {
    startLoading();
    const { data, error } = await fetchRegister(userName, phone, password, role, code);
    if (!error) {
      window.$message?.success($t("page.login.register.success"));
      await toLogin();
      endLoading();
    }
  }
  /**
   * 重置密码
   *
   * @param phone Phone number
   * @param role Role
   * @param password New password
   */
  async function resetPassword(phone: string, password: string, role: string) {
    startLoading();
    const { data, error } = await fetchResetPassword(phone, password, role);
    if (!error) {
      window.$message?.success($t('page.login.resetPwd.success'));
      await toLogin();
      endLoading();
    }
  }


  /**
   * 更新司机状态
   * 
   * @param status offline | online
   * 
   */
  async function updateDriverStatus(status: string) {
    const { data, error } = await fetchUpdateDriverStatus(status);
    if (!error) {
      if (data.status == 'online')
        window.$message?.success('您已上线');
      else 
        window.$message?.success('您已下线');
      userInfo.profile = { ...userInfo.profile, status: data.status };
    }
  }

  /**
   * 上传头像
   * @param avatar Avatar file
   * 
   */
  async function uploadAvatar(avatar: File) {
    const { data, error } = await fetchUploadAvatar(avatar);
    if (!error) {
      window.$message?.success('头像上传成功!');
      userInfo.profile = { ...userInfo.profile, avatar: data.avatar };
    }
  }

  /**
   * 更新通知设置
   * @param settings
   */
  async function updateNotificationSettings(settings: {
    orderNotifications?: boolean;
    paymentNotifications?: boolean;
    reviewNotifications?: boolean;
    systemNotifications?: boolean;
  }) {
    const { data, error } = await fetchUpdateNotificationSettings(settings);
    if (!error) {
      window.$message?.success('通知设置成功!');
      userInfo.notificationSettings = { ...data.notificationSettings };
    }
  }

  /**
   * 更新用户个人信息
   * @param
   */
  async function updateProfile(profile: Api.Auth.UserProfile) {
    if (!userInfo?.profile) {
      throw new Error('用户信息未初始化');
    }
    const { data, error } = await fetchUpdateProfile(profile);
    if (!error) {
      window.$message?.success('保存成功!');
      userInfo.profile = { ...data.profile };
    }
  }

  /**
   * 更新全屏特效设置
   * 
   * @param settings
   */
  async function updateBgEffectSettings(flag: boolean) {
    const { data, error } = await fetchBgEffectSettings(flag);
    if (!error) {
      window.$message?.success('设置成功!');
      userInfo.bgEffect = data.bgEffect;
    }
  }


  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo,
    register,
    resetPassword,
    updateDriverStatus,
    uploadAvatar,
    updateNotificationSettings,
    updateProfile,
    updateBgEffectSettings,
    loginByCode
  };
});
