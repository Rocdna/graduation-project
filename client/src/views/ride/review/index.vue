<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { fetchUserReviews } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { formatToLocal } from '@/utils/format';
import bgImg from '@/assets/imgs/4.jpg'

const useAuth = useAuthStore();
const userId = useAuth.userInfo._id;
const user = useAuth.userInfo;

// 评价数据
const reviews = ref([]);
const loading = ref(false);
const ratingFilter = ref(undefined);
const showDetailDialog = ref(false);
const selectedReview = ref(null);
const isMobile = ref(false);

// Mock reviews data (replace with actual data from getReviews)
reviews.value = [];

// 评价标签和颜色
const ratingLabel = {
  1: '非常不满意',
  2: '不满意',
  3: '一般',
  4: '满意',
  5: '非常满意'
};

const ratingTagClass = {
  1: 'bg-red-900/30 text-red-400',
  2: 'bg-orange-900/30 text-orange-400',
  3: 'bg-yellow-900/30 text-yellow-400',
  4: 'bg-emerald-900/30 text-emerald-400',
  5: 'bg-green-900/30 text-green-400'
};

const getRatingClass = (rating) => {
  const baseClasses = 'text-xs font-medium py-1 px-2 rounded-full'
  return `${baseClasses} ${ratingTagClass[rating] || 'bg-gray-900/30 text-gray-400'}`
}

// 获取评价列表
const fetchReviews = async () => {
  if (!userId) return;
  loading.value = true;
  try {
    const { data, error } = await fetchUserReviews(userId, { rating: ratingFilter.value });
    if (!error) {
      reviews.value = data.reviews || [];
    }
  } catch (error) {
    console.error('获取评价失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// Dialog 宽度（响应式）
const dialogWidth = computed(() => {
  return window.innerWidth < 768 ? '100%' : '600px';
});

// 查看评价详情
const showDetail = async (reviewId) => {
  try {
    // 从 reviews 中筛选评价
    const review = reviews.value.find((r) => r.id === reviewId);
    selectedReview.value = review;
    showDetailDialog.value = true;
  } catch (error) {
    console.error('获取评价详情失败');
  }
};

// 关闭 Dialog
const handleCloseDialog = (done) => {
  showDetailDialog.value = false;
  selectedReview.value = null;
  done();
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};
handleResize();
const selectedRow = ref(null);
const selectRow = (id) => {
  selectedRow.value = id;
};

// 评分筛选变化
const handleRatingChange = () => {
  fetchReviews();
};

// 初始化时获取当前位置
onMounted(() => {
  window.addEventListener('resize', handleResize);
  fetchReviews();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

</script>

<template>
  <div class="bg-[#1a1a1a] text-[#e0e0e0] overflow-hidden bg-gradient-to-b from-dark-800 to-dark-900 text-light-50 bg-cover bg-center bg-fixed" :style="{ backgroundImage: `url(${bgImg})`}">
    <div class="absolute inset-0 bg-black/35 h-[calc(100vh+44px)]"></div>
    <main class="pt-12 sm:pt-16 pb-8 sm:pb-10 px-2 sm:px-4 relative w-full min-h-[calc(100vh-57px)]">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-30 -right-30 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-20 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="mx-auto w-[95%] sm:w-[90%] max-w-7xl mb-10 bg-light-50/5 
            rounded-none sm:rounded-3xl shadow-2xl border border-light-50/10 relative
            sm:backdrop-blur-xl backdrop-blur-2xl">
        <section class="p-4 min-h-600px sm:p-8 md:p-12 relative">
          <h1 class="text-2xl font-bold mb-4">
            我的评价
          </h1>
          
          <!-- 评分筛选 -->
          <el-select
            v-model="ratingFilter"
            placeholder="筛选评分"
            clearable
            class="w-full max-w-[200px] mb-4 champagne-select"
            @change="handleRatingChange"
          >
            <el-option label="所有评分" value="" />
            <el-option label="⭐ 非常不满意" value="1" />
            <el-option label="⭐⭐ 不满意" value="2" />
            <el-option label="⭐⭐⭐ 一般" value="3" />
            <el-option label="⭐⭐⭐⭐ 满意" value="4" />
            <el-option label="⭐⭐⭐⭐⭐ 非常满意" value="5" />
          </el-select>

          <!-- 如果没有评价，显示占位内容 -->
          <div v-if="!reviews.length" class="flex items-center justify-center min-h-[400px] bg-black/50 rounded-xl border border-gray-800/50">
            <div class="flex flex-col items-center space-y-4">
              <SvgIcon icon="mdi:comment-text-outline" class="w-24 h-24 text-[#C9B68B]" />
              <p class="text-xl text-gray-400 font-medium">暂无评价记录</p>
              <p class="text-sm text-gray-500">您尚未任何评价</p>
            </div>
          </div>
          
          <div v-else class="flex items-center justify-center bg-black/50 rounded-xl border border-gray-800/50">
            <!-- 自定义表格 -->
            <div v-if="!isMobile" class="w-full bg-[#252525] rounded-lg border-[#6b5e40] overflow-hidden">
              <!-- 表头 -->
              <div class="grid grid-cols-[140px_1fr_120px_120px_120px_120px_120px_120px] bg-[#333] border-b border-[#6b5e40]">
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">评价ID</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">评价内容</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">评分</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">类型</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">评价者</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">被评价者</div>
                <div class="p-2 text-[#c19f6f] font-bold border-r border-[#6b5e40]">评价时间</div>
                <div class="p-2 text-[#c19f6f] font-bold">操作</div>
              </div>
              
              <!-- 表格主体 -->
              <div class="max-h-[500px] overflow-y-auto custom-scrollbar">
                <div
                  v-for="(review, index) in reviews"
                  :key="review.id"
                  :class="[
                    'grid grid-cols-[140px_1fr_120px_120px_120px_120px_120px_120px]',
                    'border-b border-[#444]',
                    index % 2 === 0 ? 'bg-[#252525]' : 'bg-[#2a2a2a]',
                    selectedRow === review.id ? 'bg-[#8b6f47] text-[#e0e0e0]' : '',
                    'hover:bg-[#a68a64] hover:text-[#e0e0e0]'
                  ]"
                  @click="selectRow(review.id)"
                >
                  <div class="p-2 border-r border-[#444] truncate">{{ review.id }}</div>
                  <div class="p-2 border-r border-[#444] truncate">{{ review.content || '无文字评价' }}</div>
                  <div class="p-2 border-r border-[#444] truncate">
                    <span :class="getRatingClass(review.rating)">
                      {{ ratingLabel[review.rating] || review.rating + '星' }}
                    </span>
                  </div>
                  <div class="p-2 border-r border-[#444] truncate">{{ review.reviewType || '-' }}</div>
                  <div class="p-2 border-r border-[#444] truncate">{{ review.reviewer.username || '-' }}</div>
                  <div class="p-2 border-r border-[#444] truncate">{{ review.reviewee.username || '-' }}</div>
                  <div class="p-2 border-r border-[#444] truncate">{{ formatToLocal(review.createdAt) }}</div>
                  <div class="p-2">
                    <button
                      class="text-[#8b6f47] hover:text-[#a68a64] border border-[#8b6f47] hover:border-[#a68a64] rounded px-2 py-1 transition-colors"
                      @click.stop="showDetail(review.id)"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 移动端：卡片 -->
            <div v-else class="block md:hidden space-y-4">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="bg-[#242424] border border-[#E8C897]/40 rounded-lg p-4 shadow-md"
              >
                <div class="flex justify-between py-1">
                  <span class="text-[#E8C897]/90">评价ID</span>
                  <span class="text-[#F0F0F0]">{{ review.id.slice(-8) }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#E8C897]/90">评分</span>
                  <el-rate
                    v-model="review.rating"
                    disabled
                    :colors="['#D4A373', '#D4A373', '#D4A373']"
                  />
                </div>
                <div class="py-2">
                  <span class="text-[#E8C897]/90 block mb-1">评价内容</span>
                  <p class="text-[#F0F0F0]">{{ review.content || '无文字评价' }}</p>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-[#E8C897]/90">评价时间</span>
                  <span class="text-[#F0F0F0]">{{ formatToLocal(review.createdAt) }}</span>
                </div>
                <div class="pt-2 text-right">
                  <el-button
                    type="primary"
                    link
                    @click="showDetail(review.id)"
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

    <!-- 评价详情 Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`评价详情 - ${selectedReview?.id.slice(-8)}`"
      :width="dialogWidth"
      :before-close="handleCloseDialog"
    >
      <el-card v-if="selectedReview" class="bg-[#242424] border border-[#E8C897]/40 shadow-none">
        <div class="space-y-3">
          <div class="flex justify-between py-2 border-b border-[#E8C897]/15">
            <span class="text-[#E8C897]/90 tracking-wide">评价ID</span>
            <span class="text-[#F0F0F0] font-medium">{{ selectedReview.id }}</span>
          </div>
          
          <div class="flex justify-between py-2 border-b border-[#E8C897]/15">
            <span class="text-[#E8C897]/90 tracking-wide">评分</span>
            <div>
              <el-rate
                v-model="selectedReview.rating"
                disabled
                :colors="['#D4A373', '#D4A373', '#D4A373']"
                class="inline-block"
              />
              <span class="ml-2 text-[#F0F0F0] font-medium">
                {{ ratingLabel[selectedReview.rating] || selectedReview.rating + '星' }}
              </span>
            </div>
          </div>
          
          <div class="py-2 border-b border-[#E8C897]/15">
            <span class="text-[#E8C897]/90 tracking-wide block mb-2">评价内容</span>
            <p class="text-[#F0F0F0] bg-[#2a2a2a] p-3 rounded">{{ selectedReview.content || '无文字评价' }}</p>
          </div>
          
          <div class="flex justify-between py-2 border-b border-[#E8C897]/15">
            <span class="text-[#E8C897]/90 tracking-wide">评价对象</span>
            <span class="text-[#F0F0F0] font-medium">
              {{ user?.role === 'passenger' ? selectedReview.reviewer?.username : selectedReview.reviewee?.username }}
            </span>
          </div>
          
          <div class="flex justify-between py-2 border-b border-[#E8C897]/15">
            <span class="text-[#E8C897]/90 tracking-wide">评价时间</span>
            <span class="text-[#F0F0F0] font-medium">{{ formatToLocal(selectedReview.createdAt) }}</span>
          </div>
          


          <!-- <div v-if="selectedReview.images?.length" class="py-2">
            <span class="text-[#E8C897]/90 tracking-wide block mb-2">评价图片</span>
            <div class="grid grid-cols-3 gap-2">
              <el-image
                v-for="(img, idx) in selectedReview.images"
                :key="idx"
                :src="img"
                :preview-src-list="selectedReview.images"
                fit="cover"
                class="h-24 rounded border border-[#E8C897]/20"
              />
            </div>
          </div> -->
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 保持原有的滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d4a373;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: #252525;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background-color: rgba(48, 48, 48, 0.96) !important;
  border: 1px solid #94978e91 !important;
}

:deep(.el-dialog__title) {
  color: #FFFFFF !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

:deep(.el-overlay) {
  background: rgba(0, 0, 0, 0.5) !important;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px) !important;
}

/* 评分组件样式 */
:deep(.el-rate__icon) {
  font-size: 18px;
  margin-right: 2px;
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