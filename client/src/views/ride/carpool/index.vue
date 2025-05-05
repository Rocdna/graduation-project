<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { gsap } from 'gsap';
import { fetchReviewOrder, fetchPayOrder } from "@/service/api";
import PaymentCard from './modules/payment-card.vue'
import ReviewCard from './modules/review-card.vue'
import Map from '@/components/common/leafletMap.vue'
import startIcon from '@/assets/imgs/start.png'  // 起点
import endIcon from '@/assets/imgs/end.png'
import { useOrderStore } from "@/store/modules/order";
import { useAppStore } from "@/store/modules/app";

const appstore = useAppStore();

const orderStore = useOrderStore();
// 防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// 乘客当前位置
const center = ref([121.155179, 30.039966]); // 默认中心点（可通过定位更新）

// 标记点（乘客位置、司机位置）
const markers = ref([
  { position: [121.155179, 30.039966], icon: startIcon }, // 乘客位置
]);

// 拼车路线
const routes = ref([
  {
    points: [], // 默认一条路线
    color: ''
  },
]);

// 订单信息
const orderStatus = computed(() => orderStore.state.passengerOrder.status);         // 订单状态，默认未发出订单
const driverInfo = computed(() => orderStore.state.passengerOrder.driverId);           // 司机信息
const orderCancelReason = ref('');              // 订单取消理由
const completedTime = ref('');                // 完成时间
const orderInfo = computed(() => orderStore.state.passengerOrder);


// 需要时间
const drivingTime = ref(null);
// 拼车备注
const remarks = ref(null);
// 拼车偏好
const preferences = ref({
  allowPets: false,
  quietMode: false,
  quietMode: false,
})

const showSettingsDrawer = ref(false);  // 控制初始抽屉
const showOrderDialog = ref(false);     // 控制订单信息抽屉
const showOrderCard = ref(false);

const statusRef = ref(null); // 状态提示容器
const statusBarRef = ref(null); // 左侧色条
const statusIconRef = ref(null); // 小车图标
const statusTextRef = ref(null); // 状态文字

// 初始化高德地图服务
let autoComplete = null;
let placeSearch = null;
let geocoder = null;
let driving = null;

// 存储起点和终点的经纬度
const startLocation = ref(null); // { lng: number, lat: number }
const endLocation = ref(null);   // { lng: number, lat: number }

// 订单完成的支付和评价
const showPayment = ref(false);
const showReview = ref(false);
const discount = ref(0.5);        // 折扣

// 接单动画
const animateStatus = () => {
  if (!statusRef.value) return;

  gsap.set(statusRef.value, { x: 50, opacity: 0 });
  gsap.set(statusBarRef.value, { scaleY: 0, transformOrigin: 'top' });
  gsap.set(statusIconRef.value, { scale: 0 });
  gsap.set(statusTextRef.value, { opacity: 0 });

  const tl = gsap.timeline();
  tl.to(statusRef.value, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' })
    .to(statusBarRef.value, { scaleY: 1, duration: 0.4, ease: 'power2.out' }, '-=0.3')
    .to(statusIconRef.value, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' }, '-=0.2')
    .to(statusTextRef.value, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.2');
};

// 监听订单状态变化
watch(orderStatus, (newStatus) => {
  if (newStatus) {
    animateStatus();
  }
});

onMounted(() => {
  animateStatus();
})

// 悬浮按钮
const statusButton = ref(null);
const ripple = ref(null);

// 状态配置
const statusConfig = {
  start: {
    buttonColor: '#d3d3d3',
    rippleColor: 'rgba(211, 211, 211, 0.8)'
  },
  pending: {
    buttonColor: '#ea580c', // 深橙色背景
    rippleColor: 'rgba(234, 88, 12 0.8)' // 橙红色波澜，增加不透明度
  },
  matched: {
    buttonColor: '#389E0D', // 深绿色背景
    rippleColor: 'rgba(56, 158, 13, 0.8)' // 绿色波澜，增加不透明度
  },
  confirmed: {
    buttonColor: '#096DD9', // 深蓝色背景
    rippleColor: 'rgba(9, 109, 217, 0.8)' // 蓝色波澜，增加不透明度
  },
  completed: {
    buttonColor: '#389E0A', // 深紫色背景
    rippleColor: 'rgba(56, 158, 10, 0.8)' // 紫色波澜，增加不透明度
  },
  cancelled: {
    buttonColor: '#D4380D', // 深红色背景
    rippleColor: 'rgba(185, 28, 28, 0.8)' // 红色波澜，增加不透明度
  }
};

// 更新动画函数
const updateStatusAnimation = (status) => {
  if (!statusButton.value || !ripple.value) return;
  const config = statusConfig[status];

  // 清理之前的动画
  gsap.killTweensOf([statusButton.value, ripple.value]);

  // 颜色过渡
  gsap.to(statusButton.value, {
    backgroundColor: config.buttonColor,
    duration: 0.5,
    ease: 'power2.out'
  });

  // 波澜效果
  gsap.set(ripple.value, {
    backgroundColor: config.rippleColor,
    scale: 0,
    opacity: 0.8
  });
  gsap.to(ripple.value, {
    scale: 2.5,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      gsap.set(ripple.value, { scale: 0, opacity: 0 });
    }
  });
};

// 监听订单状态变化
watch(orderStatus, (newStatus) => {
  updateStatusAnimation(newStatus);
}, { immediate: true })

// 进入动画
const handleHoverAnimation = () => {
  gsap.to(statusButton.value, {
    scale: 1.1,
    boxShadow: '0 8px 24px rgba(201, 163, 71, 0.3)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

// 离开动画
const handleLeaveAnimation = () => {
  gsap.to(statusButton.value, {
    scale: 1,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    duration: 0.3,
    ease: 'power2.out'
  });
};

// 状态中文描述
const statusText = computed(() => {
  const statusMap = {
    start: '未发布订单',
    pending: '等待司机接单',
    matched: '已匹配司机',
    confirmed: '订单确认',
    cancelled: '订单取消',
    completed: '订单完成'
  };
  return statusMap[orderStatus.value] || '未发布订单';
});

// 状态色条样式
const statusBarClass = computed(() => {
  const statusColorMap = {
    start: 'bg-[#d3d3d3]',
    pending: 'bg-[#C9A347]', // 香槟金，等待中
    matched: 'bg-[#52C41A]', // 绿色，已匹配
    confirmed: 'bg-[#1890FF]', // 蓝色，行程中
    cancelled: 'bg-[#FF4D4F]', // 红色，取消
    completed: 'bg-[#52C40A]' // 绿色，完成
  };
  return statusColorMap[orderStatus.value] || 'bg-[#C9A347]';
});

// 状态按钮样式
const statusButtonClass = computed(() => {
  const statusColorMap = {
    start: 'bg-[#d3d3d3]',
    pending: 'bg-[#C9A347]', // 香槟金，等待中
    matched: 'bg-[#52C41A]', // 绿色，已匹配
    confirmed: 'bg-[#1890FF]', // 蓝色，行程中
    cancelled: 'bg-[#FF4D4F]', // 红色，取消
    completed: 'bg-[#52C41A]' // 绿色，完成
  };
  return statusColorMap[orderStatus.value] || 'bg-[#00000F]';
});

// 计算属性
const statusIconCard = computed(() => {
  const icons = {
    pending: 'mdi:clock-outline',
    matched: 'mdi:car-connected',
    confirmed: 'mdi:progress-check',
    cancelled: 'mdi:close-circle',
    completed: 'mdi:check-circle'
  }
  return icons[orderStatus.value] || 'mdi:information'
})

const statusIconColor = computed(() => {
  return {
    start: 'bg-[#d3d3d3]',
    pending: 'text-[#D4B106]',
    matched: 'text-[#389E0D]',
    confirmed: 'text-[#096DD9]',
    cancelled: 'text-[#D4380D]',
    completed: 'text-[#389E0D]'
  }[orderStatus.value]
})

// 判断是否为移动端（用于调整抽屉大小）
const isMobile = ref(window.innerWidth <= 768);
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 获取乘客当前位置
const getCurrentPosition = () => {
  if (navigator.geolocation) {
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     const { longitude, latitude } = position.coords;
    //     center.value = [longitude, latitude];
    //     markers.value[0].position = [longitude, latitude]; // 更新乘客位置
    //     startPoint.value = [longitude, latitude]; // 默认起点为当前位置
    //     startAddress.value = '当前位置';
    //   },
    //   (error) => {
    //     console.error('定位失败:', error);
    //   }
    // );
  } else {
    console.error('浏览器不支持地理定位');
  }
};

// 监听 AMap 加载完成
const handleAMapLoaded = (m) => {
  if (window.AMap) {
    // 余姚市 330281
    autoComplete = new AMap.AutoComplete({ city: 330281 }); 
    placeSearch = new AMap.PlaceSearch({ city: 330281, pageSize: 1 });
    geocoder = new AMap.Geocoder({ city: 330281, extensions: 'all', radius: 100 });
    driving = new AMap.Driving({ policy: AMap.DrivingPolicy.LEAST_TIME, panel: 'panel' });

    // 地图加载完成后检查订单数据并处理
    processOrderOnMap();
  } else {
    console.error('AMap 未正确挂载到 window 上');
  }
};

// 地址搜索（结合 AMap.AutoComplete 和 AMap.PlaceSearch）
const searchAddress = (type, query, callback) => {
  if (!autoComplete) {
    console.error('AMap.AutoComplete 未初始化');
    callback([]);
    return;
  }
  const keyword = query || (type === 'start' ? orderInfo.value.startAddress : orderInfo.value.endAddress);
  if (!keyword) {
    callback([]);
    return;
  }
  autoComplete.search(keyword, (status, result) => {
    if (status === 'complete' && result.info === 'OK') {
      const suggestions = result.tips.map(item => ({
        value: item.name,
        address: item.address,
        location: item.location, // 经纬度（可能为空）
        id: item.id
      }));
      callback(suggestions);
    } else {
      console.error('地址搜索失败:', status, result);
      callback([]);
    }
  });
};

// 处理地址选择（获取详细经纬度）
const handleSelectAddress = (type, item) => {
  if (!placeSearch) {
    console.error('AMap.PlaceSearch 未初始化');
    return;
  }

  // 使用 AMap.PlaceSearch 获取详细地址信息
  placeSearch.search(item.value, (status, result) => {
    if (status === 'complete' && result.info === 'OK' && result.poiList.pois.length > 0) {
      const poi = result.poiList.pois[0];
      const location = {
        lng: poi.location.lng,
        lat: poi.location.lat
      };

      if (type === 'start') {
        orderInfo.value.startAddress = poi.name;
        startLocation.value = location;
        center.value = [location.lng, location.lat];
        markers.value = [{ 
          position: [location.lng, location.lat], 
          title: '起点', 
          content: markerContent
        }];
        isStartSet.value = true;
        currentInputType.value = 'end'; // 自动切换到终点
      } else {
        orderInfo.value.endAddress = poi.name;
        endLocation.value = location;
        markers.value = [
          ...markers.value.filter(m => m.title !== '终点'),
          { position: [location.lng, location.lat], title: '终点' }
        ];
        isEndSet.value = true;
      }
      calculateRoute();
      console.log(`${type} 地址选择:`, poi.name, location);
    } else {
      console.error('地点搜索失败:', status, result);
    }
  });
};

// 计算拼车路线（实际需调用 AMap.Driving）
const calculateRoute = () => {
  if (orderInfo.value.startAddress && orderInfo.value.endAddress) {
    driving.search([
      { keyword: orderInfo.value.startAddress, city: 330281 },
      { keyword: orderInfo.value.endAddress, city: 330281 }
    ], (status, result) => {
      if (status === 'complete') {
        const route = result.routes[0];
        orderInfo.value.distance = (route.distance / 1000).toFixed(1); // 转换为公里
        drivingTime.value = Math.ceil(route.time / 60); // 转换为分钟
        routes.value = [{
          points: route.steps.flatMap(step => step.path),
          color: '#D4AF37'
        }]
      }
    })
  }
};

// 处理地图点击事件（选择起点或终点）
const currentInputType = ref('start');  // 默认设置为起点
const isLoading = ref(false);           // 显示加载中提示
const isStartSet = ref(false);
const isEndSet = ref(false);

const handleMapClick = (position) => {
  if (orderStatus.value === 'start') {
    handleMapClickDebounced(position);
  }
};

const handleMapClickDebounced = debounce((position) => {
  if (!geocoder) {
    console.error('AMap.Geocoder 未初始化');
    return;
  }
  isLoading.value = true;
  const lnglat = position;
  geocoder.getAddress(lnglat, (status, result) => {
    isLoading.value = false;
    if (status === 'complete' && result.info === 'OK') {
      // const address = result.regeocode.pois[0]?.name || result.regeocode.formattedAddress;
      const address = result.regeocode.formattedAddress;
      if (currentInputType.value === 'start') {
        orderInfo.value.startAddress = address;
        startLocation.value = { lng: position[0], lat: position[1] };
        center.value = position;
        markers.value = [{ 
          position, 
          title: '起点', 
          icon: startIcon
         }];
        window.$message?.success(`起点已设置为 ${address}`);
        isStartSet.value = true;
        currentInputType.value = 'end'; // 自动切换到终点
      } else {
        orderInfo.value.endAddress = address;
        endLocation.value = { lng: position[0], lat: position[1] };
        markers.value = [
          ...markers.value.filter(m => m.title !== '终点'),
          { position, title: '终点', icon: endIcon }
        ];
        isEndSet.value = true;
        window.$message?.warning(`终点已设置为 ${address}`);
      }
      // 计算路线
      calculateRoute();
    } else {
      window.$message?.error('无法获取地址，请重试');
      console.error('逆地理编码失败:', status, result);
    }
  });
}, 500);

// 判断是否可以发布订单
const canPublishOrder = computed(() => {
  // 条件 1: 起点已选择
  const hasStartAddress = !!orderInfo.value.startAddress;

  // 条件 2: 终点已选择
  const hasEndAddress = !!orderInfo.value.endAddress;

  // 条件 3: 出发时间已选择
  const hasDepartureTime = !!orderInfo.value.startTime;

  // 条件 4: 乘客人数已填写
  const hasPassengerCount = !!orderInfo.value.seatCount && orderInfo.value.seatCount > 0;

  // 条件 5: 订单状态不为 pending, matched, confirmed
  const validStatus = !['pending', 'matched', 'confirmed'].includes(orderStatus.value);

  // 所有条件都满足时返回 true
  return hasStartAddress && hasEndAddress && hasDepartureTime && hasPassengerCount && validStatus;
})

// 动态生成提示信息
const getAlertTitle = computed(() => {
  if (!orderInfo.value.startAddress) return '请填写起点';
  if (!orderInfo.value.endAddress) return '请填写终点';
  if (!orderInfo.value.seatCount || orderInfo.value.seatCount <= 0) return '请填写乘客人数';
  if (!orderInfo.value.startTime) return '请选择出发时间';
  if (['pending', 'matched', 'confirmed'].includes(orderStatus.value)) {
    return '当前订单状态不可发布新订单';
  }
  return '';
});

// 计算预计费用
const estimatedCost = computed(() => {
  if (!orderInfo.value.distance || !orderInfo.value.seatCount) return 0;
  const baseCostPerKm = 1; // 每公里 2 元
  const costPerPerson = 2; // 每人 5 元
  orderInfo.value.totalPrice = (orderInfo.value.distance * baseCostPerKm + orderInfo.value.seatCount * costPerPerson).toFixed(2);
  return orderInfo.value.totalPrice;
});

// 禁用过去的日期
const disablePastDates = (time) => {
  return time.getTime() < Date.now();
};

// 发布订单----
const publishOrder = async () => {
  if (!canPublishOrder.value) return; // 防止未满足条件时点击
  // 模拟发布订单（实际需调用后端 API）
  const orderData = {
    startAddress: orderInfo.value.startAddress,
    startLocation: [ startLocation.value.lng, startLocation.value.lat ],
    endAddress: orderInfo.value.endAddress,
    endLocation: [ endLocation.value.lng, endLocation.value.lat ],
    seatCount: orderInfo.value.seatCount,
    startTime: orderInfo.value.startTime,
    distance: orderInfo.value.distance,
    totalPrice: orderInfo.value.totalPrice,
    estimatedTime: drivingTime.value,
  };
  try {
    // 发送请求
    const flag = orderStore.createOrder(orderData);
    if (flag) {
      showOrderDialog.value = false;
      showSettingsDrawer.value = false;
    }
  } catch (err) {
    console.log("发布订单失败: ", err);
  }
};

// 监听订单状态变化
watch(orderStatus, (newStatus) => {
  if (newStatus === 'matched') {
    markers.value = [
      ...markers.value,
      {
        position: [121.15530100000001, 30.045689], // 更合理的模拟位置
        title: `司机：${driverInfo.value.name}`
      }
    ];
  }
  if (newStatus === 'confirmed') {
    // 清除起点标签
    markers.value = markers.value.filter((_, index) => index !== 0);
  }
  if (newStatus === 'completed') {
    console.log('1清除标记和路线')
    showPayment.value = true;
    markers.value = [];
    routes.value = [];
    isStartSet.value = false;
    isEndSet.value = false;
    startLocation.value = null;
    endLocation.value = null;
  }
  if (newStatus === 'cancelled') {
    console.log('2清除标记和路线')
    markers.value = [];
    routes.value = [];
    isStartSet.value = false;
    isEndSet.value = false;
    startLocation.value = null;
    endLocation.value = null;
    currentInputType.value = 'start'
  }
})

// 联系司机逻辑（电话或聊天）
const contactDriver = () => {
  console.log('联系司机');
  showOrderDialog.value = false; // 点击联系司机后关闭对话框
};

// 订单完成或者失败，去往订单详细页面
const goToOrderDetail = () => {
  console.log("跳转到订单详细页，订单ID: ", 'uiahwduhahsidhasuidh');
}

// 取消订单对话框
const showCancelDialog = ref(false);
const cancelReason = ref(''); // 预选理由
const customCancelReason = ref(''); // 自定义理由

// 预选理由列表
const reasons = [
  { value: '行程变更', label: '行程变更' },
  { value: '司机未到', label: '司机未到' },
  { value: '临时有事', label: '临时有事' },
  { value: '其他', label: '其他' }
];

// 判断是否可以取消订单
const canCancelOrder = computed(() => {
  return ['pending', 'matched', 'confirmed'].includes(orderStatus.value);
});

// 判断是否可以确认取消
const canConfirmCancel = computed(() => {
  if (!cancelReason.value) return false;
  if (cancelReason.value === '其他') {
    return !!customCancelReason.value.trim();
  }
  return true;
});

// 关闭对话框前的处理
const handleCancelDialogClose = (done) => {
  window.$message.info('取消操作已中止');
  cancelReason.value = '';
  customCancelReason.value = '';
  done();
};

// 确认取消订单 ----
const confirmCancelOrder = async () => {
  const reason = cancelReason.value === '其他' ? customCancelReason.value : cancelReason.value;
  try {
    const flag = orderStore.orderCancelled(orderInfo.value._id, {
      status: 'cancelled',
      reason
    });
    if (flag) {
      orderCancelReason.value = reason;
      showCancelDialog.value = false;
      showSettingsDrawer.value = false;
      showOrderDialog.value = false;
      appstore.reloadPage(500);
    }
  } catch (error) {
    console.log(error)
  } finally {
    cancelReason.value = '';
    customCancelReason.value = '';
    isStartSet.value = false;
    isEndSet.value = false;
  }
};

// 支付确认
const handlePaymentConfirm = async (method) => {
  const { data, error } = await fetchPayOrder(orderInfo.value._id, { status: 'paid' });
  if (!error) {
   showPayment.value = false;
   showReview.value = true;
   window.$message?.success('支付成功');
  }
};

// 评价提交
const handleReviewSubmit = async (review) => {
  const { data, error } = await fetchReviewOrder(orderInfo.value._id, {
    rating: review.rating,
    comment: review.comment,
    isAnonymous: review.isAnonymous
  });
  if (!error) {
    showReview.value = false;
    window.$message?.success(data.message);
    orderStore.resetPassengerOrder();
    appstore.reloadPage();
  }
};

// 跳过评价
const handleReviewSkip = () => {
  showReview.value = false;
  window.$message?.info('已跳过评价');
  orderStore.resetPassengerOrder();
  appstore.reloadPage();
  
};

// 处理订单数据并在地图上绘制
const processOrderOnMap = () => {
  if (!geocoder || !driving || orderStatus.value === 'start') return;
  const startAddress = orderInfo.value.startAddress;
  const endAddress = orderInfo.value.endAddress;
  // 使用 Geocoder 将地址转为经纬度
  geocoder.getLocation(startAddress, (status, startResult) => {
    if (status === 'complete' && startResult.info === 'OK') {
      const startLngLat = startResult.geocodes[0].location;
      geocoder.getLocation(endAddress, (status, endResult) => {
        if (status === 'complete' && endResult.info === 'OK') {
          const endLngLat = endResult.geocodes[0].location;
          // 更新 markers 数组，触发子组件的 watch
          markers.value = [
            { position: [startLngLat.lng, startLngLat.lat], title: '起点', icon: startIcon },
            { position: [endLngLat.lng, endLngLat.lat], title: '终点', icon: endIcon },
          ];
          // 路线
          calculateRoute();
        } else {
          console.error('终点地址转换失败:', endResult);
        }
      });
    } else {
      console.error('起点地址转换失败:', startResult);
    }
  });
}

// 初始化时获取当前位置
onMounted(async () => {
  // 获取路由 query 
  window.addEventListener('resize', handleResize);
  getCurrentPosition();

  const flag = await orderStore.getCurrentOrder();
  if (flag) {
    isStartSet.value = true;
    isEndSet.value = true;
    processOrderOnMap();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

</script>

<template>
  <div class="w-full h-[calc(100vh-57px)] bg-[#F5F5F5] static overflow-hidden">
    <!-- 地图容器 -->
    <div class="relative h-full">
      <Map
        :center="center"
        :zoom="14"
        :markers="markers"
        :routes="routes"
        mode="passenger"
        class-name="w-full mx-auto h-full"
        @map-click="handleMapClick"
        @amap-loaded="handleAMapLoaded"
      />
      <div id="panel"></div>

      <!-- 起点和终点输入区域（地图顶部） -->
      <div class="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:w-96 bg-white p-4 rounded-xl border border-[#D1D5DB] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <div class="flex flex-col gap-3">
          <div class="flex items-center">
            <span class="text-[#333333] font-semibold text-sm flex items-center gap-1 w-16">
              <span class="w-2 h-2 bg-[#00A1E1] rounded-full"></span> 起点
            </span>
            <el-autocomplete
              v-model="orderInfo.startAddress"
              :fetch-suggestions="searchAddress.bind(null, 'start')"
              placeholder="请输入起点"
              class="custom-input flex-1 max-w-[250px]"
              @select="handleSelectAddress('start', $event)"
              @focus="currentInputType = 'start'"
              :class="{ 'active-input': currentInputType === 'start' }"
              :disabled="isLoading || isStartSet"
            />
          </div>
          <div class="flex items-center">
            <span class="text-[#333333] font-semibold text-sm flex items-center gap-1 w-16">
              <span class="w-2 h-2 bg-[#C9A347] rounded-full"></span> 终点
            </span>
            <el-autocomplete
              v-model="orderInfo.endAddress"
              :fetch-suggestions="searchAddress.bind(null, 'end')"
              placeholder="请输入终点"
              class="custom-input flex-1 max-w-[250px]"
              @select="handleSelectAddress('end', $event)"
              @focus="currentInputType = 'end'"
              :class="{ 'active-input': currentInputType === 'end' }"
              :disabled="isLoading || isEndSet"
            />
          </div>
        </div>
      </div>

      <!-- 状态提示 -->
      <div
        class="absolute right-4 flex items-center gap-2 top-[144px] md:top-4 md:right-4"
      >
      <div
        v-if="orderStatus"
        ref="statusRef"
        class="relative bg-[#F5F5F5] p-2 rounded-lg border shadow-[0_6px_20px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 ease-in-out md:p-3 hover:bg-gradient-to-r hover:from-[#E8ECEF] hover:to-[#F5F5F5] hover:shadow-[0_8px_24px_rgba(201,163,71,0.3)] hover:border-[#C9A347]"
        @click="showOrderDialog = true"
      >
        <div class="flex items-center gap-1">
          <span
            v-if="orderStatus"
            class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
            :class="statusBarClass"
            ref="statusBarRef"
          ></span>
          <span
            v-if="orderStatus"
            class="w-4 h-4 animate-icon rounded-full"
            :class="statusButtonClass"
            ref="statusIconRef"
          ></span>
          <p ref="statusTextRef" class="text-[#333333] text-xs font-bold md:text-sm">
            状态: {{ statusText }}
          </p>
        </div>
      </div>

        <!-- 更多设置按钮 -->
        <button
          v-if="orderStatus"
          class="bg-[#C9A347] text-white rounded-lg px-4 py-2 font-bold text-sm border border-[#B08C2F] transition-all duration-300 hover:bg-[#00A1E1] hover:border-[#008BBF]"
          @click="showSettingsDrawer = true"
        >
          更多设置
        </button>
      </div>

      <!-- 状态提示（圆形悬浮按钮） -->
      <div>
        <el-popover
          :visible="showOrderCard && !isMobile"
          placement="left-end"
          :width="300"
          trigger="click"
          :offset="10"
        >
          <template #reference>
              <button
                ref="statusButton"
                class="fixed bottom-8 right-4 sm:bottom-30 sm:right-20 w-14 h-14 bg-[#C9A347] border-3 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-300 ease-in-out hover:shadow-[0_8px_24px_rgba(201,163,71,0.3)] hover:scale-110"
                @click="showOrderCard = !showOrderCard"
                @mouseenter="handleHoverAnimation"
                @mouseleave="handleLeaveAnimation"
              >
                <!-- 波澜效果 -->
                <div
                  ref="ripple"
                  class="absolute w-full h-full rounded-full opacity-0 scale-0 "
                ></div>
                <SvgIcon 
                  :icon="showOrderCard ? 'mdi:close' : 'mdi:car-multiple'"
                  class="w-7 h-7 animate-icon color-white rounded-full"
                />
              </button>
          </template>

          <!-- 订单信息卡片 -->
          <div class="flex flex-col gap-4">
            <!-- 卡片头部 -->
            <div class="px-4 py-3 border-b border-[#EEE6D5] flex justify-between items-center">
              <div class="flex items-center gap-2">
                <SvgIcon 
                  :icon="statusIconCard" 
                  class="text-2xl bg-transparent" 
                  :class="statusIconColor"
                />
                <h3 class="text-[#5E4B16] font-semibold text-sm uppercase tracking-wider">
                  {{ statusText }}
                </h3>
              </div>
              <button 
                @click="showOrderCard = false"
                class="text-[#A38B5A] hover:text-[#7A6B44] transition-colors bg-transparent"
                aria-label="关闭卡片"
              >
                <SvgIcon icon="mdi:close" class="w-6 h-6"/>
              </button>
            </div>

              <!-- 卡片内容 -->
              <div class="p-4 space-y-4">
                <!-- 费用信息 -->
                <div class="flex items-center justify-between p-3 bg-[#FAF7F0] rounded-lg">
                  <div class="flex items-center gap-2 text-[#5E4B16]">
                    <SvgIcon icon="mdi:cash-multiple" class="text-lg"/>
                    <span class="text-sm font-medium">预计费用</span>
                  </div>
                  <span class="text-[#C9A347] font-bold text-lg">¥{{ orderInfo.totalPrice || ' -' }}</span>
                </div>
                
                <!-- 司机信息（条件渲染） -->
                <div 
                  v-if="driverInfo && ['matched', 'confirmed'].includes(orderStatus)"
                  class="space-y-3 border-t border-[#EEE6D5] pt-3"
                >
                  <div class="flex items-center gap-3">
                    <SvgIcon icon="mdi:account" class="text-[#5E4B16] text-lg"/>
                    <div>
                      <span class="text-xs text-[#7A6B44]">司机姓名：</span>
                      <span class="text-sm font-medium text-[#5E4B16]">{{ orderStore.driverInfo.username }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <SvgIcon icon="mdi:car" class="text-[#5E4B16] text-lg"/>
                    <div>
                      <span class="text-xs text-[#7A6B44]">车辆：</span>
                      <span class="text-sm font-medium text-[#5E4B16]">{{ orderStore.driverInfo.profile?.licensePlate || '琼B·888888' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <SvgIcon icon="mdi:clock-outline" class="text-[#5E4B16] text-lg"/>
                    <div>
                      <span class="text-xs text-[#7A6B44]">预计用时：</span>
                      <span class="text-sm font-medium text-[#5E4B16]">{{ orderInfo.estimatedTime }}分钟</span>
                    </div>
                  </div>
                </div>
                
                <!-- 状态信息 -->
                <div v-if="orderStatus === 'cancelled'" class="p-3 bg-[#FFF1F0] rounded-lg">
                  <div class="flex items-center justify-between gap-2 text-[#D4380D]">
                    <SvgIcon icon="mdi:alert-circle-outline" class="text-lg"/>
                    <div>
                      <p class="text-sm font-medium">订单已取消</p>
                      <p class="text-xs">{{ orderCancelReason || '用户取消' }}</p>
                    </div>
                    <!-- 详细图标按钮 -->
                    <button
                      @click="goToOrderDetail"
                      class="text-[#D4380D] hover:text-[#ff744e] bg-transparent transition-colors"
                      aria-label="查看订单详情"
                    >
                      <span class="text-sm text-[#D4380D]">查看详情</span>
                      <SvgIcon icon="mdi:information-outline" class="text-lg sm:text-base" />
                    </button>
                  </div>
                </div>
                
                <div v-if="orderStatus === 'completed'" class="p-3 bg-[#F6FFED] rounded-lg">
                  <div class="flex items-center justify-between gap-2 text-[#389E0D]">
                    <SvgIcon icon="mdi:check-circle-outline" class="text-lg"/>
                    <div>
                      <p class="text-sm font-medium">订单已完成</p>
                      <p class="text-xs">{{ completedTime || '2025-03-29 10:00' }}</p>
                    </div>
                    <!-- 详细图标按钮 -->
                    <button
                      @click="goToOrderDetail"
                      class="flex items-center gap-1 bg-transparent text-[#389E0D] hover:text-[#2f7c0a] transition-colors"
                      aria-label="查看订单详情"
                    >
                      <span class="text-sm text-[#389E0D]">查看详情</span>
                      <SvgIcon icon="mdi:information-outline" class="text-lg sm:text-base" />
                    </button>
                  </div>
                </div>
                
                <!-- 操作按钮 -->
                <el-button
                  v-if="['matched', 'confirmed'].includes(orderStatus)"
                  class="w-full bg-[#C9A347] hover:bg-[#B08C2F] text-white font-medium py-3 rounded-lg transition-colors"
                  @click="contactDriver"
                >
                  <SvgIcon icon="mdi:phone-outline" class="mr-2"/>
                  联系司机
                </el-button>
              </div>
          </div>
        </el-popover>
      </div>

      <!-- 抽屉：拼车人数设置，显示两点距离，所需要的预估时间等 -->
      <el-drawer
        v-model="showSettingsDrawer"
        title="拼车设置"
        :direction="isMobile ? 'btt' : 'rtl'"
        :size="isMobile ? '50%' : '30%'"
        :append-to-body="true"
        :class="['settings-drawer']"
      >
        <div class="flex flex-col gap-4 p-4">
          <!-- 拼车人数 -->
          <div class="flex items-center gap-2">
            <span class="text-[#333333] font-semibold text-sm">乘客人数</span>
            <el-input
              v-model.number="orderInfo.seatCount"
              type="number"
              :min="1"
              :max="4"
              class="w-16"
            />
          </div>
          <!-- 提示信息 -->
          <el-alert
            v-if="!canPublishOrder"
            :title="getAlertTitle"
            type="error"
            :closable="false"
            class="text-sm bg-red-50 text-red-600 border-red-200 rounded-md p-2 mb-4"
          />
          <!-- 两点距离和预估时间 -->
          <div v-if="orderInfo.startAddress && orderInfo.endAddress" class="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2">
              <SvgIcon icon="mdi:map-marker-distance" class="text-[#333333] text-lg" />
              <span class="text-[#333333] font-semibold text-sm">行驶距离</span>
              <span class="text-[#ea580c] font-bold text-sm">{{ orderInfo.distance }} 公里</span>
            </div>
            <div class="flex items-center gap-2">
              <SvgIcon icon="mdi:clock-outline" class="text-[#333333] text-lg" />
              <span class="text-[#333333] font-semibold text-sm">预估时间</span>
              <span class="text-[#ea580c] font-bold text-sm">{{ drivingTime }} 分钟</span>
            </div>
          </div>

          <!-- 预计费用 -->
          <div v-if="orderInfo.startAddress && orderInfo.endAddress && orderInfo.seatCount" class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <SvgIcon icon="mdi:cash-multiple" class="text-[#333333] text-lg" />
            <span class="text-[#333333] font-semibold text-sm">预计费用</span>
            <span class="text-[#C9A347] font-bold text-base">{{ estimatedCost }} 元</span>
          </div>

          <!-- 出发时间选择 -->
          <div class="flex items-center gap-2">
            <span class="text-[#333333] font-semibold text-sm">出发时间</span>
            <el-date-picker
              v-model="orderInfo.startTime"
              type="datetime"
              placeholder="选择出发时间"
              :disabled-date="disablePastDates"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              class="w-full"
            />
          </div>

          <!-- 拼车偏好 -->
          <div class="flex flex-col gap-2">
            <span class="text-[#333333] font-semibold text-sm">拼车偏好</span>
            <el-checkbox v-model="preferences.allowPets" label="允许携带宠物" />
            <el-checkbox v-model="preferences.quietMode" label="需要安静模式" />
            <el-checkbox v-model="preferences.allowSmoking" label="允许吸烟" />
          </div>

          <!-- 备注 -->
          <div class="flex flex-col gap-2">
            <span class="text-[#333333] font-semibold text-sm">备注</span>
            <el-input
              v-model="remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（如特殊需求或联系方式）"
            />
          </div>

          <!-- 发布订单按钮 -->
          <el-button
            class="w-full bg-[#ea5a0ca7] text-white border-none py-2.5 text-base disabled:bg-[#d3d3d3] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canPublishOrder"
            @click="publishOrder"
          >
            发布订单
          </el-button>

          <!-- 取消订单，并填写理由 -->
          <el-button
            :disabled="!canCancelOrder"
            class="w-full bg-red-500 m-0 text-white border-none py-2.5 text-base hover:bg-red-400 hover:text-white disabled:bg-[#ffeaea] disabled:cursor-not-allowed disabled:opacity-60"
            @click="showCancelDialog = true"
          >
            取消订单
          </el-button>

        </div>
      </el-drawer>

      <!-- 取消订单对话框 -->
      <el-dialog
        v-model="showCancelDialog"
        title="取消订单"
        width="90%"
        :max-width="400"
        :before-close="handleCancelDialogClose"
        class="custom-dialog"
      >
        <div class="flex flex-col gap-3 p-4">
          <!-- 取消规则提示 -->
          <el-alert
            title="取消订单可能扣除费用，请谨慎操作"
            type="warning"
            :closable="false"
            show-icon
            class="text-sm bg-yellow-100 text-yellow-800 border-yellow-300 rounded-lg p-1.5"
          />

          <!-- 预选理由（卡片式按钮） -->
          <div>
            <p class="text-sm font-semibold text-gray-800 mb-2">请选择取消理由</p>
            <div class="flex flex-col gap-2">
              <div
                v-for="reason in reasons"
                :key="reason.value"
                class="reason-card"
                :class="{ 'selected': cancelReason === reason.value }"
                @click="cancelReason = reason.value"
              >
                {{ reason.label }}
              </div>
            </div>
          </div>

          <!-- 自定义理由 -->
          <div v-if="cancelReason === '其他'">
            <p class="text-sm font-semibold text-gray-800 mb-2">请填写取消理由</p>
            <el-input
              v-model="customCancelReason"
              type="textarea"
              :rows="3"
              placeholder="请输入取消理由（最多100字）"
              maxlength="100"
              show-word-limit
              class="custom-textarea"
            />
          </div>
        </div>

        <!-- 对话框底部按钮 -->
        <template #footer>
          <div class="flex justify-end gap-2">
            <el-button
              class="px-4 py-2 text-gray-600 border-gray-300 hover:bg-gray-100"
              @click="showCancelDialog = false"
            >
              取消
            </el-button>
            <el-button
              type="danger"
              class="px-4 py-2 bg-red-500 hover:bg-red-600 border-none text-white"
              :disabled="!canConfirmCancel"
              @click="confirmCancelOrder"
            >
              确认
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 对话框：订单信息 -->
      <el-dialog
        v-model="showOrderDialog"
        title="订单信息"
        :width="isMobile ? '90%' : '400px'"
        :append-to-body="true"
        :class="['order-dialog']"
      >
        <div class="flex flex-col gap-4 p-4">
          <p class="text-[#333333] font-semibold text-base">状态: {{ statusText }}</p>
          <p class="text-[#333333] text-sm">预计费用: ¥{{ orderInfo.totalPrice || '25' }}</p>
          <div v-if="driverInfo" class="text-[#333333] text-sm">
            <p>司机: {{ driverInfo.name }}</p>
            <p>车辆: {{ driverInfo.vehicle }}</p>
            <p>预计到达: {{ driverInfo.eta }}</p>
          </div>
          <p v-if="orderStatus === 'cancelled'" class="text-[#FF4D4F] text-sm">
            取消原因: {{ orderCancelReason || '用户取消' }}
          </p>
          <p v-if="orderStatus === 'completed'" class="text-[#333333] text-sm">
            完成时间: {{ completedTime || '2025-03-29 10:00' }}
          </p>
        </div>
        <template #footer>
          <el-button
            v-if="['matched', 'confirmed'].includes(orderStatus)"
            class="contact-button"
            @click="contactDriver"
          >
            联系司机
          </el-button>
          <el-button @click="showOrderDialog = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 订单信息移动端 -->
      <div
        v-if="showOrderCard && isMobile"
        class="order-card-modal fixed inset-0 z-1000 flex items-end sm:items-center justify-center bg-black bg-opacity-30"
        @click.self="showOrderCard = false"
      >
        <div class="order-card-container bg-white rounded-t-lg sm:rounded-lg w-full sm:w-auto">
          <div class="flex flex-col gap-4 p-4">
            <!-- 卡片头部 -->
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <SvgIcon 
                  :icon="statusIconCard" 
                  class="text-2xl sm:text-xl bg-transparent" 
                  :class="statusIconColor"
                />
                <h3 class="text-[#5E4B16] font-semibold text-sm sm:text-xs uppercase tracking-wider">
                  {{ statusText }}
                </h3>
              </div>
              <button 
                @click="showOrderCard = false"
                class="text-[#A38B5A] hover:text-[#7A6B44] transition-colors bg-transparent"
                aria-label="关闭卡片"
              >
                <SvgIcon icon="mdi:close" class="w-5 h-5 sm:w-4 sm:h-4"/>
              </button>
            </div>

            <!-- 卡片内容 -->
            <div class="space-y-4 max-h-[60vh] sm:max-h-[80vh] overflow-y-auto">
              <!-- 费用信息 -->
              <div class="flex items-center justify-between p-3 bg-[#FAF7F0] rounded-lg">
                <div class="flex items-center gap-2 text-[#5E4B16]">
                  <SvgIcon icon="mdi:cash-multiple" class="text-lg sm:text-base"/>
                  <span class="text-sm sm:text-xs font-medium">预计费用</span>
                </div>
                <span class="text-[#C9A347] font-bold text-lg sm:text-base">¥{{ orderInfo.totalPrice || '25' }}</span>
              </div>
              
              <!-- 司机信息（条件渲染） -->
              <div 
                v-if="driverInfo && ['matched', 'confirmed'].includes(orderStatus)"
                class="space-y-3 border-t border-[#EEE6D5] pt-3"
              >
                <div class="flex items-center gap-3">
                  <SvgIcon icon="mdi:account" class="text-[#5E4B16] text-lg sm:text-base"/>
                  <div>
                    <p class="text-xs sm:text-[10px] text-[#7A6B44]">司机</p>
                    <p class="text-sm sm:text-xs font-medium text-[#5E4B16]">{{ driverInfo.name }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <SvgIcon icon="mdi:car" class="text-[#5E4B16] text-lg sm:text-base"/>
                  <div>
                    <p class="text-xs sm:text-[10px] text-[#7A6B44]">车辆</p>
                    <p class="text-sm sm:text-xs font-medium text-[#5E4B16]">{{ driverInfo.vehicle }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <SvgIcon icon="mdi:clock-outline" class="text-[#5E4B16] text-lg sm:text-base"/>
                  <div>
                    <p class="text-xs sm:text-[10px] text-[#7A6B44]">预计到达</p>
                    <p class="text-sm sm:text-xs font-medium text-[#5E4B16]">{{ driverInfo.eta }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 状态信息 -->
              <div v-if="orderStatus === 'cancelled'" class="p-3 bg-[#FFF1F0] rounded-lg">
                <div class="flex items-center gap-2 text-[#D4380D]">
                  <SvgIcon icon="mdi:alert-circle-outline" class="text-lg sm:text-base"/>
                  <div>
                    <p class="text-sm sm:text-xs font-medium">订单已取消</p>
                    <p class="text-xs sm:text-[10px]">{{ orderCancelReason || '用户取消' }}</p>
                  </div>
                </div>
              </div>
              
              <div v-if="orderStatus === 'completed'" class="p-3 bg-[#F6FFED] rounded-lg">
                <div class="flex items-center gap-2 text-[#389E0D]">
                  <SvgIcon icon="mdi:check-circle-outline" class="text-lg sm:text-base"/>
                  <div>
                    <p class="text-sm sm:text-xs font-medium">订单已完成</p>
                    <p class="text-xs sm:text-[10px]">{{ completedTime || '2025-03-29 10:00' }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <el-button
                v-if="['matched', 'confirmed'].includes(orderStatus)"
                class="w-full bg-[#C9A347] hover:bg-[#B08C2F] text-white font-medium py-3 rounded-lg transition-colors text-sm sm:text-xs"
                @click="contactDriver"
              >
                <SvgIcon icon="mdi:phone-outline" class="mr-2"/>
                联系司机
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付 -->
    <PaymentCard
      :visible="showPayment"
      :order-amount="orderInfo.totalPrice"
      :discount="discount"
      @confirm-payment="handlePaymentConfirm"
      @update:visible="showPayment = $event"
    />
    <!-- 评价 -->
    <ReviewCard
      :visible="showReview"
      @submit-review="handleReviewSubmit"
      @skip="handleReviewSkip"
      @update:visible="showReview = $event"
    />
  </div>
</template>

<style scoped>
/* 自定义对话框样式（保持不变） */
.custom-dialog :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.custom-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.custom-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2a44;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 0;
}

/* 卡片式理由样式 */
.reason-card {
  padding: 10px 16px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reason-card:hover {
  background-color: #f1f5f9;
  border-color: #d1d5db;
}

.reason-card.selected {
  background-color: #ea580c;
  border-color: #ea580c;
  color: #ffffff;
}



.el-button+.el-button {
  margin-left: 0px;
}

.order-card-modal {
  transition: opacity 0.3s ease-in-out;
}

.order-card-container {
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 移动端调整 */
@media (max-width: 640px) {
  .order-card-container {
    max-width: 100%;
    max-height: 60vh;
    border-radius: 16px 16px 0 0;
  }

  .order-card-container .p-4 {
    padding: 12px;
  }

  .order-card-container .flex {
    flex-wrap: wrap;
  }

  .order-card-container p,
  .order-card-container span {
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
  }
}

.animate-status {
  animation: bgChange 0.5s ease-in-out;
}
@keyframes bgChange {
  0% { background-color: rgba(255, 255, 255, 0.9); }
  50% { background-color: #E6F7FA; }
  100% { background-color: rgba(255, 255, 255, 0.9); }
}
.animate-bar {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}

.animate-icon {
  animation: iconScale 0.3s ease-in-out;
}

@keyframes iconScale {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}


/* 自定义 Element Plus 输入框样式 */
:deep(.custom-input .el-input__wrapper) {
  background-color: #F9FAFB;
  color: #333333;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 3px 12px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

:deep(.custom-input .el-input__wrapper:hover) {
  border-color: #00A1E1;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  border-color: #00A1E1;
  box-shadow: 0 0 0 3px rgba(0, 161, 225, 0.15);
  background-color: #FFFFFF;
}

:deep(.custom-input .el-input__inner) {
  color: #333333;
}

:deep(.custom-input .el-input__inner::placeholder) {
  color: #666666;
}


.animate-bg {
  animation: bgChange 0.5s ease-in-out;
}

@keyframes bgChange {
  0% { background-color: #E8ECEF; }
  50% { background-color: #E6F7FA; }
  100% { background-color: #E8ECEF; }
}

</style>