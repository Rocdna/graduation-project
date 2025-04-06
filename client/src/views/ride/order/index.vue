<script setup>
import { onMounted, ref, computed } from 'vue';
import { fetchUserOrders, fetchOrderById } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { formatToLocal } from '@/utils/format';
import bgImg from '@/assets/imgs/1.jpg'

const useAuth = useAuthStore();
const userId = useAuth.userInfo._id;

// 获取用户信息
const user = useAuth.userInfo;


// 订单数据
const orders = ref([]);
const loading = ref(false);
const statusFilter = ref(undefined);
const showDetailDialog = ref(false);
const selectedOrder = ref(null);
const isMobile = ref(false);

// 状态标签和颜色
const statusLabel = {
  pending: '待匹配',
  matched: '已匹配',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};
const statusTagType = {
  pending: 'info',      // 灰色
  matched: 'warning',   // 橙色
  confirmed: 'primary', // 蓝色
  completed: 'success', // 绿色
  cancelled: 'danger',  // 红色
};

const getStatusClass = (status) => {
  const baseClasses = 'text-xs font-medium py-1 px-2 rounded-full'
  const statusClasses = {
    pending: 'bg-amber-900/30 text-amber-400',
    matched: 'bg-purple-900/30 text-purple-400',
    confirmed: 'bg-blue-900/30 text-blue-400',
    completed: 'bg-emerald-900/30 text-emerald-400',
    cancelled: 'bg-red-900/30 text-red-400'
  }
  return `${baseClasses} ${statusClasses[status] || 'bg-gray-900/30 text-gray-400'}`
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};
handleResize();

// 获取订单列表
const fetchOrders = async () => {
  if (!userId) return;
  loading.value = true;
  try {
    const { data, error } = await fetchUserOrders(userId, { status: statusFilter.value });
    if (!error) {
      orders.value = data.orders || [];
    }
  } catch (error) {
    consoe.log('获取订单失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// Dialog 宽度（响应式）
const dialogWidth = computed(() => {
  return window.innerWidth < 768 ? '100%' : '600px';
});

// 获取订单详情
const showDetail = async (orderId) => {
  try {
    const { data, error } = await fetchOrderById(orderId);
    if (!error) {
      selectedOrder.value = data.order;
      showDetailDialog.value = true;
    }
  } catch (error) {
    console.error('获取订单详情失败');
  }
};

// 关闭 Dialog
const handleCloseDialog = (done) => {
  showDetailDialog.value = false;
  selectedOrder.value = null;
  done();
};

const selectedRow = ref(null);
const selectRow = (id) => {
  selectedRow.value = id;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  // 初始化加载
  fetchOrders();
})

// 状态筛选变化
const handleStatusChange = () => {
  fetchOrders();
  window.removeEventListener('resize', handleResize);
};

</script>

<template>
  <div class="bg-[#1a1a1a] text-[#e0e0e0] overflow-hidden bg-gradient-to-b from-dark-800 to-dark-900 text-light-50 bg-cover bg-center bg-fixed" :style="{ backgroundImage: `url(${bgImg})`}">
    <main class="pt-12 sm:pt-16 pb-8 sm:pb-10 px-2 sm:px-4 relative w-full min-h-[calc(100vh-57px)]">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-30 -right-30 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-20 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>
      <div class="mx-auto w-[95%] sm:w-[90%] max-w-7xl mb-10 bg-light-50/5 
            rounded-none sm:rounded-3xl shadow-2xl border border-light-50/10 relative
            sm:backdrop-blur-xl backdrop-blur-2xl">
        <section class="p-4 sm:p-8 md:p-12 relative sm:min-h[600px]">
          <h1 class="text-2xl font-bold mb-4">
            {{ user?.role === 'passenger' ? '我的订单' : '我的接单记录' }}
          </h1>
          <!-- 筛选 -->
          <el-select
            v-model="statusFilter"
            placeholder="筛选状态"
            clearable
            class="w-full max-w-[200px] mb-4 champagne-select"
            @change="handleStatusChange"
          >
            <el-option label="所有状态" value="" />
            <el-option label="待匹配" value="pending" />
            <el-option label="已匹配" value="matched" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>

          <!-- 如果没有订单，显示占位内容 -->
          <div v-if="!orders.length" class="flex items-center justify-center min-h-[400px] bg-black/50 rounded-xl border border-gray-800/50">
            <div class="flex flex-col items-center space-y-4">
              <!-- 大图标 -->
              <SvgIcon icon="mdi:package-variant-closed" class="w-24 h-24 text-[#C9B68B]" />
              <!-- 提示文字 -->
              <p class="text-xl text-gray-400 font-medium">暂无订单</p>
              <p class="text-sm text-gray-500">请稍后再试或调整筛选条件</p>
            </div>
          </div>
          <div v-else class="flex items-center justify-center bg-black/50 rounded-xl border border-gray-800/50">
            <!-- 自定义表格 -->
            <div v-if="!isMobile" class="w-full bg-[#252525] rounded-lg border-[#6b5e40] overflow-hidden">
              <!-- 表头 -->
              <div class="grid grid-cols-[180px_1fr_1fr_150px_120px_120px_120px] bg-[#333] border-b border-[#6b5e40]">
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">订单编号</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">起点</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">终点</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">
                  {{ user?.role === 'passenger' ? '司机' : '乘客' }}
                </div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">状态</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">金额</div>
                <div class="p-2 text-[#c19f6f] font-bold">操作</div>
              </div>
              <!-- 表格主体 -->
              <div class="max-h-[500px] overflow-y-auto custom-scrollbar">
                <div
                  v-for="(order, index) in orders"
                  :key="order._id"
                  :class="[
                    'grid grid-cols-[180px_1fr_1fr_150px_120px_120px_120px]',
                    'border-b border-[#444]',
                    index % 2 === 0 ? 'bg-[#252525]' : 'bg-[#2a2a2a]',
                    selectedRow === order._id ? 'bg-[#8b6f47] text-[#e0e0e0]' : '',
                    'hover:bg-[#a68a64] hover:text-[#e0e0e0]'
                  ]"
                  @click="selectRow(order._id)"
                >
                  <div class="p-2 border-r border-[#444] truncate">{{ order.orderNumber }}</div>
                  <div class="p-2 border-r border-[#444] truncate">{{ order.startAddress || '未设置' }}</div>
                  <div class="p-2 border-r border-[#444] truncate">{{ order.endAddress || '未设置' }}</div>
                  <div class="p-2 border-r border-[#444] truncate">
                    {{ user?.role === 'passenger' ? order.driverId?.username || '未分配' : order.passengerId?.username || '未分配' }}
                  </div>
                  <div class="p-2 border-r border-[#444] truncate">
                    <span :class="getStatusClass(order.status)">
                      {{ statusLabel[order.status] || order.status }}
                    </span>
                  </div>
                  <div class="p-2 border-r border-[#444] truncate">￥{{ order.totalPrice.toFixed(2) }}</div>
                  <div class="p-2">
                    <button
                      class="text-[#8b6f47] hover:text-[#a68a64] border border-[#8b6f47] hover:border-[#a68a64] rounded px-2 py-1 transition-colors"
                      @click.stop="showDetail(order._id)"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
                <!-- 空数据 -->
                <div v-if="!orders.length" class="p-4 text-center text-[#e0e0e0]">
                  暂无数据
                </div>
              </div>
            </div>
            <!-- 移动端：卡片 -->
            <div v-else class="block md:hidden space-y-4">
              <div
                v-for="order in orders"
                :key="order._id"
                class="rounded-lg p-4 mb-4 border border-[#6b5e40] shadow-md"
              >
                <div class="flex justify-between py-1">
                  <span class="text-[#a0a0a0]">订单编号</span>
                  <span>{{ order.orderNumber }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#a0a0a0]">起点</span>
                  <span>{{ order.startAddress || '未设置' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#a0a0a0]">终点</span>
                  <span>{{ order.endAddress || '未设置' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#a0a0a0]">{{ user?.role === 'passenger' ? '司机' : '乘客' }}</span>
                  <span>
                    {{ user?.role === 'passenger' ? order.driverId?.profile?.name || '未分配' : order.passengerId?.profile?.name || '未分配' }}
                  </span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#a0a0a0]">状态</span>
                  <el-tag :type="statusTagType[order.status] || ''">
                    {{ statusLabel[order.status] || order.status }}
                  </el-tag>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#a0a0a0]">金额</span>
                  <span>￥{{ order.totalPrice.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#a0a0a0]">操作</span>
                  <el-button
                    type="primary"
                    link
                    @click="showDetail(order._id)"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
 
    <!-- 详情 Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="订单详情"
      :width="dialogWidth"
      :before-close="handleCloseDialog"
    >
      <el-card v-if="selectedOrder" class="bg-[#242424] border border-[#E8C897]/40 shadow-none">
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">订单编号</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.orderNumber }}</span>
          </div>
          <div v-if="user?.role === 'driver'" class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">乘客名</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.passenger?.username || '未分配' }}</span>
          </div>
          <div v-else class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">司机名</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.driver?.profile?.name || '未分配' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">起点</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.trip?.startAddress || '未设置' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">终点</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.trip?.endAddress || '未设置' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">开始时间</span>
            <span class="text-[#F0F0F0] font-medium">{{ formatToLocal(selectedOrder.trip?.startTime) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">状态</span>
            <el-tag :type="statusTagType[selectedOrder.status] || ''">
              {{ statusLabel[selectedOrder.status] || selectedOrder.status }}
            </el-tag>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">座位数</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.seatCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">总金额</span>
            <span class="text-[#F0F0F0] font-medium">￥{{ selectedOrder.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">支付状态</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.paymentStatus || '未支付' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">支付方式</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.paymentMethod || '未支付' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">取消原因</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedOrder.canceledReason || '无' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#E8C897]/90 tracking-wide">创建时间</span>
            <span class="text-[#F0F0F0] font-medium">{{ formatToLocal(selectedOrder.createdAt) }}</span>
          </div>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>

<style scoped>

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d4a373; /* 香槟金 */
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: #252525; /* 黑色 */
}

/* 使用 :deep() 穿透样式隔离，确保作用于 el-dialog 根元素 */
:deep(.el-dialog) {
  background-color: rgba(48, 48, 48, 0.96) !important; /* 确保 background-color 生效 */
  border: 1px solid #94978e91 !important;
}

:deep(.el-dialog__title) {
  color: #FFFFFF !important; /* 设置标题颜色为白色 */
  font-size: 16px !important; /* 可选：调整字体大小 */
  font-weight: 600 !important; /* 可选：加粗标题 */
}

:deep(.el-overlay) {
  background: rgba(0, 0, 0, 0.5) !important;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px) !important;
}

/* 移动端调整 */
@media (max-width: 639px) {
  div {
    /* 移除背景模糊 */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    /* 使用更不透明的背景 */
    background-color: rgba(26, 26, 26, 0.9); /* 接近纯黑，90% 不透明 */
  }
}
</style>