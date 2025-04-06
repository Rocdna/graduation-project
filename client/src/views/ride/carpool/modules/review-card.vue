<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  tags: {
    type: Array,
    default: () => ['司机态度好', '准时到达', '车辆干净']
  },
  visible: { type: Boolean, default: true }
});

const emit = defineEmits(['submit-review', 'skip', 'update:visible']);

const isMobile = ref(false);
const rating = ref(5);
const selectedTags = ref([]);
const comment = ref('');
const isAnonymous = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

checkScreenSize();

// GSAP 动画
const cardRef = ref(null);
const localVisible = ref(props.visible); // 内部状态，用于控制动画完成后的隐藏

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
  }
);

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
  removeOverlay(overlay);
});

const handleSubmit = () => {
  emit('submit-review', { rating: rating.value, tags: selectedTags.value, comment: comment.value, isAnonymous: isAnonymous.value });
};

const handleSkip = () => {
  emit('skip');
};

const handleClose = () => {
  emit('update:visible', false);
};



</script>

<template>
  <el-dialog
    v-if="isMobile"
    v-model="localVisible"
    title="支付成功，请评价"
    width="90%"
    :max-width="400"
    :class="[
      'review-dialog',
      'rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-2xl'
    ]"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <el-rate v-model="rating" class="text-center" />
      <div class="flex flex-wrap gap-2">
        <el-tag
          v-for="tag in props.tags"
          :key="tag"
          :type="selectedTags.includes(tag) ? 'primary' : 'info'"
          class="cursor-pointer px-3 py-1 rounded-full transition-all duration-200"
          :class="selectedTags.includes(tag) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
          @click="selectedTags.includes(tag) ? selectedTags = selectedTags.filter(t => t !== tag) : selectedTags.push(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
      <el-checkbox v-model="isAnonymous" class="mb-4">匿名评价</el-checkbox>
      <el-input
        v-model="comment"
        type="textarea"
        :rows="3"
        placeholder="请输入评价（可选）"
        maxlength="100"
        show-word-limit
        class="rounded-lg"
      />
      <div class="flex gap-2">
        <el-button
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 text-base font-medium rounded-lg transition-transform duration-100 active:scale-98"
          @click="handleSkip"
        >
          跳过
        </el-button>
        <el-button
          type="primary"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium rounded-lg transition-transform duration-100 active:scale-98"
          @click="handleSubmit"
        >
          提交
        </el-button>
      </div>
    </div>
  </el-dialog>

  <div
    v-else
    v-show="localVisible"
    ref="cardRef"
    class="review-card fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-6 z-[1000]"
  >
    <h3 class="text-lg font-semibold text-gray-800 mb-4">支付成功，请评价</h3>
    <el-rate v-model="rating" class="mb-4" />
    <div class="flex flex-wrap gap-2 mb-4">
      <el-tag
        v-for="tag in tags"
        :key="tag"
        :type="selectedTags.includes(tag) ? 'primary' : 'info'"
        class="cursor-pointer px-3 py-1 transition-all duration-200"
        :class="selectedTags.includes(tag) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
        @click="selectedTags.includes(tag) ? selectedTags = selectedTags.filter(t => t !== tag) : selectedTags.push(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>
    <el-checkbox v-model="isAnonymous" class="mb-4">匿名评价</el-checkbox>
    <el-input
      v-model="comment"
      type="textarea"
      :rows="3"
      placeholder="请输入评价（可选）"
      maxlength="100"
      show-word-limit
      class="mb-4 rounded-lg"
    />
    <div class="flex gap-2">
      <el-button
        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 text-base font-medium rounded-lg transition-transform duration-100 active:scale-98"
        @click="handleSkip"
      >
        跳过
      </el-button>
      <el-button
        type="primary"
        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium rounded-lg transition-transform duration-100 active:scale-98"
        @click="handleSubmit"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<style scoped>
</style>