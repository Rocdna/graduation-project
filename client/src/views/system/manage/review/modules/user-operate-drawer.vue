<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchDeleteReview, fetchAuditReview } from '@/service/api';
import { $t } from '@/locales';
import { reviewAuditRecordOptions } from '@/constants/business';

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

// 审核评价
function createDefaultModel() {
  return {
    reason: '无',
    status: '',
  };
}

// 表单校验规则
const rules = computed(() => ({
  status: [
    { required: true, message: $t('page.manage.review.form.statusRequired'), trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== 'completed' && value !== 'rejected') {
          callback(new Error($t('page.manage.review.form.statusInvalid')));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
  reason: [
    { required: true, message: $t('page.manage.review.form.reasonRequired'), trigger: 'blur' },
    { min: 2, message: $t('page.manage.review.form.reasonMinLength'), trigger: 'blur' },
    { max: 500, message: $t('page.manage.review.form.reasonMaxLength'), trigger: 'blur' },
  ],
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
        if (model.value.status === 'rejected') 
        {
          const api = fetchDeleteReview;
          const { error } = await api(props.rowData?._id as string, { reason: model.value.reason });
          if (!error) {
            emit('submitted');
            closeDrawer();
            window.$message?.success($t('page.manage.review.messages.deleteSuccess'));
          }
        } else {
          const api = fetchAuditReview;
          const { error } = await api({ id: props.rowData?._id as string, status: model.value.status as "completed" | "rejected" });
          if (!error) {
            emit('submitted');
            closeDrawer();
            window.$message?.success($t('page.manage.review.messages.auditSuccess'));
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
      <ElFormItem :label="$t('page.manage.review.status.title')" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio v-for="item in reviewAuditRecordOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem v-if="model.status === 'rejected'" :label="$t('page.manage.review.reason')" prop="reason">
        <ElInput v-model="model.reason" :placeholder="$t('page.manage.review.reason')" show-word-limit maxlength="500" minlength="2" type="textarea"/>
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
