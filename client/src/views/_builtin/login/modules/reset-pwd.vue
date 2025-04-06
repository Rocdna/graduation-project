<script setup lang="ts">
import { computed, ref } from 'vue';
import { $t } from '@/locales';
import { useRouterPush } from '@/hooks/common/router';
import { useForm, useFormRules } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { useAuthStore } from '@/store/modules/auth';


defineOptions({ name: 'ResetPwd' });

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useForm();
const { label, isCounting, loading, getCaptcha, newCaptcha } = useCaptcha();

const authStore = useAuthStore();

interface FormModel {
  phone: string;
  code: string;
  password: string;
  confirmPassword: string;
  role: any;
}

const model = ref<FormModel>({
  phone: '18000000000',
  code: '',
  password: '111111',
  confirmPassword: '111111',
  role: 'passenger'
});

type RuleRecord = Partial<Record<keyof FormModel, App.Global.FormRule[]>>;

const rules = computed<RuleRecord>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();

  return {
    phone: formRules.phone,
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.value.password)
  };
});

async function handleSubmit() {
  await validate();
  // 获取用户输入的验证码
  const inputCaptcha = model.value.code;
  if (inputCaptcha != newCaptcha.value) {
    window.$message?.error($t("page.login.common.invalidCode"));
    return;
  }

  await authStore.resetPassword(model.value.phone, model.value.password, model.value.role);

  // 重新设置密码
  // window.$message?.success($t('page.login.common.validateSuccess'));
}
</script>

<template>
  <ElForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <ElFormItem prop="phone">
      <ElInput v-model="model.phone" :placeholder="$t('page.login.common.phonePlaceholder')" />
    </ElFormItem>
    <ElFormItem prop="code">
      <div class="w-full flex-y-center gap-16px">
        <ElInput v-model="model.code" :placeholder="$t('page.login.common.codePlaceholder')" />
        <ElButton size="large" :disabled="isCounting" :loading="loading" @click="getCaptcha(model.phone)">
          {{ label }}
        </ElButton>
      </div>
    </ElFormItem>
    <ElFormItem prop="password">
      <ElInput
        v-model="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </ElFormItem>
    <ElFormItem prop="confirmPassword">
      <ElInput
        v-model="model.confirmPassword"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
      />
    </ElFormItem>
    <ElFormItem prop="role">
      <ElRadioGroup v-model="model.role">
        <ElRadioButton value="passenger">{{
          $t("page.login.register.passenger")
        }}</ElRadioButton>
        <ElRadioButton value="driver">{{
          $t("page.login.register.driver")
        }}</ElRadioButton>
      </ElRadioGroup>
    </ElFormItem>
    <ElSpace direction="vertical" fill :size="18" class="w-full">
      <ElButton type="primary" size="large" round @click="handleSubmit">
        {{ $t('common.confirm') }}
      </ElButton>
      <ElButton size="large" round @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </ElButton>
    </ElSpace>
  </ElForm>
</template>

<style scoped></style>
