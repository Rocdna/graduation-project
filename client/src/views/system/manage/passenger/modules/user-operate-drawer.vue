<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchAddPassenger, fetchUpdatePassenger } from '@/service/api';
import { $t } from '@/locales';
import { enableStatusOptions, userGenderOptions, defaultPaymentMethodOptions } from '@/constants/business';

defineOptions({ name: 'UserOperateDrawer' });

interface Props {
  /** the type of operation */
  operateType: UI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const formRef = ref();

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

const model = ref(createDefaultModel());

function createDefaultModel() {
  return {
    username: 'rocal',
    phone: '13100000000',
    password: '123123',
    profile: {
      name: '',
      status: 'offline',
      defaultPaymentMethod: '',
      idNumber: '',
      birthDate: '',
      rating: 0,
      gender: '',
      avatar: ''
    }
  };
}

// 表单校验规则
const rules = computed(() => ({
  username: [
    { required: true, message: $t('page.manage.user.form.usernameRequired'), trigger: 'blur' },
    { max: 20, message: $t('page.manage.user.form.usernameLength'), trigger: 'blur' }
  ],
  phone: [
    { required: true, message: $t('page.manage.user.form.phoneRequired'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: $t('page.manage.user.form.phoneInvalid'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: $t('page.manage.user.form.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: $t('page.manage.user.form.passwordLength'), trigger: 'blur' },
  ],
  'profile.name': [
    { min: 2, max: 50, message: $t('page.manage.user.form.nameLength'), trigger: 'blur' }
  ],
  'profile.licensePlate': [
    { pattern: /^[A-Za-z0-9]{5,10}$/, message: $t('page.manage.user.form.licensePlateInvalid'), trigger: 'blur' }
  ],
  'profile.vehicleModel': [
    { max: 50, message: $t('page.manage.user.form.vehicleModelLength'), trigger: 'blur' }
  ],
  'profile.idNumber': [
    {  
      pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, 
      message: $t('page.manage.user.form.idNumberInvalid'), 
      trigger: 'blur' 
    }
  ]
}));

function handleInitModel() {
  model.value = createDefaultModel();
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (props.operateType === 'add') {
          const api = fetchAddPassenger;
          const { error } = await api(model.value);
          if (!error) {
            window.$message?.success($t('page.manage.user.messages.addSuccess'));
            emit('submitted');
            closeDrawer();
          }
        } else {
          const api = fetchUpdatePassenger;
          const { error } = await api(props.rowData?._id as string, model.value);
          if (!error) {
            emit('submitted');
            closeDrawer();
            window.$message?.success($t('page.manage.user.messages.updateSuccess'));
          }
        }
      } catch (error) {
        window.$message?.error($t('page.manage.user.messages.operationFailed'));
        console.error("操作失败:", error);
      }
    }
  });
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    formRef?.value?.resetFields();
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="360">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem :label="$t('page.manage.user.nickName')" prop="username">
        <ElInput v-model="model.username" :placeholder="$t('page.manage.user.form.nickName')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.userPhone')" prop="phone">
        <ElInput v-model="model.phone" :placeholder="$t('page.manage.user.form.userPhone')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.form.password')" prop="password">
        <ElInput v-model="model.password" :placeholder="$t('page.manage.user.form.password')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.userName')" prop="name">
        <ElInput v-model="model.profile.name" :placeholder="$t('page.manage.user.form.userName')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.userStatus')" prop="status">
        <ElRadioGroup v-model="model.profile.status">
          <ElRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.userGender')" prop="gender">
        <ElRadioGroup v-model="model.profile.gender">
          <ElRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.rating')" prop="rating">
        <ElRate v-model="model.profile.rating" allow-half/>
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.form.idNumber')" prop="idNumber">
        <ElInput v-model="model.profile.idNumber" :placeholder="$t('page.manage.user.form.idNumber')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.user.defaultPaymentMethod')" prop="defaultPaymentMethod">
        <ElRadioGroup v-model="model.profile.defaultPaymentMethod">
          <ElRadio v-for="item in defaultPaymentMethodOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16">
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
