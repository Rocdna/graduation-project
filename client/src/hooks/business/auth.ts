import { useAuthStore } from '@/store/modules/auth';

export function useAuth() {
  const authStore = useAuthStore();

  function hasAuth(codes: string | string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    if (typeof codes === 'string') {
      return authStore.userInfo.role === codes;
    }

    return codes.some(code => authStore.userInfo.role === code);
  }

  return {
    hasAuth
  };
}
