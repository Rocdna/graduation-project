<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { $t } from '@/locales';
import OrderStats from './modules/dataStats.vue'
import { fetchGetAllOrders, fetchUpdateOrderStatus } from '@/service/api';

interface User {
  _id: string;
  username: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'matched' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: string;
  paymentTime?: string;
  startTime: string;
  seatCount: number;
  tripId: string;
  startAddress: string;
  endAddress: string;
  estimatedTime: string;
  passengerId: User;
  driverId: User | null;
  createdAt: string;
  canceledReason?: string;
}

interface FilterForm {
  status: string;
  dateRange: string[];
  orderNumber: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}


// 模拟订单列表数据
const orders = ref<Order[]>([]);

// 筛选条件
const filterForm = ref<FilterForm>({
  status: '',
  dateRange: [],
  orderNumber: ''
});

// 分页
const pagination = ref<Pagination>({
  page: 1,
  limit: 10,
  total: 100
});

// 加载状态
const loading = ref(false);

// 状态映射（用于国际化）
const statusLabels: Record<Order['status'], string> = {
  pending: 'page.manage.order.status.pending',
  matched: 'page.manage.order.status.matched',
  confirmed: 'page.manage.order.status.confirmed',
  cancelled: 'page.manage.order.status.cancelled',
  completed: 'page.manage.order.status.completed'
};

// 颜色映射，确保值符合 ElTag 的 type 类型
const statusColors: Record<Order['status'], 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
  pending: 'info',
  matched: 'primary',
  confirmed: 'warning',
  cancelled: 'danger',
  completed: 'success'
};


// 获取订单列表
async function fetchOrders() {
  try {
    loading.value = true;
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.limit,
      status: filterForm.value.status || undefined,
      startDate: filterForm.value.dateRange[0] ? new Date(filterForm.value.dateRange[0]).toISOString().split('T')[0] : undefined,
      endDate: filterForm.value.dateRange[1] ? new Date(filterForm.value.dateRange[1]).toISOString().split('T')[0] : undefined,
    };
    const { data, error } = await fetchGetAllOrders(params);
    if (error) {
      window.$message?.error('获取订单列表失败');
      return;
    }
    if (data.orders.length !== 0) {
      orders.value = data.orders;
    }
    pagination.value.total = data.total;
    pagination.value.page = data.currentPage;
    pagination.value.limit = data.pageSize;

    if (!orders.value.length) {
      window.$message?.warning($t('page.manage.order.messages.noOrders'));
    }
  } catch (error) {
    window.$message?.error($t('page.manage.order.messages.fetchOrdersFailed'));
  } finally {
    loading.value = false;
  }
}

// 重置筛选条件
function resetFilter() {
  filterForm.value = {
    status: '',
    dateRange: [],
    orderNumber: ''
  };
  fetchOrders();
}

// 页码变化
function handlePageChange(page: number) {
  pagination.value.page = page;
  fetchOrders();
}

// 每页条数变化
function handlePageSizeChange(size: number) {
  pagination.value.limit = size;
  pagination.value.page = 1; // 重置到第一页
  fetchOrders();
}

// 订单详情对话框
const orderDetailsDialogVisible = ref(false);
const orderDetails = ref<Order | null>(null);
const orderDetailsLoading = ref(false);

// 查看订单详情
async function viewOrder(row: Order) {
  try {
    // 先显示模拟数据
    orderDetailsDialogVisible.value = true;
    orderDetailsLoading.value = true;
    orderDetails.value = orders.value.find(order => order._id === row._id) || null;
  } catch (error) {
    window.$message?.error($t('page.manage.order.messages.fetchDetailsFailed'));
    orderDetailsDialogVisible.value = false;
  } finally {
    orderDetailsLoading.value = false;
  }
}

// 订单状态调整对话框
const statusDialogVisible = ref(false);
const selectedOrder = ref<Order | null>(null);
const newStatus = ref<Order['status']>('pending');
const cancelReason = ref('');
const statusLoading = ref(false);

// 状态顺序
const statusOrder: Order['status'][] = ['pending', 'matched', 'confirmed', 'completed'];

// 可选状态（动态计算）
const availableStatuses = computed(() => {
  if (!selectedOrder.value) return [];
  
  const currentStatus = selectedOrder.value.status;
  if (currentStatus === 'cancelled') {
    return []; // 已取消状态不可修改
  }

  const currentIndex = statusOrder.indexOf(currentStatus);
  // 只能选择比当前状态更靠后的状态
  let statuses = statusOrder.slice(currentIndex + 1);

  // 如果当前状态是 pending、matched 或 confirmed，允许选择 cancelled
  if (['pending', 'matched', 'confirmed'].includes(currentStatus)) {
    statuses = [...statuses, 'cancelled'];
  }
  // 映射为 { value, label } 格式
  return statuses.map(status => ({
    value: status,
    label: $t(`page.manage.order.status.${status}`)
  }));
});

// 当前状态的中文显示
const currentStatusLabel = computed(() => {
  if (!selectedOrder.value) return '';
  return $t(`page.manage.order.status.${selectedOrder.value.status}`);
});

// 确认按钮是否禁用
const isConfirmDisabled = computed(() => {
  if (!selectedOrder.value) return true;
  // 禁用条件：状态为 cancelled、没有可选状态、或新状态与当前状态一致
  return (
    selectedOrder.value.status === 'cancelled' ||
    availableStatuses.value.length === 0 ||
    newStatus.value === selectedOrder.value.status
  );
});

// 打开状态调整对话框
function openStatusDialog(row: Order) {
  selectedOrder.value = row;
  newStatus.value = row.status; // 默认选中当前状态
  cancelReason.value = row.canceledReason || ''; // 默认填充取消原因（如果有）
  statusDialogVisible.value = true;
}

// 提交状态更新
async function submitStatusUpdate() {
  if (!selectedOrder.value) return;
  try {
    statusLoading.value = true;
    const info: { status: Order['status']; cancelReason?: string } = {
      status: newStatus.value
    };
    // 文本输入框有值才提交
    if (newStatus.value === 'cancelled') {
      if (!cancelReason.value.trim()) {
        window.$message?.error($t('page.manage.order.messages.cancelReasonRequired'));
        return;
      }
      info.cancelReason = cancelReason.value;
    }

    const { data, error } = await fetchUpdateOrderStatus(selectedOrder.value._id, info);
    if (!error) {
      // // 更新订单列表中的对应订单
      const index = orders.value.findIndex(order => order._id === selectedOrder.value?._id);
      if (index !== -1) {
        orders.value[index].status = data.status;
      }
    }
    window.$message?.success($t('page.manage.order.messages.updateStatusSuccess'));
    statusDialogVisible.value = false;
  } catch (error) {
    window.$message?.error($t('page.manage.order.messages.updateStatusFailed'));
  } finally {
    statusLoading.value = false;
  }
}


onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="order-management">
    <!-- 订单数据统计 -->
    <OrderStats />
    
    <!-- 中间：订单列表 -->
    <ElCard class="mb-4">
      <!-- 筛选条件 -->
      <ElForm :inline="true" :model="filterForm" class="flex flex-wrap gap-4 mb-4 md:flex-row flex-col">
        <ElFormItem :label="$t('page.manage.order.filter.status')" class="md:w-auto w-full">
          <ElSelect v-model="filterForm.status" :placeholder="$t('page.manage.order.filter.status')" clearable @change="fetchOrders" class="w-30">
            <ElOption :label="$t('page.manage.order.filter.statusOptions.pending')" value="pending" />
            <ElOption :label="$t('page.manage.order.filter.statusOptions.matched')" value="matched" />
            <ElOption :label="$t('page.manage.order.filter.statusOptions.confirmed')" value="confirmed" />
            <ElOption :label="$t('page.manage.order.filter.statusOptions.cancelled')" value="cancelled" />
            <ElOption :label="$t('page.manage.order.filter.statusOptions.completed')" value="completed" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('page.manage.order.table.createdAt')" class="md:w-auto w-full">
          <ElDatePicker
            v-model="filterForm.dateRange"
            type="daterange"
            :range-separator="$t('page.manage.order.filter.dateRange')"
            :start-placeholder="$t('page.manage.order.filter.dateStart')"
            :end-placeholder="$t('page.manage.order.filter.dateEnd')"
            @change="fetchOrders"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem :label="$t('page.manage.order.table.orderNumber')" class="md:w-auto w-full">
          <ElInput v-model="filterForm.orderNumber" :placeholder="$t('page.manage.order.table.orderNumber')" clearable @change="fetchOrders" class="w-full"/>
        </ElFormItem>
        <ElFormItem class="md:w-auto w-full">
          <ElButton type="primary" @click="fetchOrders">{{ $t('page.manage.order.filter.filter') }}</ElButton>
          <ElButton @click="resetFilter">{{ $t('page.manage.order.filter.reset') }}</ElButton>
        </ElFormItem>
      </ElForm>

      <!-- 表格 -->
       <div class="overflow-x-auto w-full">
        <ElTable :data="orders" class="min-w-[800px] w-full" v-loading="loading">
          <ElTableColumn prop="orderNumber" :label="$t('page.manage.order.table.orderNumber')" min-width="120"/>
          <ElTableColumn prop="status" :label="$t('page.manage.order.table.status')" min-width="100">
            <template #default="{ row }">
              <ElTag :type="statusColors[row.status as keyof typeof statusLabels]">
                {{ $t(statusLabels[row.status as keyof typeof statusLabels]) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="totalPrice" :label="$t('page.manage.order.table.totalPrice')" min-width="100"/>
          <ElTableColumn prop="passengerId.username" :label="$t('page.manage.order.table.passenger')" min-width="120" class="md:table-cell hidden"/>
          <ElTableColumn prop="driverId.username" :label="$t('page.manage.order.table.driver')" min-width="120" class="md:table-cell hidden"/>
          <ElTableColumn prop="createdAt" :label="$t('page.manage.order.table.createdAt')" min-width="150"/>
          <ElTableColumn :label="$t('page.manage.order.table.actions')" min-width="200">
            <template #default="{ row }">
              <ElButton type="primary" size="small" @click="viewOrder(row)">{{ $t('page.manage.order.table.viewDetails') }}</ElButton>
              <ElButton type="warning" size="small" @click="openStatusDialog(row)">{{ $t('page.manage.order.table.updateStatus') }}</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <!-- 分页 -->
      <ElPagination
        class="mt-4 w-full flex items-center justify-center gap-2 flex-wrap"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
        :class="{
          '[&>.el-pagination__total]:flex': true,
          '[&>.el-pagination__total]:items-center': true,
          '[&>.el-pagination__total]:gap-2': true,
          '[&>.el-pagination__sizes]:ml-0': true,
          '[&>.el-pagination__jump]:ml-0': true,
          '[&>.el-pagination__jump]:mt-2': true,
          '[&>.el-pager]:mt-2': true,
          '[&>.el-pagination__right]:mt-2': true
        }"
      />
    </ElCard>
    
    <!-- 订单详情对话框 -->
    <ElDialog
      :title="$t('page.manage.order.details.title')"
      v-model="orderDetailsDialogVisible"
      width="65%"
      :close-on-click-modal="false"
    >
      <ElDescriptions v-loading="orderDetailsLoading" :column="2" border class="w-full">
        <ElDescriptionsItem :label="$t('page.manage.order.details.orderNumber')">
          {{ orderDetails?.orderNumber }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.status')">
          <ElTag :type="orderDetails ? statusColors[orderDetails.status] : 'info'">
            {{ orderDetails ? $t(statusLabels[orderDetails.status as keyof typeof statusLabels]) : '' }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.startLocation')">
          {{ orderDetails?.startAddress }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.endLocation')">
          {{ orderDetails?.endAddress }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.requestedTime')">
          {{ orderDetails?.estimatedTime }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.seatCount')">
          {{ orderDetails?.seatCount }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.totalPrice')">
          {{ orderDetails?.totalPrice }} ¥
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.paymentStatus')">
          {{ orderDetails?.paymentStatus }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.paymentMethod')">
          {{ orderDetails?.paymentMethod || '无' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.paymentTime')">
          {{ orderDetails?.paymentTime || '无' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.passenger')">
          {{ orderDetails?.passengerId?.username }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.driver')">
          {{ orderDetails?.driverId?.username || '未分配' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.createdAt')">
          {{ orderDetails?.createdAt }}
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="$t('page.manage.order.details.cancelReason')">
          {{ orderDetails?.canceledReason || '无' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
    
    <!-- 订单状态调整对话框 -->
     
    <ElDialog
      :title="$t('page.manage.order.statusDialog.title')"
      v-model="statusDialogVisible"
      class="p-6 w-11/12 md:w-1/3"
      :close-on-click-modal="false"
    >
      <ElForm :model="{ newStatus, cancelReason }" label-width="80px" label-position="left" class="space-y-4">
        <ElFormItem :label="$t('page.manage.order.statusDialog.status')" >
          <ElSelect v-model="newStatus" class="w-full" :disabled="selectedOrder?.status === 'cancelled'">
            <!-- 显示当前状态（只读） -->
            <ElOption
              :value="selectedOrder?.status as any"
              :label="currentStatusLabel"
              disabled
          />
            <ElOption
              v-for="status in availableStatuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </ElSelect>
          <div v-if="selectedOrder?.status === 'cancelled'" class="text-red-500 mt-2">
            {{ $t('page.manage.order.messages.orderCancelledCannotModify') }}
          </div>
        </ElFormItem>
        <ElFormItem
          v-if="newStatus === 'cancelled'"
          :label="$t('page.manage.order.statusDialog.cancelReason')"
        >
          <ElInput v-model="cancelReason" maxlength="200" show-word-limit type="textarea" :rows="3"  class="w-full" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="statusDialogVisible = false">{{ $t('page.manage.order.statusDialog.cancel') }}</ElButton>
          <ElButton type="primary" :loading="statusLoading" :disabled="isConfirmDisabled" @click="submitStatusUpdate">
            {{ $t('page.manage.order.statusDialog.confirm') }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
</style>