<script setup lang="ts">
import { computed, ref } from "vue";
import { $t } from "@/locales";
import { useRouterPush } from "@/hooks/common/router";
import { useForm, useFormRules } from "@/hooks/common/form";
import { useCaptcha } from "@/hooks/business/captcha";
import { useAuthStore } from "@/store/modules/auth";
import { fetchVerifyCode } from "@/service/api";

defineOptions({ name: "Register" });

const authStore = useAuthStore();

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useForm();
const { label, isCounting, loading, getCaptcha } = useCaptcha();

interface FormModel {
  userName: string;
  phone: string;
  code: string;
  password: string;
  confirmPassword: string;
  role: any;
}

const model = ref<FormModel>({
  userName: "",
  phone: "",
  code: "",
  password: "",
  confirmPassword: "",
  role: "",
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();
  return {
    userName: formRules.userName,
    phone: formRules.phone,
    code: formRules.code,
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.value.password),
    role: [{ required: true, message: "请选择角色", trigger: "change" }], // 添加 role 的验证规则
  };
});

async function handleSubmit() {
  await validate();
  // 获取用户输入的验证码
  const inputCaptcha = model.value.code;
  if (!inputCaptcha) {
    window.$message?.error?.('验证码不能为空');
    return;
  }
  // 注册逻辑，发送请求到服务器
  await authStore.register(model.value.userName, model.value.phone, model.value.password, model.value.role, inputCaptcha)
}



</script>

<template>
  <ElForm
    ref="formRef"
    :model="model"
    :rules="rules"
    size="large"
    :show-label="false"
    @keyup.enter="handleSubmit"
  >
    <ElFormItem prop="userName">
      <ElInput
        v-model="model.userName"
        :placeholder="$t('page.login.common.userNamePlaceholder')"
      />
    </ElFormItem>
    <ElFormItem prop="phone">
      <ElInput
        v-model="model.phone"
        :placeholder="$t('page.login.common.phonePlaceholder')"
      />
    </ElFormItem>
    <ElFormItem prop="code">
      <div class="w-full flex-y-center gap-16px">
        <ElInput
          v-model="model.code"
          :placeholder="$t('page.login.common.codePlaceholder')"
        />
        <ElButton
          size="large"
          :disabled="isCounting"
          :loading="loading"
          @click="getCaptcha(model.phone)"
        >
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

    <ElSpace direction="vertical" :size="18" fill class="w-full">
      <ElButton type="primary" size="large" round block @click="handleSubmit">
        {{ $t("common.confirm") }}
      </ElButton>
      <ElButton size="large" round @click="toggleLoginModule('pwd-login')">
        {{ $t("page.login.common.back") }}
      </ElButton>
    </ElSpace>
  </ElForm>
</template>

<style scoped>
</style>
