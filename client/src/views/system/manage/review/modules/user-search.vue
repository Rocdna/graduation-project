<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';
import { useForm } from '@/hooks/common/form';
import { reviewStatusRecordOptions, reviewTypeRecordOptions } from '@/constants/business';
import { translateOptions } from '@/utils/common';

defineOptions({ name: 'UserSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useForm();

const model = defineModel<Api.SystemManage.ReviewParams>('model', { required: true });

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <ElCard class="card-wrapper">
    <ElCollapse>
      <ElCollapseItem :title="$t('common.search')" name="user-search">
        <ElForm ref="formRef" :model="model" label-position="right" :label-width="80">
          <ElRow :gutter="24">
            <ElCol :lg="6" :md="8" :sm="12" :label="$t('page.manage.review.reviewType')">
              <ElFormItem :label="$t('page.manage.review.reviewType')" prop="reviewType">
                <ElSelect v-model="model.reviewType" clearable :placeholder="$t('page.manage.review.reviewType')">
                  <ElOption
                    v-for="{ label, value } in translateOptions(reviewTypeRecordOptions)"
                    :key="value"
                    :label="label"
                    :value="value"
                  ></ElOption>
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.review.rating')" prop="rating">
                <ElInput v-model="model.rating" :placeholder="$t('page.manage.review.rating')" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.review.revieweeId')" prop="revieweeId">
                <ElInput v-model="model.revieweeId" :placeholder="$t('page.manage.review.revieweeId')" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.review.reviewerId')" prop="reviewerId">
                <ElInput v-model="model.reviewerId" :placeholder="$t('page.manage.review.reviewerId')"/>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem :label="$t('page.manage.review.status.title')" prop="status">
                <ElSelect v-model="model.status" clearable :placeholder="$t('page.manage.review.status.title')">
                  <ElOption
                    v-for="{ label, value } in translateOptions(reviewStatusRecordOptions)"
                    :key="value"
                    :label="label"
                    :value="value"
                  ></ElOption>
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="12" :md="24" :sm="24">
              <ElSpace class="w-full justify-end" alignment="end">
                <ElButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </ElButton>
                <ElButton type="primary" plain @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </ElButton>
              </ElSpace>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<style scoped></style>
