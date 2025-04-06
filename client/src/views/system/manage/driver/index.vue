<script setup lang="tsx">
import { fetchGetDriverList, fetchDeleteDriver, fetchBatchDeleteDriver } from '@/service/api';
import { $t } from '@/locales';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
import { useTable, useTableOperate } from '@/hooks/common/table';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

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
  apiFn: fetchGetDriverList,
  showTotal: true,
  apiParams: {
    current: 1,
    size: 10,
    username: undefined, // 匹配后端字段
    phone: undefined,
    status: undefined, // profile.status
    gender: undefined, // profile.gender
    ratingMin: undefined, // profile.rating
    ratingMax: undefined
  },
  columns: () => [
    { type: 'selection', width: 48 },
    { prop: 'index', label: $t('common.index'), width: 40 },
    { prop: '_id', label: $t('page.manage.user.id'), width: 60, showOverflowTooltip: true },
    { prop: 'username', label: $t('page.manage.user.nickName'), minWidth: 100 },
    {
      prop: 'profile.gender',
      label: $t('page.manage.user.userGender'),
      minWidth: 50,
      formatter: row => {
        const gender = row.profile?.gender;
        if (!gender) return '';

        const tagMap: Record<string, UI.ThemeColor> = {
          male: 'primary',
          female: 'danger',
          other: 'info'
        };
        const label = $t(userGenderRecord[gender] || 'page.manage.user.gender.other');
        return <ElTag type={tagMap[gender] || 'info'}>{label}</ElTag>;
      }
    },
    { prop: 'profile.name', label: $t('page.manage.user.userName'), minWidth: 90 },
    { prop: 'phone', label: $t('page.manage.user.userPhone'), minWidth: 120 },
    {
      prop: 'profile.status',
      minWidth: 50,
      label: $t('page.manage.user.userStatus'),
      align: 'center',
      formatter: row => {
        const status = row.profile?.status || 'locked';
        const tagMap: Record<string, UI.ThemeColor> = {
          online: 'success',
          offline: 'danger',
          locked: 'warning'
        };
        const label = $t(enableStatusRecord[status] || 'page.manage.user.status.offline');
        return <ElTag type={tagMap[status] || 'info'}>{label}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 120,
      fixed: 'right',
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => edit(row._id)}>
            {$t('common.edit')}
          </ElButton>
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


async function handleBatchDelete() {
  try {
    // window.$message?.success($t('page.manage.user.messages.batchDeleteSuccess'));
    const { data, error } = await fetchBatchDeleteDriver(checkedRowKeys.value);
    if (!error) {
      if (data.failed.length > 0) {
        // 部分失败，显示哪些记录删除失败
        const failedIds = data.failed.map((item: { _id: any; }) => item._id).join(', ');
        window.$message?.warning($t('page.manage.user.messages.batchDeletePartialSuccess', { failedIds }));
      } else {
        // 全部成功
        window.$message?.success($t('page.manage.user.messages.batchDeleteSuccess'));
      }
      onBatchDeleted();
    } else {
      window.$message?.error($t('page.manage.user.messages.batchDeleteFailed'));
    }
  } catch (error) {
    window.$message?.error($t('page.manage.user.messages.batchDeleteFailed'));
    console.error("批量删除失败:", error);
  }
}

async function handleDelete(id: string) {
  try {
    const { error } = await fetchDeleteDriver(id);
    if (!error) {
      // window.$message?.success($t('page.manage.user.messages.deleteSuccess'));
      onDeleted();
    }
  } catch (error) {
    window.$message?.error($t('page.manage.user.messages.deleteFailed'));
    console.error("删除司机失败:", error);
  }
}

function edit(id: string) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <UserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <ElCard class="sm:flex-1 card-wrapper" body-class="ht50">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.user.title') }}</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :is-add="true"
            @add="handleAdd"
            @delete="handleBatchDelete"
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
      <UserOperateDrawer
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
