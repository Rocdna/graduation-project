<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useOrderStore } from '@/store/modules/order';
const orderStore = useOrderStore();

const orders = computed(() => orderStore.availableOrders);

const auth = useAuthStore();
const role = computed(() => auth.userInfo.role);
const isLogin = auth.isLogin;

import carImg from '@/assets/imgs/9.png'

gsap.registerPlugin(ScrollTrigger);

const { routerPush } = useRouterPush();

// 搜索表单数据
const searchForm = ref({
  start: '',
  end: '',
  time: ''
});
const searchFormRef = ref();

// 搜索功能
const searchRide = () => {
  if (isLogin) {
    if (!searchForm.value.start || !searchForm.value.end) {
      window.$message?.warning('请填写出发地和目的地');
      return;
    }
    window.$message?.success('搜索成功，请查看结果');
    routerPush({ 
      path: '/ride/carpool',
      query: {
        start: searchForm.value.start,
        end: searchForm.value.end,
        time: new Date(searchForm.value.time)
      }
     })
  } else
    window.$message?.warning('您还没登录，请在登录后在拼车吧!');
};

// 热门路线数据
const hotRoutes = ref([
  { id: 1, start: '公司大门', end: '宿舍楼', distance: 5, price: '10元' },
  { id: 2, start: '学校北门', end: '火车站', distance: 12, price: '15元' },
  { id: 3, start: '园区A区', end: '园区B区', distance: 3, price: '5元' },
  { id: 4, start: '总部A楼', end: '总部B楼', distance: 2, price: '5元' },
  { id: 5, start: '大学城', end: '市中心', distance: 15, price: '20元' },
]);

// 面向乘客
const passengerBenefits = [
  { 
    title: '省钱又划算', 
    text: '拼车价格比单独打车更实惠，节省出行成本', 
    icon: 'mdi:tag-heart-outline', 
    backgroundImage: '' 
  },
  { 
    title: '环保新选择', 
    text: '与他人共享出行，减少碳排放，保护环境', 
    icon: 'mdi:registered-trademark', 
    backgroundImage: '' 
  },
  { 
    title: '随时随地出发', 
    text: '无需等待固定班次，灵活安排出行时间', 
    icon: 'mdi:clock-time-eight-outline', 
    backgroundImage: '' 
  },
  { 
    title: '安全有保障', 
    text: '所有司机经过严格认证，确保行程安全可靠', 
    icon: 'mdi:shield-check-outline', 
    backgroundImage: '' 
  },
  { 
    title: '行程全透明', 
    text: '实时查看司机位置和路线，出行更放心', 
    icon: 'mdi:map-marker-path', 
    backgroundImage: '' 
  },
];
// 面向司机
const driverBenefits = [
  { 
    title: '收益更高', 
    text: '接单效率提升，拼车模式增加每趟收入', 
    icon: 'mdi:cash-multiple', 
    backgroundImage: '' 
  },
  { 
    title: '自由安排', 
    text: '随时上线接单，工作时间完全由你掌控', 
    icon: 'mdi:calendar-check-outline', 
    backgroundImage: '' 
  },
  { 
    title: '智能派单', 
    text: '系统自动匹配附近订单，省去寻找乘客的麻烦', 
    icon: 'mdi:map-marker-radius-outline', 
    backgroundImage: '' 
  },
  { 
    title: '多单共赢', 
    text: '一次接送多个乘客，收益翻倍更轻松', 
    icon: 'mdi:car-multiple', 
    backgroundImage: '' 
  },
  { 
    title: '快速到账', 
    text: '平台支持即时结算，收入无需长时间等待', 
    icon: 'mdi:handshake-outline', 
    backgroundImage: '' 
  },
];

const benefits = computed(() => {
  if (role.value === 'passenger') return passengerBenefits; 
  return driverBenefits;
});


// 卡片和图标的 ref
const benefitCards = ref([]);

// 特性
const features = ref([
  { title: '安全可靠', description: '严格的司机审核机制，实时行程监控，一键求助功能，确保您的每一次出行都安全无忧。', icon: 'mdi:shield-check', bgClass: 'bg-yellow-500/20' },
  { title: '智能匹配', description: '先进的算法为您匹配最佳路线和同行伙伴，节省时间，提升出行效率。', icon: 'mdi:clock-fast', bgClass: 'bg-gray-800/50' },
  { title: '经济环保', description: '拼车减少车辆使用，降低出行成本，同时减少碳排放，为地球环保贡献力量。', icon: 'mdi:leaf', bgClass: 'bg-yellow-500/20' },
  { title: '灵活支付', description: '支持微信、支付宝等多种支付方式，支付流程简单快捷，随时随地完成订单。', icon: 'mdi:cash', bgClass: 'bg-gray-800/50' },
]);


// 存储 DOM 引用
const aboutSection = ref(null);
const titleSection = ref(null);
const titleLine = ref(null);
const missionSection = ref(null);
const missionLine = ref(null);
const verticalLine = ref(null);
const featureTitles = ref([]);
const featureDescriptions = ref([]);
const featureIcons = ref([]);
const footerSection = ref(null);
const footerLine = ref(null);
// 背景的 ref
const backgroundSection = ref(null);

// 标题和卡片的 ref
const hotRoutesTitle = ref(null);
const hotRouteCards = ref([]);

// 初始化 GSAP 动画
const initAnimations = async () => {
  // 重置滚动位置
  window.scrollTo(0, 0);

    // 卡片动画：从下方淡入，背景光效扫过
  if (Array.isArray(benefitCards.value)) {
    gsap.fromTo(
      benefitCards.value,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out', // 平滑进入
        stagger: 0.2, // 卡片依次进入
        scrollTrigger: {
          trigger: benefitCards.value[0], // 以第一个卡片为触发点
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // 标题动画：从下方淡入并轻微缩放
  if (hotRoutesTitle.value) {
    gsap.fromTo(
      hotRoutesTitle.value.children, // 标题中的图标、文字和装饰线
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.5)', // 弹性效果
        stagger: 0.2, // 子元素依次进入
        scrollTrigger: {
          trigger: hotRoutesTitle.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // 卡片动画：逐个从下方滑入并淡入
  if (Array.isArray(hotRouteCards.value) && hotRouteCards.value.length) {
    gsap.fromTo(
      hotRouteCards.value,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)', // 弹性效果
        stagger: 0.2, // 卡片依次进入
        scrollTrigger: {
          trigger: hotRouteCards.value[0], // 以第一个卡片为触发点
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // 背景图视差效果
  if (backgroundSection.value) {
    gsap.to(backgroundSection.value, {
      backgroundPosition: 'center 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: backgroundSection.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // 标题动画
  if (titleSection.value) {
    gsap.fromTo(
      titleSection.value,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: titleSection.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  if (titleLine.value) {
    gsap.fromTo(
      titleLine.value,
      { width: 0 },
      {
        width: '4rem',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: titleSection.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // 左侧：我们的使命
  if (missionSection.value) {
    gsap.fromTo(
      missionSection.value,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: missionSection.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  if (missionLine.value) {
    gsap.fromTo(
      missionLine.value,
      { width: 0 },
      {
        width: '100%',
        duration: 4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: missionSection.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // 垂直线条动画
  if (verticalLine.value) {
    gsap.fromTo(
      verticalLine.value,
      { height: 0 },
      {
        height: '120%',
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: verticalLine.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  // 右侧特点列表动画
  if (Array.isArray(featureTitles.value) && Array.isArray(featureDescriptions.value) && Array.isArray(featureIcons.value)) {
    featureTitles.value.forEach((title, index) => {
      const description = featureDescriptions.value[index];
      const icon = featureIcons.value[index];

      // 标题动画
      gsap.fromTo(
        icon,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 标题动画（延迟 0.5 秒）
      gsap.fromTo(
        title,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.5,
          delay: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 描述动画（延迟 0.5 秒）
      gsap.fromTo(
        description,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  } else {
    console.error('featureTitles or featureDescriptions is not an array:', featureTitles.value, featureDescriptions.value);
  }

  // 结语动画
  if (footerSection.value) {
    gsap.fromTo(
      footerSection.value,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerSection.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  if (footerLine.value) {
    gsap.fromTo(
      footerLine.value,
      { width: 0 },
      {
        width: '100%',
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerSection.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }
};

// Hover 时的粒子效果
const handleCardHover = (event) => {
  const target = event.currentTarget;

  // 创建金色粒子
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-1 h-1 rounded-full bg-[#EAD9B5]';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    target.appendChild(particle);

    // 粒子动画
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 50,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    });
  }
};

// 清理动画
const killAnimations = () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.killTweensOf([
    backgroundSection.value,
    titleSection.value,
    titleLine.value,
    missionSection.value,
    missionLine.value,
    verticalLine.value,
    featureTitles.value,
    featureDescriptions.value,
    footerSection.value,
    footerLine.value,
  ]);
};

// 第一次挂载时初始化动画
onMounted(async () => {
  if (role.value === 'driver') {
    await orderStore.fetchTasks();
  }
  await nextTick(); // 确保 DOM 已渲染
  // 延迟初始化动画，确保 DOM 完全渲染
  await initAnimations();
});

// 组件销毁
onUnmounted(async () => {
  killAnimations();
});

// 司机待接单
const filter = ref({ distance: '2' })



// 计算显示的订单（最多6条）
const displayedOrders = computed(() => {
  let filtered = orders.value.filter(order => {
    if (filter.value.distance === 'all') return true
    return order.distance <= parseInt(filter.value.distance)
  })
  return filtered.slice(0, 6)
})

// 跳转到订单详情页
const goToOrderDetail = async (id) => {
  await orderStore.matchOrder(id); 
  // 跳转到 接单页面，发出接单请求    
  routerPush({ path: '/ride/grab' });
  window.$message?.success("接单成功，详细前往接单页")
}
// 应用筛选
const applyFilter = () => {
  console.log(`应用筛选: ${filter.value.distance}公里`)
}

// 查看更多
const showMore = () => {
  routerPush({ path: '/ride/grab' }) // 可选：跳转到完整列表页
}

const appStore = useAppStore();

// 刷新订单
const refreshOrders = async () => {
  if (role.value === 'driver') {
    await orderStore.fetchTasks();
    window.$message?.success("刷新成功");
    // 重新加载页面
    appStore.reloadPage();
  }
}

</script>

<template>
  <div ref="backgroundSection" class="min-h-screen overflow-hidden bg-gradient-to-b from-dark-800 to-dark-900 text-light-50 bg-cover bg-center bg-fixed" :style="{ backgroundImage: `url(${carImg})` }">
    <div class="absolute inset-0 bg-black/35 h-[200%]"></div>
    <!-- 主要内容区 -->
    <main class="pt-12 sm:pt-16 pb-8 sm:pb-10 px-2 sm:px-4 relative">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-30 -right-30 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-20 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>
      <div class="mx-auto w-[95%] sm:w-[90%] max-w-7xl mb-10 bg-light-50/5 
            rounded-none sm:rounded-3xl shadow-2xl border border-light-50/10 relative
            sm:backdrop-blur-xl backdrop-blur-2xl">

        <!-- 搜索区域 -->
        <section v-if="role !== 'driver'" class="p-4 sm:p-8 md:p-12 relative">
          <!-- 搜索区域背景装饰 -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/3 rounded-t-3xl"></div>
          <div class="max-w-3xl mx-auto bg-light-50/5 rounded-2xl p-4 sm:p-8 
                      shadow-lg border-light-50/10 relative sm:backdrop-blur-xl">
            <div class="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <h2 class="text-xl sm:text-2xl font-semibold text-center">发布订单</h2>
            </div>
            <el-form :model="searchForm" ref="searchFormRef">
              <div class="grid md:grid-cols-2 gap-4 sm:gap-6">
                <el-form-item label="出发地" prop="start">
                  <el-input v-model="searchForm.start" placeholder="请输入出发地">
                    <template #prefix>
                      <div class="i-ep-position text-purple-400"></div>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="目的地" prop="end">
                  <el-input v-model="searchForm.end" placeholder="请输入目的地">
                    <template #prefix>
                      <div class="i-ep-location text-purple-400"></div>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="出发时间" prop="time">
                  <el-date-picker v-model="searchForm.time" type="datetime" 
                                placeholder="选择时间（可选）" class="!w-full" />
                </el-form-item>
                <div class="flex items-start">
                  <el-button type="primary" class="w-full !bg-gradient-to-r !from-purple-500 !to-pink-500 
                                                  hover:(!opacity-90) transition-opacity" 
                            @click="searchRide">
                    <div class="i-ep-search mr-2"></div>
                    开始拼车
                  </el-button>
                </div>
              </div>
            </el-form>
          </div>
        </section>

        <!-- 司机待接单列表 -->
        <section v-if="role === 'driver'" class="px-4 sm:p-8 md:p-10 relative section-with-bottom-line">
          <!-- 标题和刷新按钮 -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 sm:pt-8 sm:pr-8 sm:pl-8 gap-4 sm:gap-0 bg-black/1">
            <h2 class="text-xl sm:text-3xl font-semibold text-gray-100 truncate">可接订单列表</h2>
            <button @click="refreshOrders" class="flex items-center justify-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-[#E5D3A7] bg-opacity-10 text-[#F5E5B7] shadow-inner shadow-gray-500/20 hover:bg-opacity-30 hover:shadow-gray-500/40 hover:shadow-[0_0_15px_rgba(245,229,183,0.5)] transition-all duration-300 w-full sm:w-auto">
              <SvgIcon ref="refreshIcon" icon="mdi:refresh" class="w-5 h-5 sm:w-6 sm:h-6 text-[#F5E5B7] hover:text-[#FFFFFF] transition-colors duration-300" />
              <span class="text-sm sm:text-base font-medium text-[#F5E5B7] hover:text-[#FFFFFF] transition-colors duration-300">刷新</span>
            </button>
          </div>
          <div v-if="displayedOrders.length > 0" class="max-w-7xl mx-auto rounded-2xl p-6 sm:p-8">
            <!-- 筛选 -->
            <div class="mb-8 flex justify-center sm:justify-start px-4">
              <div class="relative w-full max-w-xs">
                <span class="absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg class="w-6 h-6 text-[#C9B68B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                </span>
                <select v-model="filter.distance" @change="applyFilter" 
                        class="w-full bg-black/60 border border-[#C9B68B]/20 rounded-lg p-4 pl-12 text-[#F5E5B7] text-basefocus:ring-[#C9B68B] hover:bg-black/70 hover:border-[#C9B68B]/40 hover:shadow-[0_0_10px_rgba(201,182,139,0.3)] transition-all duration-300">
                  <option value="2" class="bg-black/80 text-[#F5E5B7]">2公里内</option>
                  <option value="5" class="bg-black/80 text-[#F5E5B7]">5公里内</option>
                  <option value="10" class="bg-black/80 text-[#F5E5B7]">10公里内</option>
                  <option value="all" class="bg-black/80 text-[#F5E5B7]">全部</option>
                </select>
              </div>
            </div>

            <!-- 订单列表 -->
            <div class="space-y-3 sm:space-y-6">
              <div v-for="(order, index) in orders" :key="order._id" 
                  class="order-card flex flex-col sm:flex-row sm:items-center sm:justify-between bg-black/50 p-2 sm:p-4 rounded-xl border border-gray-800/50 sm:border-2 hover:bg-black/70 hover:bg-gradient-to-r hover:from-[#C9B68B]/10 hover:to-[#E5D3A7]/10 hover:border-[#C9B68B]/50 hover:shadow-[0_0_15px_rgba(201,182,139,0.2)] transition-all duration-300 relative">
                <!-- 装饰线条 -->
                <div v-if="index !== 0" class="absolute -top-2 sm:-top-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9B68B]/30 to-transparent"></div>
                
                <!-- 移动端两列布局，桌面端四列布局 -->
                <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-gray-200">
                  <!-- 第一行：出发地和目的地 -->
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide leading-tight">出发地</p>
                    <p class="font-medium text-gray-100 text-sm sm:text-base leading-tight">{{ order.startAddress }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide leading-tight">目的地</p>
                    <p class="font-medium text-gray-100 text-sm sm:text-base leading-tight">{{ order.endAddress }}</p>
                  </div>
                  <!-- 第二行：距离和预计收入 -->
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide leading-tight">距离</p>
                    <p class="font-medium text-gray-100 text-sm sm:text-base leading-tight">{{ order.distance }}公里</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide leading-tight">预计收入</p>
                    <p class="font-semibold text-[#C9B68B] bg-[#C9B68B]/10 px-1.5 sm:px-3 py-0.5 rounded-md inline-block text-sm sm:text-base leading-tight">
                      ￥{{ order.totalPrice }}
                    </p>
                  </div>
                </div>
                <!-- 按钮区域：移动端居中，桌面端靠右 -->
                <div class="flex justify-center sm:justify-end items-center space-x-1 mt-2 sm:mt-0 sm:space-x-1">
                  <button 
                    @click="goToOrderDetail(order._id)"
                    class="accept-btn w-full sm:w-auto max-w-100% sm:max-w-none bg-gradient-to-r from-[#C9B68B] to-[#E5D3A7] text-black px-3 sm:px-6 py-2 sm:py-2 rounded-lg border border-[#C9B68B]/50 hover:shadow-lg hover:shadow-[#C9B68B]/30 text-sm transition-all duration-300"
                  >
                    接单
                  </button>
                </div>
              </div>
            </div>

            <!-- 查看更多 -->
            <div class="text-center mt-10" v-if="orders.length > 6">
              <button @click="showMore" 
                      class="more-btn px-8 py-3 border border-[#C9B68B]/50 text-[#C9B68B] rounded-lg bg-transparent hover:bg-gradient-to-r hover:from-[#C9B68B]/20 hover:to-[#E5D3A7]/20 hover:shadow-lg hover:shadow-[#C9B68B]/30 transition-all duration-300">
                查看更多订单
              </button>
            </div>
          </div>
          <!-- 如果没有订单，显示占位内容 -->
          <div v-else class="flex items-center justify-center min-h-[400px] bg-black/50 rounded-xl border border-gray-800/50">
            <div class="flex flex-col items-center space-y-4">
              <!-- 大图标 -->
              <SvgIcon icon="mdi:package-variant-closed" class="w-24 h-24 text-[#C9B68B]" />
              <!-- 提示文字 -->
              <p class="text-xl text-gray-400 font-medium">暂无订单</p>
              <p class="text-sm text-gray-500">请稍后再试或调整筛选条件</p>
            </div>
          </div>
        </section>

        <!-- 热门路线 -->
        <section v-if="role === 'passenger'" class="px-4 sm:px-8 md:px-12 py-6 sm:py-8 bg-gradient-to-b from-[#D4B992]/10 to-transparent relative overflow-hidden">
          <!-- 标题部分 -->
          <div ref="hotRoutesTitle" class="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 relative">
            <SvgIcon icon="mdi:crown" class="text-2xl sm:text-3xl text-[#FFD700]" />
            <h3 class="text-xl sm:text-2xl font-semibold text-center text-[#FFD700] text-neon">热门拼车路线</h3>
          </div>
          <!-- 卡片列表 -->
          <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div
              v-for="route in hotRoutes"
              :key="route.id"
              ref="hotRouteCards"
              class="group relative bg-[#D4B992]/5 rounded-2xl p-4 sm:p-6 cursor-pointer 
                    border border-[#D4B992]/30 transition-all duration-300
                    hover:(transform -translate-y-2 border-[#FFD700]/50)
                    sm:backdrop-blur-xl overflow-hidden"
              @mouseenter="handleCardHover"
            >
              <!-- 动态渐变背景（hover 时显示，调整颜色） -->
              <div class="absolute inset-0 bg-gradient-to-r from-[#EAD9B5]/5 via-[#D4B992]/5 to-[#EAD9B5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-flow"></div>
              <!-- 金色光晕（hover 时显示） -->
              <div class="absolute inset-0 rounded-2xl bg-[#FFD700]/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
              <!-- 卡片内容 -->
              <div class="relative flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div class="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#D4B992]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SvgIcon icon="mdi:ev-plug-ccs1" class="text-2xl sm:text-3xl text-[#FFD700] group-hover:(rotate-12)" />
                </div>
                <div class="flex-1">
                  <div class="text-base sm:text-lg font-medium text-[#E8B923] group-hover:text-[#FFD700] transition-colors duration-300 animate-bounce-on-hover">
                    {{ route.start }} - {{ route.end }}
                  </div>
                </div>
              </div>
              <div class="relative flex justify-between items-center mt-3 sm:mt-4 text-[#FFFFFF]">
                <span class="flex items-center gap-1 sm:gap-2 text-sm sm:text-base animate-bounce-on-hover">
                  <SvgIcon icon="mdi:google-maps" class="text-[#E8B923] group-hover:text-[#FFD700] transition-colors duration-300" />
                  {{ route.distance }} 公里
                </span>
                <span class="flex items-center gap-1 sm:gap-2 text-[#FFD700] text-sm sm:text-base">
                  <SvgIcon icon="mdi:cash" />
                  {{ route.price }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 平台优势 -->
        <section class="px-4 sm:px-8 md:px-12 py-8 sm:py-14 border-light-50/10">
          <div class="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <SvgIcon icon="mdi:star-circle-outline" class="text-2xl sm:text-3xl text-purple-400" />
            <h3 class="text-xl sm:text-2xl font-semibold text-center">为什么选择我们</h3>
          </div>
          <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <div
              v-for="benefit in benefits"
              :key="benefit.text"
              ref="benefitCards"
              class="benefit-card bg-light-50/5 rounded-2xl p-6 sm:p-8 text-center 
                    border border-light-50/10 transition-all duration-500
                    hover:(border-purple-500/50 shadow-xl glow-effect)"
            >
              <div class="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <SvgIcon :icon="benefit.icon" class="text-xl sm:text-2xl text-purple-400" />
              </div>
              <h3 class="text-light-50 font-semibold text-base sm:text-lg mb-2">{{ benefit.title }}</h3>
              <p class="text-light-50 font-medium text-sm sm:text-base">{{ benefit.text }}</p>
              <!-- 粒子效果容器 -->
              <div class="particle-container absolute inset-0 pointer-events-none overflow-hidden">
                <div v-for="n in 5" :key="n" class="particle absolute w-1 h-1 bg-purple-400 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 关于 -->
      <div class="mx-auto w-[95%] sm:w-[90%] max-w-7xl mb-10 bg-light-50/5 
            rounded-2xl sm:rounded-3xl relative
            sm:backdrop-blur-xl">
        <section ref="aboutSection" class="px-4 sm:px-8 md:px-12 py-12 sm:py-16 relative overflow-hidden">
          <!-- 背景：毛玻璃效果 -->
          <div class="absolute inset-0 bg-gradient-to-b from-dark-700/40 to-black/50 backdrop-blur-12 rounded-2xl supports-[backdrop-filter]:bg-opacity-50"></div>
          <!-- 背景装饰 -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-10 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div class="absolute bottom-10 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-gray-900/20 rounded-full blur-3xl animate-pulse-slow"></div>
          </div>

          <!-- 标题 -->
          <div ref="titleSection" class="flex items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16 relative z-10">
            <SvgIcon icon="mdi:information-outline" class="text-2xl sm:text-3xl text-yellow-500" />
            <h3 class="text-xl sm:text-2xl font-semibold text-center text-yellow-500 relative">
              关于我们
              <!-- 标题下方的金色线条 -->
              <span ref="titleLine" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-[0_0_5px_rgba(234,179,8,0.3)]"></span>
            </h3>
          </div>

          <!-- 内容 -->
          <div class="max-w-7xl mx-auto relative z-10">
            <!-- 主内容网格布局 -->
            <div class="grid md:grid-cols-5 gap-8 sm:gap-12">
              <!-- 左侧：我们的使命 -->
              <div ref="missionSection" class="md:col-span-2 relative">
                <div class="relative py-8 px-6 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
                  <!-- 动态光晕 -->
                  <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl animate-pulse-slow"></div>

                  <h4 class="text-3xl sm:text-4xl font-bold text-yellow-500 mb-4 relative z-10">
                    我们的使命
                    <!-- 标题下方的细线 -->
                    <span ref="missionLine" class="absolute bottom-0 left-0 w-12 h-px bg-gradient-to-r from-yellow-500 to-transparent"></span>
                  </h4>
                  <p class="text-gray-200 text-base sm:text-lg leading-relaxed relative z-10">
                    连接每一位旅途中的伙伴，减少碳排放，创造更环保、更高效的出行方式，让每一次出行都充满温暖与信任。
                  </p>
                  <!-- 粒子效果 -->
                  <div class="absolute inset-0 pointer-events-none overflow-hidden">
                    <div v-for="n in 6" :key="n" class="particle absolute w-1 h-1 bg-yellow-500 rounded-full opacity-50"></div>
                  </div>
                </div>
              </div>

              <!-- 右侧：特点列表 -->
              <div class="md:col-span-3 relative space-y-10 sm:space-y-12">
                <!-- 贯穿的垂直线条 -->
                <div ref="verticalLine" class="absolute top--7 left--5 w-1 h-[120%] bg-yellow-500/30 transition-colors duration-300"></div>

                <!-- 特点列表 -->
                <div v-for="(feature, index) in features" :key="index" class="relative group">
                  <div class="flex items-start gap-4 sm:gap-6">
                    <div :ref="(el) => (featureIcons[index] = el)" :class="feature.bgClass" class="w-12 h-12 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                      <SvgIcon :icon="feature.icon" class="text-2xl text-yellow-500 animate-pulse-slow" />
                    </div>
                    <div class="flex-1">
                      <h4 :ref="(el) => (featureTitles[index] = el)" class="text-lg sm:text-xl font-medium text-yellow-500 mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                        {{ feature.title }}
                      </h4>
                      <p :ref="(el) => (featureDescriptions[index] = el)" class="text-gray-200 text-sm sm:text-base leading-relaxed group-hover:text-gray-100 transition-colors duration-300">
                        {{ feature.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 结语 -->
            <div ref="footerSection" class="mt-12 sm:mt-16 text-center">
              <!-- 分隔线 -->
              <div class="relative mb-8">
                <div ref="footerLine" class="w-32 h-px bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-[0_0_5px_rgba(234,179,8,0.3)] mx-auto"></div>
              </div>
              <p class="text-gray-200 text-base sm:text-lg leading-relaxed mb-6">
                加入我们的拼车社区，与志同道合的伙伴一起，探索更智能、更环保的出行方式！让我们一起为绿色未来努力。
              </p>
              <!-- 动画图标链接 -->
              <div class="mt-6">
                <a href="#" class="group inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors duration-300">
                  <span class="text-base sm:text-lg font-medium">立即加入</span>
                  <SvgIcon icon="mdi:arrow-right" class="text-3xl transform group-hover:rotate-45 group-hover:scale-110 transition-all duration-300" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
<style scoped>
/* 筛选框聚焦动画 */
.filter-select:focus {
  box-shadow: 0 0 10px rgba(201, 182, 139, 0.3);
}
/* 接单按钮 hover 动画 */
.accept-btn {
  transition: all 0.05s ease;
}
.accept-btn:hover {
  box-shadow: 0 0 15px rgba(201, 182, 139, 0.5);
}
/* 刷新按钮 hover 动画 */
.refresh-btn {
  transition: all 0.3s ease;
}
.refresh-btn:hover {
  box-shadow: 0 0 10px rgba(201, 182, 139, 0.3);
}
.section-with-bottom-line::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-image: linear-gradient(to right, transparent, rgba(201, 182, 139, 0.3), transparent);
}
/* 查看更多按钮 hover 动画 */
.more-btn {
  transition: all 0.3s ease;
}
.more-btn:hover {
  box-shadow: 0 0 15px rgba(201, 182, 139, 0.3);
}

/* 霓虹灯效果 */
.text-neon {
  text-shadow: 
    0 0 5px rgba(255, 215, 0, 0.5),
    0 0 10px rgba(255, 215, 0, 0.4),
    0 0 20px rgba(255, 215, 0, 0.3);
  animation: neonGlow 2s ease-in-out infinite alternate;
}

@keyframes neonGlow {
  from {
    text-shadow: 
      0 0 5px rgba(255, 215, 0, 0.4),
      0 0 10px rgba(255, 215, 0, 0.2),
      0 0 20px rgba(255, 215, 0, 0.1);
  }
  to {
    text-shadow: 
      0 0 10px rgba(255, 215, 0, 0.6),
      0 0 20px rgba(255, 215, 0, 0.4),
      0 0 30px rgba(255, 215, 0, 0.3);
  }
}

/* Hover 时的跳动效果 */
.animate-bounce-on-hover {
  display: inline-block;
}

.group:hover .animate-bounce-on-hover {
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 光晕脉动动画 */
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}

.animate-pulse-slow {
  animation: pulse-slow 10s ease-in-out infinite;
}

/* 粒子动画 */
@keyframes particle {
  0% { transform: translate(0, 0); opacity: 0.5; }
  50% { opacity: 1; }
  100% { transform: translate(40px, -40px); opacity: 0; }
}

.particle {
  animation: particle 6s infinite;
}
.particle:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.particle:nth-child(2) { top: 30%; left: 80%; animation-delay: 1s; }
.particle:nth-child(3) { top: 50%; left: 10%; animation-delay: 2s; }
.particle:nth-child(4) { top: 70%; left: 90%; animation-delay: 3s; }
.particle:nth-child(5) { top: 20%; left: 50%; animation-delay: 4s; }
.particle:nth-child(6) { top: 80%; left: 30%; animation-delay: 5s; }

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

:deep(.el-input__wrapper) {
  @apply !bg-light-50/10 !shadow-none !border-light-50/20;
}

:deep(.el-input__inner) {
  @apply !text-light-50;
}

:deep(.el-form-item__label) {
  @apply !text-light-50;
}

:deep(.el-drawer) {
  @apply !bg-transparent;
}

:deep(.el-drawer__body) {
  @apply !p-0;
  height: 100vh;
  overflow-y: auto;
}


/* 确保内容不会被模糊 */
.el-drawer__body {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* 移动端调整字体和间距 */
@media (max-width: 640px) {
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
  :deep(.el-input__inner) {
    font-size: 14px;
    height: 36px;
    line-height: 36px;
  }
}
/* 桌面端调整 */
@media (min-width: 641px) {
  :deep(.el-form-item__label) {
    font-size: 16px;
  }
  :deep(.el-input__inner) {
    font-size: 16px;
  }
}
</style>