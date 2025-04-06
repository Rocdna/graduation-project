<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAppStore } from '@/store/modules/app';
import HeaderBanner from './modules/header-banner.vue';
import CardData from './modules/card-data.vue';
import LineChart from './modules/line-chart.vue';
import PieChart from './modules/pie-chart.vue';
import ProjectNews from './modules/project-news.vue';
import CreativityBanner from './modules/creativity-banner.vue';
import { fetchGetTodayDashboardStats } from '@/service/api';


const appStore = useAppStore();

// 初始化统计数据
const stats = ref({
  totalOrders: 0,
  matchRate: 0,
  totalRevenue: 0,
  newUsers: 0,
  activeDrivers: 0,
  activePassengers: 0
});

// 加载数据
async function loadStats() {
  try {
    const { data, error } = await fetchGetTodayDashboardStats();
    if (!error) {
      stats.value = { ...data };
    }
  } catch (error) {
    console.error('无法获取统计数据', error);
  }
}

// 页面加载时请求数据
onMounted(() => {
  loadStats();
});


const gap = computed(() => (appStore.isMobile ? 0 : 16));
</script>

<template>
  <ElSpace direction="vertical" fill class="pb-0" :size="0">
    <HeaderBanner class="mb-16px" :stats="stats"/>
    <CardData class="mb-16px" :stats="stats"/>
    <ElRow :gutter="gap">
      <ElCol :lg="14" :sm="24" class="mb-16px">
        <ElCard class="card-wrapper">
          <LineChart/>
        </ElCard>
      </ElCol>
      <ElCol :lg="10" :sm="24" class="mb-16px">
        <ElCard class="card-wrapper">
          <PieChart :stats="stats"/>
        </ElCard>
      </ElCol>
    </ElRow>
    <ElRow :gutter="gap">
      <ElCol :lg="14" :sm="24" class="mb-16px">
        <ProjectNews />
      </ElCol>
      <ElCol :lg="10" :sm="24" class="mb-16px">
        <CreativityBanner />
      </ElCol>
    </ElRow>
  </ElSpace>
</template>

<style scoped></style>
