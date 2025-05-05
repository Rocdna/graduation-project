import { computed, ref } from 'vue';
import { useCountDown, useLoading } from '@sa/hooks';
import { $t } from '@/locales';
import { REG_PHONE } from '@/constants/reg';
import { fetchSendVerification } from '@/service/api';
export function useCaptcha() {
  const { loading, startLoading, endLoading } = useLoading();
  const { count, start, stop, isCounting } = useCountDown(60);

  const label = computed(() => {
    let text = $t('page.login.codeLogin.getCode');
    const countingLabel = $t('page.login.codeLogin.reGetCode', { time: count.value });
    if (loading.value) {
      text = '';
    }
    if (isCounting.value) {
      text = countingLabel;
    }
    return text;
  });

  function isPhoneValid(phone: string) {
    if (phone.trim() === '') {
      window.$message?.error?.($t('form.phone.required'));
      return false;
    }
    if (!REG_PHONE.test(phone)) {
      window.$message?.error?.($t('form.phone.invalid'));
      return false;
    }
    return true;
  }

  async function getCaptcha(phone: string) {
    const valid = isPhoneValid(phone);
    if (!valid || loading.value) {
      return;
    }
    startLoading();
    try {
      const { data, error } = await fetchSendVerification(phone);
      if (!error) {
        window.$message?.success?.('验证码请求发送成功');
        start();
      }
    } catch (error) {
      window.$message?.error?.('验证码请求发送失败');
    } finally {
      endLoading();
    }
  }

  return {
    label,
    start,
    stop,
    isCounting,
    loading,
    getCaptcha,
    
  };
}
