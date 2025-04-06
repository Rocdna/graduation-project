<script setup lang="tsx">
import { fetchReviewsList, fetchDeleteReview } from '@/service/api';
import { $t } from '@/locales';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { reviewTypeRecord, reviewStatusRecord } from '@/constants/business';
import { useTable, useTableOperate } from '@/hooks/common/table';
import ReviewOperateDrawer from './modules/user-operate-drawer.vue';
import ReviewSearch from './modules/user-search.vue';
import { formatToLocal } from '@/utils/format';

defineOptions({ name: 'DriverManage' });

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchReviewsList,
  showTotal: true,
  apiParams: {
    current: 1,
    size: 10,
    status: undefined, // 匹配后端字段
    reviewType: undefined,
    reviewerId: undefined,
    revieweeId: undefined,
    rating: undefined,      // 评分
    sortBy: 'createdAt',    // 排序字段
    sortOrder: 'desc',   // 排序顺序
  },
  columns: () => [
    { type: 'selection', width: 48 },
    { prop: 'index', label: $t('common.index'), width: 40 },
    { prop: 'orderId.orderNumber', label: $t('page.manage.review.orderNumber'), minWidth: 100 },
    { prop: 'reviewerId.username', label: $t('page.manage.review.reviewer'), minWidth: 90 },
    { prop: 'revieweeId.username', label: $t('page.manage.review.reviewee'), minWidth: 90 },
    { prop: 'isAnonymous', label: $t('page.manage.review.isAnonymous'), minWidth: 90 },
    {
      prop: 'reviewType',
      label: $t('page.manage.review.reviewType'),
      minWidth: 100,
      formatter: (row) => {
        const type = row.reviewType;
        const tagMap: Record<string, UI.ThemeColor> = {
          passenger_to_driver: 'primary',
          driver_to_passenger: 'success',
        };
        const label = $t(reviewTypeRecord[type] || '-');
        return <ElTag type={tagMap[type] || 'info'}>{label}</ElTag>;
      },
    },
    { prop: 'rating', label: $t('page.manage.review.rating'), minWidth: 50 },
    { prop: 'content', label: $t('page.manage.review.content'), minWidth: 150, showOverflowTooltip: true },
    {
      prop: 'status',
      label: $t('page.manage.review.status.title'),
      minWidth: 80,
      align: 'center',
      formatter: (row) => {
        const status = row.status || 'pending';
        const tagMap: Record<string, UI.ThemeColor> = {
          pending: 'info',
          under_review: 'warning',
          completed: 'success',
          rejected: 'danger',
        };
        const label = $t(reviewStatusRecord[status] || 'page.manage.review.status.pending');
        return <ElTag type={tagMap[status] || 'info'}>{label}</ElTag>;
      },
    },
    {
      prop: 'createdAt',
      label: $t('page.manage.review.createdAt'),
      minWidth: 120,
      formatter: (row) => formatToLocal(row.createdAt),
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 120,
      fixed: 'right',
      formatter: row => (
        <div class="flex-center">
          { (
            <ElButton type="primary" plain size="small" onClick={() => handleEdit(row._id)}>
              {$t('page.manage.review.audit')}
            </ElButton>
          )}
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row._id)}>
            {{
              reference: () => (
                <ElButton type="danger" plain size="small">
                  {$t('common.delete')}
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});


const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);


async function handleDelete(id: string, reason: string) {
  try {
    const { error } = await fetchDeleteReview(id, { reason });
    if (!error) {
      // window.$message?.success($t('page.manage.user.messages.deleteSuccess'));
      onDeleted();
    }
  } catch (error) {
    window.$message?.error($t('page.manage.user.messages.deleteFailed'));
    console.error("删除评价失败:", error);
  }
}

function edit(id: string) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ReviewSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="sm:flex-1 card-wrapper" body-class="ht50">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.user.title') }}</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @refresh="getData"
          />
        </div>
      </template>
      <div class="h-[calc(100%-50px)]">
        <ElTable
          v-loading="loading"
          border
          class="sm:h-full"
          :data="data"
          row-key="id"
          @selection-change="checkedRowKeys = $event"
        >
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col"/>
        </ElTable>
      </div>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
      <ReviewOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
