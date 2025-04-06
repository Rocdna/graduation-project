import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

export const request = createFlatRequest<App.Service.Response, RequestInstanceState>(
  {
    baseURL,
    headers: {
      apifoxToken: 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2'
    }
  },
  {
    async onRequest(config) {
      const Authorization = getAuthorization();
      Object.assign(config.headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // 当后端返回的 code 为 "200"(默认) 时，表示请求成功
      // 如果需要修改这个逻辑，可以在 `.env` 文件中修改 `VITE_SERVICE_SUCCESS_CODE`
      return String(response.data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
    },
    async onBackendFail(response, instance) {
      const authStore = useAuthStore();
      const responseCode = String(response.data.code);

      function handleLogout() {
        authStore.resetStore();
      }

      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);
        request.state.errMsgStack = request.state.errMsgStack.filter(msg => msg !== response.data.message);
      }

      // 当后端返回的 code 在 `logoutCodes` 中时，表示用户需要退出登录
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        return null;
      }

      // 当后端返回的 code 在 `modalLogoutCodes` 中时，表示用户需要退出登录，通过弹窗形式提醒
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(responseCode) && !request.state.errMsgStack?.includes(response.data.message)) {
        request.state.errMsgStack = [...(request.state.errMsgStack || []), response.data.message];

        // 防止用户刷新页面
        window.addEventListener('beforeunload', handleLogout);

        window.$messageBox
          ?.confirm(response.data.message, $t('common.error'), {
            confirmButtonText: $t('common.confirm'),
            cancelButtonText: $t('common.cancel'),
            type: 'error',
            closeOnClickModal: false,
            closeOnPressEscape: false
          })
          .then(() => {
            logoutAndCleanup();
          });
        // window.$dialog?.error({
        //   title: $t('common.error'),
        //   content: response.data.msg,
        //   positiveText: $t('common.confirm'),
        //   maskClosable: false,
        //   closeOnEsc: false,
        //   onPositiveClick() {
        //     logoutAndCleanup();
        //   },
        //   onClose() {
        //     logoutAndCleanup();
        //   }
        // });

        return null;
      }

      // 当后端返回的 code 在 `expiredTokenCodes` 中时，表示 token 过期，需要刷新 token
      // `refreshToken` 接口不能返回 `expiredTokenCodes` 中的错误码，否则会死循环，应该返回 `logoutCodes` 或 `modalLogoutCodes`
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });

          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }

      return null;
    },
    transformBackendResponse(response) {
      return response.data.data;
    },
    onError(error) {
      // 当请求失败时，可以在这里处理显示错误信息的逻辑

      let message = error.message;
      let backendErrorCode = '';
      // 获取后端返回的错误信息和错误码
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
        backendErrorCode = String(error.response?.data?.code || '');
      }

      // 错误信息通过弹窗形式显示
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(backendErrorCode)) {
        return;
      }

      // 当 token 过期时，刷新 token 并重试请求，所以不需要显示错误信息
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(backendErrorCode)) {
        return;
      }

      showErrorMsg(request.state, message);
    }
  }
);

export const demoRequest = createRequest<App.Service.DemoResponse>(
  {
    baseURL: otherBaseURL.demo
  },
  {
    async onRequest(config) {
      const { headers } = config;

      // set token
      const token = localStg.get('token');
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code is "200", it means the request is success
      // you can change this logic by yourself
      return response.data.status === '200';
    },
    async onBackendFail(_response) {
      // when the backend response code is not "200", it means the request is fail
      // for example: the token is expired, refresh token and retry request
    },
    transformBackendResponse(response) {
      return response.data.result;
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;

      // show backend error message
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    }
  }
);
