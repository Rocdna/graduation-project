<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { formatToLocal } from '@/utils/format'

import { useOrderStore } from '@/store/modules/order';
const orderStore = useOrderStore();

const orders = computed(() => orderStore.state.tasks);

const emit = defineEmits(['match', 'confirm', 'complete']);

// 移动端抽屉显示状态
const drawerVisible = ref(false);

// 判断是否为移动端
const isMobile = ref(window.innerWidth <= 768);
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 折叠面板状态
const activePanels = ref(['pending', 'matched', 'confirmed']);

// 按状态分组订单
const pendingOrders = computed(() =>
  orders.value.filter((order) => order.status === 'pending')
);
const matchedOrders = computed(() =>
  orders.value.filter((order) => order.status === 'matched')
);
const confirmedOrders = computed(() =>
  orders.value.filter((order) => order.status === 'confirmed')
);

// 操作订单
const matchedtOrder = (orderId) => {
  emit('match', orderId);
};

const confirmOrder = (orderId) => {
  emit('confirm', orderId);
};

const completeOrder = (orderId) => {
  emit('complete', orderId);
  drawerVisible.value = false; // 移动端完成订单后关闭抽屉
};

onMounted(() => {
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

</script>

<template>
    <div>
      <!-- 桌面端：固定面板 -->
      <div
        v-if="!isMobile"
        class="absolute bottom-4 left-4 w-96 bg-white rounded-lg shadow-lg p-4 max-h-[80vh] z-[1000] overflow-y-auto"
      >
        <h2 class="text-lg font-semibold mb-4">司机订单</h2>
        <el-collapse v-model="activePanels">
          <!-- 可接单订单 -->
          <el-collapse-item name="pending" title="可接单订单">
            <template #title>
              <span class="text-base font-medium">可接单订单 ({{ pendingOrders.length }})</span>
            </template>
            <div v-if="pendingOrders.length === 0" class="text-gray-500 p-2">
              暂无可接单订单
            </div>
            <el-card
              v-for="order in pendingOrders"
              :key="order.orderNumber"
              shadow="hover"
              class="order-card mb-2 bg-yellow-50"
            >
              <div class="p-2">
                <p><strong>订单ID:</strong> {{ order.orderNumber }}</p>
                <p><strong>乘客:</strong> {{ order.passengerId.username }}</p>
                <p><strong>起点:</strong> {{ order.startAddress }}</p>
                <p><strong>终点:</strong> {{ order.endAddress }}</p>
                <p><strong>距离:</strong> {{ order.distance }} 公里</p>
                <p><strong>时间:</strong> {{ formatToLocal(order.startTime) }}</p>
                <p><strong>价格:</strong> {{ order.totalPrice }} 元</p>
                <p><strong>座位:</strong> {{ order.seatCount }} 位</p>
                <el-button
                  type="success"
                  class="mt-2 w-full"
                  @click="matchedtOrder(order._id)"
                >
                  <SvgIcon icon="mdi:check-circle" class="mr-1" />
                  接受订单
                </el-button>
              </div>
            </el-card>
          </el-collapse-item>
  
          <!-- 已接单订单 -->
          <el-collapse-item name="accepted" title="已接单订单">
            <template #title>
              <span class="text-base font-medium">已接单订单 ({{ matchedOrders.length }})</span>
            </template>
            <div v-if="matchedOrders.length === 0" class="text-gray-500 p-2">
              暂无已接单订单
            </div>
            <el-card
              v-for="order in matchedOrders"
              :key="order.id"
              shadow="hover"
              class="order-card mb-2"
              :class="{ 'bg-yellow-50': true }"
            >
              <div class="p-2">
                <p><strong>订单ID:</strong> {{ order.orderNumber }}</p>
                <p><strong>乘客:</strong> {{ order.passengerId.username }}</p>
                <p><strong>起点:</strong> {{ order.startAddress }}</p>
                <p><strong>终点:</strong> {{ order.endAddress }}</p>
                <p><strong>距离:</strong> {{ order.distance }} 公里</p>
                <p><strong>时间:</strong> {{ formatToLocal(order.startTime) }}</p>
                <p><strong>价格:</strong> {{ order.totalPrice }} 元</p>
                <p><strong>座位:</strong> {{ order.seatCount }} 位</p>
                <el-button
                  type="primary"
                  class="mt-2 w-full"
                  @click="confirmOrder(order._id)"
                >
                  <SvgIcon icon="mdi:car" class="mr-1" />
                  确认接送
                </el-button>
              </div>
            </el-card>
          </el-collapse-item>
  
          <!-- 已确认订单 -->
          <el-collapse-item name="confirmed" title="已确认订单">

            <template #title>
              <span class="text-base font-medium">已确认订单 ({{ confirmedOrders.length }})</span>
            </template>

            <div v-if="confirmedOrders.length === 0" class="text-gray-500 p-2">
              暂无已确认订单
            </div>
            <el-card
              v-for="order in confirmedOrders"
              :key="order.id"
              shadow="hover"
              class="order-card mb-2"
              :class="{ 'bg-yellow-50': true }"
            >
              <div class="p-2">
                <p><strong>订单ID:</strong> {{ order.orderNumber }}</p>
                <p><strong>乘客:</strong> {{ order.passengerId.username }}</p>
                <p><strong>起点:</strong> {{ order.startAddress }}</p>
                <p><strong>终点:</strong> {{ order.endAddress }}</p>
                <p><strong>距离:</strong> {{ order.distance }} 公里</p>
                <p><strong>时间:</strong> {{ formatToLocal(order.startTime) }}</p>
                <p><strong>价格:</strong> {{ order.totalPrice }} 元</p>
                <p><strong>座位:</strong> {{ order.seatCount }} 位</p>
                <el-button
                  type="info"
                  class="mt-2 w-full"
                  @click="completeOrder(order._id)"
                >
                  <SvgIcon icon="mdi:flag-checkered" class="mr-1" />
                  完成订单
                </el-button>
              </div>
            </el-card>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 移动端：抽屉 -->
      <div v-if="isMobile" class="absolute bottom-0 w-full z-[1000]">
        <el-button
          type="primary"
          class="w-full py-3"
          @click="drawerVisible = !drawerVisible"
        >
          {{ drawerVisible ? '隐藏订单' : '查看订单' }}
        </el-button>
        <transition
          @enter="(el, done) => {
            gsap.fromTo(el, { y: '100%' }, { y: 0, duration: 0.3, ease: 'power2.out', onComplete: done });
          }"
          @leave="(el, done) => {
            gsap.to(el, { y: '100%', duration: 0.3, ease: 'power2.in', onComplete: done });
          }"
        >
          <div
            v-if="drawerVisible"
            class="bg-white w-full h-[60vh] p-4 overflow-y-auto rounded-t-lg"
          >
            <h2 class="text-lg font-semibold mb-4">司机订单</h2>
            <el-collapse v-model="activePanels">
              <!-- 可接单订单 -->
              <el-collapse-item name="pending" title="可接单订单">
                <template #title>
                  <span class="text-base font-medium">可接单订单 ({{ pendingOrders.length }})</span>
                </template>
                <div v-if="pendingOrders.length === 0" class="text-gray-500 p-2">
                  暂无可接单订单
                </div>
                <el-card
                  v-for="order in pendingOrders"
                  :key="order.id"
                  shadow="hover"
                  class="order-card mb-2"
                  :class="{ 'bg-yellow-50': true }"
                >
                  <div class="p-2">
                    <p><strong>订单ID:</strong> {{ order.orderNumber }}</p>
                    <p><strong>乘客:</strong> {{ order.passengerId.username }}</p>
                    <p><strong>起点:</strong> {{ order.startAddress }}</p>
                    <p><strong>终点:</strong> {{ order.endAddress }}</p>
                    <p><strong>距离:</strong> {{ order.distance }} 公里</p>
                    <p><strong>时间:</strong> {{ formatToLocal(order.startTime) }}</p>
                    <p><strong>价格:</strong> {{ order.totalPrice }} 元</p>
                    <p><strong>座位:</strong> {{ order.seatCount }} 位</p>
                    <el-button
                      type="success"
                      class="mt-2 w-full"
                      @click="matchedtOrder(order._id)"
                    >
                      <SvgIcon icon="mdi:check-circle" class="mr-1" />
                      接受订单
                    </el-button>
                  </div>
                </el-card>
              </el-collapse-item>
  
              <!-- 已接单订单 -->
              <el-collapse-item name="matched" title="已接单订单">
                <template #title>
                  <span class="text-base font-medium">已接单订单 ({{ matchedOrders.length }})</span>
                </template>
                <div v-if="matchedOrders.length === 0" class="text-gray-500 p-2">
                  暂无已接单订单
                </div>
                <el-card
                  v-for="order in matchedOrders"
                  :key="order.id"
                  shadow="hover"
                  class="order-card mb-2"
                  :class="{ 'bg-yellow-50': false }"
                >
                  <div class="p-2">
                    <p><strong>订单ID:</strong> {{ order.orderNumber }}</p>
                    <p><strong>乘客:</strong> {{ order.passengerId.username }}</p>
                    <p><strong>起点:</strong> {{ order.startAddress }}</p>
                    <p><strong>终点:</strong> {{ order.endAddress }}</p>
                    <p><strong>距离:</strong> {{ order.distance }} 公里</p>
                    <p><strong>时间:</strong> {{ formatToLocal(order.startTime) }}</p>
                    <p><strong>价格:</strong> {{ order.totalPrice }} 元</p>
                    <p><strong>座位:</strong> {{ order.seatCount }} 位</p>
                    <el-button
                      type="primary"
                      class="mt-2 w-full"
                      @click="confirmOrder(order._id)"
                    >
                      <SvgIcon icon="mdi:car" class="mr-1" />
                      确认接送
                    </el-button>
                  </div>
                </el-card>
              </el-collapse-item>
  
              <!-- 已确认订单 -->
              <el-collapse-item name="confirmed" title="已确认订单">
                <template #title>
                  <span class="text-base font-medium">已确认订单 ({{ confirmedOrders.length }})</span>
                </template>
                <div v-if="confirmedOrders.length === 0" class="text-gray-500 p-2">
                  暂无已确认订单
                </div>
                <el-card
                  v-for="order in confirmedOrders"
                  :key="order.id"
                  shadow="hover"
                  class="order-card mb-2"
                  :class="{ 'bg-yellow-50': true }"
                >
                  <div class="p-2">
                    <p><strong>订单ID:</strong> {{ order.orderNumber }}</p>
                    <p><strong>乘客:</strong> {{ order.passengerId.username }}</p>
                    <p><strong>起点:</strong> {{ order.startAddress }}</p>
                    <p><strong>终点:</strong> {{ order.endAddress }}</p>
                    <p><strong>距离:</strong> {{ order.distance }} 公里</p>
                    <p><strong>时间:</strong> {{ formatToLocal(order.startTime) }}</p>
                    <p><strong>价格:</strong> {{ order.totalPrice }} 元</p>
                    <p><strong>座位:</strong> {{ order.seatCount }} 位</p>
                    <el-button
                      type="info"
                      class="mt-2 w-full"
                      @click="completeOrder(order._id)"
                    >
                      <SvgIcon icon="mdi:flag-checkered" class="mr-1" />
                      完成订单
                    </el-button>
                  </div>
                </el-card>
              </el-collapse-item>
            </el-collapse>
          </div>
        </transition>
      </div>
    </div>
</template>
  
<style scoped>
</style>