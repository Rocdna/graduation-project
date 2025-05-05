<script lang="ts" setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/store/modules/notification';
import { formatToLocal } from '@/utils/format';

const route = useRouter();

const authStore = useAuthStore();
const role = authStore.userInfo.role;

const { getNotificationList, markAsRead, state } = useNotificationStore();

const { toLogin, toggleLoginModule, routerPush } = useRouterPush();

const unreadList = computed(() => state.notifications.filter(n => !n.isRead));


// 状态
const isLoggedIn = computed(() => !!authStore.token);
const isMobileMenuOpen = ref(false);
const activeName = computed(() => route.currentRoute.value.name); // 默认高亮的导航项

// 导航项
const navItems = computed(() => {
  return [
    {
      icon: 'mdi:home-outline',
      title: '首页',
      path: '/',
      name: 'home',
    },
    {
      icon: 'mdi:car-outline',
      title: role !== 'driver' ? '拼车' : '接单',
      path: role !== 'driver' ? '/ride/carpool' : '/ride/grab',
      name: role !== 'driver' ? 'ride_carpool' : 'ride_grab'
    },
    {
      icon: 'mdi:clipboard-text-outline',
      title: '我的订单',
      path: '/ride/order',
      name: 'ride_order'
    },
    {
      icon: 'mdi:comment-text',
      title: '我的评价',
      path: '/ride/review',
      name: 'ride_review'
    }
  ]
})


// 用户基本信息
const user = computed(() => {
  return {
    username: authStore.userInfo.username || '未登录',
    avatar: authStore.userInfo.profile?.avatar || 'https://www.win3000.com/pic/10707_2.html',
    status: authStore.userInfo.profile?.status || 'offline'
  };
});

// 计算状态小点的颜色
const statusColor = computed(() => {
  switch (user.value.status) {
    case 'online':
      return '#52c41a'; // 绿色
    case 'locked':
      return '#bfbfbf'; // 灰色
    case 'offline':
      return '#f5222d'; // 红色
    default:
      return '#bfbfbf';
  }
});

// 导航选择事件
const handleNavSelect = (path: string, name: string) => {
  // TODO: 导航跳转逻辑
  routerPush({ path });
};

// 跳转到登录页
const login = () => {
  // TODO: 登录逻辑
  toLogin();
};
// 跳转到注册页面
const register = () => {
  // TODO: 注册逻辑
  toggleLoginModule('register')
};
// 退出登录
const logout = () => {
  window.$messageBox
    ?.confirm('您确认要退出登录吗吗?', '退出登录', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      authStore.resetStore();
    }).then(() => {
      window.$notification?.success({
          title: "退出登录",
          message: "退出成功",
          duration: 2500,
          position: 'top-right'
      });
      // 刷新页面
      routerPush({ name: 'login' })
    })
};
// 个人中心
const goToProfile = () => {
  // TODO: 跳转到个人资料页面
  routerPush({ name: 'ride_profile' });
};

// 通知类型
type MessageType = 
  | 'system'
  | 'order'
  | 'payment'
  | 'review'
  | 'trip'
  | 'order_matched'
  | 'order_confirmed'
  | 'order_cancelled'
  | 'order_completed';

// 通知类型颜色映射
const messageTypeColors: Record<MessageType, string> = {
  system: 'bg-purple-500',         // 系统消息：紫色
  order: 'bg-blue-500',           // 订单提醒：蓝色
  payment: 'bg-green-500',        // 支付通知：绿色
  review: 'bg-yellow-500',        // 评价通知：黄色
  trip: 'bg-teal-500',           // 行程通知：青色
  order_matched: 'bg-indigo-500', // 订单匹配：靛蓝
  order_confirmed: 'bg-cyan-500', // 订单确认：青蓝
  order_cancelled: 'bg-red-500',  // 订单取消：红色
  order_completed: 'bg-emerald-500' // 订单完成：碧绿
};

// 通知类型文本映射
const messageTypeText: Record<MessageType, string> = {
  system: '系统消息',
  order: '订单提醒',
  payment: '支付通知',
  review: '评价通知',
  trip: '行程通知',
  order_matched: '订单匹配',
  order_confirmed: '订单确认',
  order_cancelled: '订单取消',
  order_completed: '订单完成'
};

// 通知类型图标映射（可选，增加视觉区分度）
const messageTypeIcons: Record<MessageType, string> = {
  system: 'mdi:information-outline', // 系统消息：信息图标
  order: 'mdi:cart-outline',        // 订单提醒：购物车
  payment: 'mdi:credit-card-outline', // 支付通知：信用卡
  review: 'mdi:star-outline',       // 评价通知：星星
  trip: 'mdi:map-outline',          // 行程通知：地图
  order_matched: 'mdi:check',       // 订单匹配：勾选
  order_confirmed: 'mdi:check-circle-outline', // 订单确认：圆形勾选
  order_cancelled: 'mdi:close-circle-outline', // 订单取消：圆形叉号
  order_completed: 'mdi:trophy-outline' // 订单完成：奖杯
};

// 获取通知类型颜色
const getMessageColor = (type: MessageType | undefined) => {
  return type ? messageTypeColors[type] : 'bg-gray-500';
};

// 获取通知类型文本
const getMessageTypeText = (type: MessageType | undefined) => {
  return type ? messageTypeText[type] : '未知类型';
};

// 获取通知类型图标
const getMessageIcon = (type: MessageType | undefined): string => {
  return type ? messageTypeIcons[type] : 'fa-question-circle';
};

// 控制弹窗显示
const dialogVisible = ref(false);
const selectedMessage = ref<any>(null);

// 当前通知
const currentNotiId = ref('');

// 显示消息详情
const showMessageDetail = (noti: any) => {
  selectedMessage.value = noti;
  dialogVisible.value = true;
  currentNotiId.value = noti.id
};

// 检测是否为移动端
const isMobile = computed(() => {
  return window.innerWidth < 640; // sm 断点为 640px
});

// 标记消息为已读并关闭弹窗
const markAsReadAndClose = async () => {
  if (selectedMessage.value) {
    await markAsRead(currentNotiId.value);
    window.$message?.success('消息已标记为已读');
  }
  dialogVisible.value = false;
  selectedMessage.value = null;
};


const effectFlag = computed(() => {
  return authStore.userInfo.bgEffect;
})

// 全局特效开关
const bgEffectSwitch = () => {
  authStore.updateBgEffectSettings(!effectFlag.value as boolean);
}


const socket = inject('socket') as any;

onMounted(async () => {
  if (authStore.isLogin) {
    await getNotificationList();
    if (socket) {
      (socket as any).connect();
      console.log('WebSocket 连接成功');
    }
  }
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    console.log('WebSocket 已断开');
  }
})

</script>

<template>
  <!-- 头部导航 -->
  <header class="bg-gray-900 backdrop-blur-xl border-b border-gray-800/50 text-gray-300 sticky top-0 left-0 right-0 z-50">
    <div class="mx-auto px-4 max-w-7xl">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Logo -->
        <h1
          class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text cursor-pointer text-transparent whitespace-nowrap animate-gradient-flow"
          @click="routerPush({ name: 'home' })"
        >
          拼途灵动
        </h1>
        <!-- 桌面端导航 -->
        <nav class="hidden lg:flex-1 lg:flex lg:justify-center space-x-6">
          <a
            v-for="nav in navItems"
            :key="nav.name"
            :class="[
              'px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-300',
              activeName === nav.name ? 'text-white bg-gray-700/60' : ''
            ]"
            @click.prevent="handleNavSelect(nav.path, nav.name)"
          >
            <SvgIcon :icon="nav.icon" class="text-xl text-purple-400 mr-1 inline-block transform hover:scale-110 transition-transform" />
            {{ nav.title }}
          </a>
        </nav>

        <!-- 移动端菜单按钮 -->
        <div class="lg:hidden">
          <el-button
            class="!bg-transparent hover:!bg-gray-800/30 !border-none !p-3 !h-auto transition-colors"
            @click="isMobileMenuOpen = true"
          >
            <SvgIcon icon="mdi:menu" class="text-2xl text-gray-300" />
          </el-button>
        </div>

        <!-- 用户操作区 -->
        <div v-if="!isLoggedIn" class="flex gap-2 md:gap-3 shrink-0">
          <el-button class="!bg-transparent !border-gray-500/70" @click="login">登录</el-button>
          <el-button class="!bg-gradient-to-r !from-purple-500 !to-pink-500 border-none" type="primary" @click="register">
            注册
          </el-button>
        </div>
        <div v-else class="flex items-center gap-2 md:gap-3 shrink-0">
          <!-- 全屏特效开关 -->
          <div class="cursor-pointer" @click="bgEffectSwitch">
            <SvgIcon v-if="effectFlag" icon="mdi:star-david" class="w-8 h-8 text-gray-300 hover:text-yellow-500 transition-colors duration-300"/>
            <SvgIcon v-else icon="mdi:star-shooting-outline" class="w-8 h-8 text-gray-300 hover:text-emerald-400 transition-colors duration-300" />
          </div>
          <!-- 通知信息 -->
          <el-popover
          :placement="isMobile ? 'top' : 'bottom'"
            :width="isMobile ? '90vw' : 300"
            :trigger="isMobile ? 'click' : 'hover'"
            popper-class="message-popover bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
            effect="dark"
          >
            <!-- 消息图标和未读消息数量 -->
            <template #reference>
              <div class="relative cursor-pointer mr-4">
                <el-badge :value="unreadList.length" :max="99" :offset="[-5, 5]" badge-class="bg-red-500 text-white border-none w-16px h-16px">
                  <SvgIcon icon="mdi:bell-outline" class="w-8 h-8 text-gray-300 hover:text-blue-500 transition-colors duration-300"></SvgIcon>
                </el-badge>
              </div>
            </template>

            <!-- 未读消息列表 -->
            <template #default>
              <div class="p-2 sm:p-3 max-h-60 sm:max-h-80 overflow-y-auto">
                <div v-if="unreadList.length === 0" class="text-gray-400 text-center py-3 sm:py-4 text-xs sm:text-sm">
                  暂无未读消息
                </div>
                <div
                  v-else
                  v-for="noti in unreadList"
                  :key="noti.id"
                  class="py-2 sm:py-3 px-3 sm:px-4 mb-1 sm:mb-2 last:mb-0 min-h-12 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors duration-200 flex items-start"
                  @click="showMessageDetail(noti)"
                >
                  <div class="flex-1">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div class="flex-1">
                        <div
                          class="text-sm sm:text-base font-extrabold flex items-center"
                          :class="{
                            'text-blue-400': noti.type === 'order',
                            'text-green-400': noti.type === 'payment',
                            'text-yellow-400': noti.type === 'review',
                            'text-purple-400': noti.type === 'system',
                            'text-teal-400': noti.type === 'trip',
                            'text-indigo-400': noti.type === 'order_matched',
                            'text-cyan-400': noti.type === 'order_confirmed',
                            'text-red-400': noti.type === 'order_cancelled',
                            'text-emerald-400': noti.type === 'order_completed',
                            'text-gray-100': !noti.type
                                      }"
                        >
                          <SvgIcon :icon="getMessageIcon(noti.type)" class="text-sm sm:text-base mr-2" />
                          {{ noti.title }}
                        </div>
                        <div class="text-2xs sm:text-xs text-gray-300 mt-1 line-clamp-2">{{ noti.message }}</div>
                      </div>
                      <div class="text-2xs sm:text-xs text-gray-400 mt-1 sm:mt-0 sm:ml-3 whitespace-nowrap">{{ formatToLocal(noti.createdAt) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-popover>

          <!-- 使用 el-dropdown 重构用户操作 -->
          <el-dropdown trigger="click">
            <div class="flex items-center cursor-pointer">
                <div class="relative">
                  <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 relative overflow-hidden ripple-effect transform transition-transform duration-300">
                    <img v-if="user.avatar" :src="user.avatar" class="w-full h-full rounded-full" alt="User Avatar" />
                    <span v-else class="text-gray-300">{{ user.username[0] }}</span>
                  </div>
                  <span
                    :style="{ backgroundColor: statusColor }"
                    class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-950 animate-breathe"
                  ></span>
                </div>
               
              <span class="hidden sm:inline text-gray-300 ml-2 text-13px">
                你好, {{ user.username }}
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">个人资料</el-dropdown-item>
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>

  <!-- 消息详情弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="selectedMessage?.title"
    :width="isMobile ? '90%' : '50%'"
    class="message-dialog bg-white/86 rounded-lg shadow-lg"
    :before-close="() => (dialogVisible = false)"
    modal-class="backdrop-blur-sm bg-black/50"
    body-class="bg-gray-6"
  >
    <template #header>
      <div :class="getMessageColor(selectedMessage?.type)" class="text-white px-4 py-2 rounded-t-lg">
        <span class="text-base font-semibold">{{ selectedMessage?.title }}</span>
      </div>
    </template>
    <div class="p-4 sm:p-6">
      <div class="text-sm text-gray-700 mb-3 sm:mb-4">
        <span class="font-semibold">类型：</span>
        <span :class="getMessageColor(selectedMessage?.type)" class="px-2 py-1 rounded text-white text-xs">
          {{ getMessageTypeText(selectedMessage?.type) }}
        </span>
      </div>
      <div class="text-sm text-gray-700 mb-3 sm:mb-4">
        <span class="font-semibold">内容：</span>{{ selectedMessage?.message }}
      </div>
      <div class="text-sm text-gray-700">
        <span class="font-semibold">时间：</span>{{ formatToLocal(selectedMessage?.createdAt) }}
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="dialogVisible = false" class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
          关闭
        </el-button>
        <el-button
          @click="markAsReadAndClose"
          type='primary'
          class="px-4 py-2 rounded"
        >
          标记为已读
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 移动端抽屉菜单 -->
  <el-drawer
    v-model="isMobileMenuOpen"
    direction="ttb"
    size="100%"
    :show-close="false"
    :with-header="false"
    :modal-class="'!bg-black/60'"
    class="!bg-transparent"
  >
    <div class="bg-gray-950 min-h-full">
      <div class="flex justify-between items-center p-4">
        <h1 class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          拼途灵动
        </h1>
        <el-button class="!bg-transparent !border-none" @click="isMobileMenuOpen = false">
          <SvgIcon icon="mdi:close" class="text-2xl text-gray-300" />
        </el-button>
      </div>
      <nav class="flex flex-col p-4">
        <a
          v-for="nav in navItems"
          :key="nav.name"
          :class="[
            'flex items-center gap-3 text-lg p-4 rounded-lg text-gray-300 hover:text-white transition-all duration-300 mb-2',
            activeName === nav.name ? 'text-white bg-gray-800/50' : ''
          ]"
          @click.prevent="handleNavSelect(nav.path, nav.name); isMobileMenuOpen = false"
        >
          <SvgIcon :icon="nav.icon" class="text-xl text-purple-400 mr-1 inline-block transform hover:scale-110 transition-transform" />
          {{ nav.title }}
        </a>
      </nav>
    </div>
  </el-drawer>
</template>

<style scoped>
/* 自定义导航样式和动画 */
nav a {
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

nav a:hover {
  transform: scale(1.05);
  background-color: rgba(255, 255, 255, 0.155);
  cursor: pointer;
}

nav a.active {
  background-color: rgba(128, 128, 128, 0.3);
  color: #ffffff;
}

/* 状态点呼吸动画 */
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.animate-breathe {
  animation: breathe 3s ease-in-out infinite;
}

/* 渐变流动动画 */
.animate-gradient-flow {
  background-size: 200% 100%; /* 背景大小设置为 200%，便于流动 */
  background-image: linear-gradient(to right, #a78bfa, #ec4899, #a78bfa); /* 紫色到粉色，再回到紫色，形成循环 */
  animation: gradientFlow 4s linear infinite; /* 动画：4秒，线性，无限循环 */
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%; /* 起始位置 */
  }
  100% {
    background-position: 200% 50%; /* 结束位置，背景向右移动 */
  }
}

/* 涟漪动画 */
.ripple-effect {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.ripple-effect:hover {
  transform: scale(1.1); /* 鼠标悬浮时放大 10% */
  box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.5), /* 紫色涟漪 */
              0 0 0 10px rgba(236, 72, 153, 0.3), /* 粉色涟漪 */
              0 0 0 20px rgba(167, 139, 250, 0.1); /* 渐变涟漪 */
  animation: ripple 1.5s infinite;
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.5),
                0 0 0 10px rgba(236, 72, 153, 0.3),
                0 0 0 20px rgba(167, 139, 250, 0.1);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(167, 139, 250, 0),
                0 0 0 20px rgba(236, 72, 153, 0),
                0 0 0 30px rgba(167, 139, 250, 0);
  }
}

/* 响应式调整 */
@media (max-width: 1024px) {
  nav a {
    justify-content: center;
  }
}
</style>
