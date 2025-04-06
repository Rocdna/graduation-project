<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useOrderStore } from '@/store/modules/order';
import { useAppStore } from '@/store/modules/app';
import { fetchReviewOrder } from "@/service/api";
import Map from '@/components/common/leafletMap.vue'
import OrderCard from "./modules/order-card.vue";
import ReviewCard from "./modules/review-card.vue";

import startIcon from '@/assets/imgs/start.png'  // 起点
import endIcon from '@/assets/imgs/end.png'
import driverPng from '@/assets/imgs/travel.png'

// const appStore = useAppStore();

const orderStore = useOrderStore();
const orders = computed(() => orderStore.state.tasks);

// 司机当前位置
const center = ref([121.125179, 30.139966]); // 默认中心点（可通过定位更新）

// 标记点（乘客位置、司机位置）
const markers = ref([
  { position: [121.125169, 30.140966], icon: driverPng }, // 乘客位置
]);

// 拼车路线
const routes = ref([
  {
    points: [], // 默认一条路线
    color: ''
  },
]);

// 初始化高德地图服务
let geocoder = null;
let driving = null;

// 判断是否为移动端（用于调整抽屉大小）
const isMobile = ref(window.innerWidth <= 768);
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 获取司机当前位置
const getCurrentPosition = () => {
  if (navigator.geolocation) {
  } else {
    console.error('浏览器不支持地理定位');
  }
};

// 监听 AMap 加载完成
const handleAMapLoaded = (m) => {
  if (window.AMap) {
    geocoder = new AMap.Geocoder({ city: 330281, extensions: 'all', radius: 100 });
    driving = new AMap.Driving({ policy: AMap.DrivingPolicy.LEAST_TIME, panel: 'panel' });

    // 地图加载完成后检查订单数据并处理
    processOrderOnMap();

  } else {
    console.error('AMap 未正确挂载到 window 上');
  }
};

// 处理订单数据并在地图上绘制
const processOrderOnMap = async () => {
  if (!geocoder || !driving || !orders.value.length) return;

  const allMarkers = [];
  const allRoutes = [];

  // 批量转换地址为经纬度
  const locationPromises = orders.value.flatMap(order => [
    new Promise(resolve => geocoder.getLocation(order.startAddress, (status, result) => {
      resolve(status === 'complete' && result.info === 'OK' ? result.geocodes[0].location : null);
    })),
    new Promise(resolve => geocoder.getLocation(order.endAddress, (status, result) => {
      resolve(status === 'complete' && result.info === 'OK' ? result.geocodes[0].location : null);
    })),
  ]);
  const locations = await Promise.all(locationPromises);


  // 处理每个订单
  for (let i = 0; i < orders.value.length; i++) {
    const startLngLat = locations[i * 2];
    const endLngLat = locations[i * 2 + 1];
    const order = orders.value[i];

    if (startLngLat && endLngLat) {
      // 添加标记
      allMarkers.push(
        { position: [startLngLat.lng, startLngLat.lat], title: '起点', icon: startIcon },
        { position: [endLngLat.lng, endLngLat.lat], title: '终点', icon: endIcon }
      );

      // 计算路线
      const routePromise = new Promise(resolve => {
        driving.search(
          [{ keyword: order.startAddress, city: 330281 }, { keyword: order.endAddress, city: 330281 }],
          (status, result) => {
            if (status === 'complete') {
              const route = result.routes[0];
              resolve({
                points: route.steps.flatMap(step => step.path),
                color: '#D4AE27', // 可动态生成
              });
            } else {
              resolve(null);
            }
          }
        );
      });
      const routeData = await routePromise;
      if (routeData) {
        allRoutes.push({ points: routeData.points, color: routeData.color });
      }
    }
  }

  // 更新地图
  markers.value = allMarkers;
  routes.value = allRoutes;
}

const showReview = ref(false);

// 父组件处理订单操作（调用仓库方法或后端 API）
const handleMatch = async (orderId) => {
  await orderStore.matchOrder(orderId);
};

const handleConfirm = async (orderId) => {
  await orderStore.confirmOrder(orderId);
};

// 待评价订单号
const reviewOrderId = ref('');

const handleComplete = async (orderId) => {
  await orderStore.completeOrder(orderId);
  reviewOrderId.value = orderId
  showReview.value = true;
};

const handleReviewSubmit = async (review) => {
  // 发送后端请求 
  const { data, error } = await fetchReviewOrder(reviewOrderId.value, {
    rating: review.rating,
    comment: review.comment,
    isAnonymous: review.isAnonymous
  });
  if (!error) {
    showReview.value = false;
    window.$message?.success(data.message);
    // // 重新加载页面
    // appStore.reloadPage();
  }
}

const handleReviewSkip = () => {
  showReview.value = false;
  window.$message?.info('已跳过评价');
}



// 初始化时获取当前位置
onMounted(async () => {
  // 获取路由 query 
  window.addEventListener('resize', handleResize);
  getCurrentPosition();

  // 获取当前司机任务列表
  await orderStore.fetchTasks();

});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});


</script>

<template>
  <div class="w-full h-[calc(100vh-57px)] bg-[#F5F5F5] static overflow-hidden">
    <div class="relative h-full">
      <Map
        :center="center"
        :zoom="14"
        :markers="markers"
        :routes="routes"
        mode="passenger"
        class-name="w-full mx-auto h-full"
        @amap-loaded="handleAMapLoaded"
      />
      <div id="panel"></div>
    </div>
    <OrderCard 
      @match="handleMatch"
      @confirm="handleConfirm"
      @complete="handleComplete"
    />
    <ReviewCard 
      :visible="showReview"
      @submit-review="handleReviewSubmit"
      @skip="handleReviewSkip"
      @update:visible="showReview = $event"
    />
  </div>
</template>

<style scoped></style>