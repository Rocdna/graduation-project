<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import gsap from 'gsap'

const props = defineProps({
  orderAmount: { type: [String, Number], required: true },
  discount: { type: Number, default: 0.1 },
  paymentMethods: {
    type: Array,
    default: () => [
      { label: '微信', value: 'wechat', icon: null },
      { label: '支付宝', value: 'alipay', icon: null },
      { label: '银行卡', value: 'bank', icon: null }
    ]
  },
  visible: { type: Boolean, default: true }
});

const emit = defineEmits(['confirm-payment', 'update:visible']);

// 将 orderAmount 转换为数值
const parsedOrderAmount = computed(() => {
  const amount = parseFloat(props.orderAmount);
  return isNaN(amount) ? 0 : amount;
});

const isMobile = ref(false);
const selectedMethod = ref(props.paymentMethods[0]?.value || '');

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

checkScreenSize();

// GSAP 动画
const cardRef = ref(null);
// 本地响应式变量，用于绑定 v-model
const localVisible = ref(props.visible);

// 出现动画
const showAnimation = () => {
  if (cardRef.value) {
    gsap.fromTo(
      cardRef.value,
      { scale: 0.8, opacity: 0, yPercent: 20 },
      { scale: 1, opacity: 1, yPercent: 0, duration: 0.8, ease: 'power3.out' }
    );
  }
};

// 离开动画
const hideAnimation = () => {
  if (cardRef.value) {
    gsap.to(cardRef.value, {
      scale: 0.8,
      opacity: 0,
      yPercent: 20,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: () => {
        localVisible.value = false; // 动画完成后隐藏卡片
      }
    });
  }
};

// 同步 props.visible 和 localVisible
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        localVisible.value = false;
      }, 500);
    } else 
      localVisible.value = newVal;
  }
);

// 当 localVisible 变化时，通知父组件更新 visible
watch(
  localVisible,
  (newVal) => {
    emit('update:visible', newVal);
  }
);

// 监听 visible 变化，触发动画
watch(
  () => props.visible,
  (newVal) => {
    if (!isMobile.value) { // 仅桌面端需要自定义动画
      if (newVal) {
        showAnimation();
      } else {
        hideAnimation();
      }
    }
  },
  { immediate: true }
);

// 动态创建遮罩层
const createOverlay = () => {
  const overlay = document.createElement('div');
  overlay.className = 'payment-overlay fixed inset-0 w-full h-full bg-black/40 z-[999]';
  document.body.appendChild(overlay);
  return overlay;
};
// 移除遮罩层
const removeOverlay = (overlay) => {
  if (overlay) {
    document.body.removeChild(overlay);
  }
};
// 监听 visible 变化，动态添加/移除遮罩层
let overlay = null;
watch(
  () => props.visible,
  (newVal) => {
    if (!isMobile.value) { // 仅桌面端需要自定义遮罩层
      if (newVal) {
        overlay = createOverlay();
      } else {
        removeOverlay(overlay);
        overlay = null;
      }
    }
  }, { immediate: true }
);

// 金额
const orderAmountRef = ref(null);
const discountRef = ref(null);
const finalAmountRef = ref(null);

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  if (isMobile.value) return;

  if (cardRef.value) {
    gsap.fromTo(
      cardRef.value,
      { scale: 0.8, opacity: 0, yPercent: 20 },
      { scale: 1, opacity: 1, yPercent: 0, duration: 0.8, ease: 'power3.out' }
    );
  }

  // 整体金额区域淡入并从下方滑入
  gsap.fromTo(
    [orderAmountRef.value, discountRef.value, finalAmountRef.value].filter(Boolean),
    { y: 20, opacity: 0 },
    { 
      y: 0, 
      opacity: 1, 
      duration: 0.8, 
      ease: 'power3.out', 
      stagger: 0.2 // 每个元素依次进入，间隔 0.2 秒
    }
  );

  // 应付金额跳动效果
  if (finalAmountRef.value) {
    gsap.fromTo(
      finalAmountRef.value,
      { scale: 1 },
      { 
        scale: 1.1, 
        duration: 0.3, 
        ease: 'power2.out',
        repeat: 1, 
        yoyo: true // 放大后缩小
      }
    );
  }

});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
  removeOverlay(overlay); // 清理遮罩层
  overlay = null;
});

const handleConfirm = () => {
  if (!selectedMethod.value) {
    window.$message?.error('请选择支付方式');
    return;
  }
  emit('confirm-payment', selectedMethod.value);
};

</script>

<template>
  <div>
    <!-- 移动端 -->
    <el-dialog
      v-if="isMobile"
      v-model="localVisible"
      title="订单已完成，请支付"
      width="90%"
      :max-width="400"
      :class="[
        'payment-dialog',
        'rounded-2xl bg-white/90 backdrop-blur-md border border-gray-100 shadow-xl'
      ]"
      @close="() => emit('update:visible', false)"
    >
      <div class="flex flex-col gap-4">
        <!-- 金额区域 -->
        <div class="text-center space-y-3 py-4 px-5 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm">
          <!-- 订单金额 -->
          <div class="flex justify-center items-baseline gap-2">
            <span class="text-sm font-medium text-gray-500">订单金额</span>
            <div class="flex items-baseline gap-1">
              <span class="text-sm font-medium text-gray-500">￥</span>
              <span class="text-lg font-semibold text-gray-600">{{ parsedOrderAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 优惠 -->
          <div v-if="discount > 0" class="flex justify-center items-baseline gap-2">
            <span class="text-sm font-medium text-emerald-600">优惠</span>
            <div class="flex items-baseline gap-1">
              <span class="text-sm font-medium text-emerald-600">￥</span>
              <span class="text-base font-medium text-emerald-600">{{ discount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 应付金额 -->
          <div class="flex justify-center items-baseline gap-2 pt-3 border-t border-gray-200">
            <span class="text-sm font-medium text-gray-600">应付金额</span>
            <div class="flex items-baseline gap-1">
              <span class="text-sm font-medium text-red-600">￥</span>
              <span class="text-2xl font-bold text-red-600">{{ (parsedOrderAmount - discount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <div
            v-for="method in props.paymentMethods"
            :key="method.value"
            class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer transition-all duration-300"
            :class="selectedMethod === method.value ? 'border-blue-500 bg-blue-50 shadow-sm' : 'hover:bg-gray-100'"
            @click="selectedMethod = method.value"
          >
            <component :is="method.icon" v-if="method.icon" class="w-6 h-6 text-gray-600" />
            <span class="flex-1 text-gray-800 font-medium">{{ method.label }}</span>
            <div
              class="w-5 h-5 rounded-full border-2"
              :class="selectedMethod === method.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
            >
              <div v-if="selectedMethod === method.value" class="w-3 h-3 rounded-full bg-white m-1" />
            </div>
          </div>
        </div>
        <el-button
          type="primary"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium rounded-lg transition-transform duration-100 active:scale-98"
          @click="handleConfirm"
        >
          确认支付
        </el-button>
      </div>
    </el-dialog>

    <!-- 桌面端 -->
    <div
      v-else
      v-show="localVisible"
      ref="cardRef"
      class="payment-card  fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-6 z-[1000]"
    >
      <h3 class="text-lg font-semibold text-gray-800 mb-4">订单已完成，请支付</h3>
      <!-- 金额区域 -->
      <div class="mb-6 py-5 px-6 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm">
        <!-- 订单金额 -->
        <div class="flex justify-center items-baseline gap-2 mb-3">
          <span class="text-base font-medium text-gray-500">订单金额</span>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-medium text-gray-500">￥</span>
            <span ref="orderAmountRef" class="text-xl font-semibold text-gray-600">{{ parsedOrderAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 优惠 -->
        <div v-if="discount > 0" class="flex justify-center items-baseline gap-2 mb-3">
          <span class="text-base font-medium text-emerald-600">优惠</span>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-medium text-emerald-600">￥</span>
            <span ref="discountRef" class="text-lg font-medium text-emerald-600">{{ discount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 应付金额 -->
        <div class="flex justify-center items-baseline gap-2 pt-4 border-t border-gray-200">
          <span class="text-base font-medium text-gray-600">应付金额</span>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-medium text-red-600">￥</span>
            <span ref="finalAmountRef" class="text-3xl font-bold text-red-600">{{ (parsedOrderAmount - discount).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-3 mb-4">
        <div
          v-for="method in props.paymentMethods"
          :key="method.value"
          class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer transition-all duration-300"
          :class="selectedMethod === method.value ? 'border-blue-500 bg-blue-50 shadow-sm' : 'hover:bg-gray-100'"
          @click="selectedMethod = method.value"
        >
          <component :is="method.icon" v-if="method.icon" class="w-6 h-6 text-gray-600" />
          <span class="flex-1 text-gray-800 font-medium">{{ method.label }}</span>
          <div
            class="w-5 h-5 rounded-full border-2"
            :class="selectedMethod === method.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
          >
            <div v-if="selectedMethod === method.value" class="w-3 h-3 rounded-full bg-white m-1" />
          </div>
        </div>
      </div>
      <el-button
        type="primary"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium rounded-lg transition-transform duration-100 active:scale-98"
        @click="handleConfirm"
      >
        确认支付
      </el-button>
    </div>
  </div>
</template>

<style scoped>
</style>