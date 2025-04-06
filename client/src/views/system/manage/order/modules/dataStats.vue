<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';
import { fetchGetNOrderStats } from '@/service/api';

// 引入 appStore 用于监听语言变化
const appStore = useAppStore();

// 类型定义
interface StatsItem {
  date: string;
  totalOrders: number;
  matchRate: number;
  totalRevenue: number;
}

// 模拟统计数据
const stats = ref<StatsItem[]>([
  { date: '2025-03-14', totalOrders: 20, matchRate: 75.0, totalRevenue: 2800 },
  { date: '2025-03-15', totalOrders: 22, matchRate: 80.0, totalRevenue: 3100 },
  { date: '2025-03-16', totalOrders: 18, matchRate: 70.0, totalRevenue: 2500 },
  { date: '2025-03-17', totalOrders: 15, matchRate: 65.0, totalRevenue: 2000 },
  { date: '2025-03-18', totalOrders: 25, matchRate: 85.0, totalRevenue: 3400 },
  { date: '2025-03-19', totalOrders: 30, matchRate: 90.0, totalRevenue: 4000 },
  { date: '2025-03-20', totalOrders: 28, matchRate: 82.0, totalRevenue: 3700 }
]);

// 日期范围（默认最近 7 天）
const dateRange = ref<string[]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 天前
  new Date().toISOString().split('T')[0] // 今天
]);

// 过滤后的统计数据
const filteredStats = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) return stats.value;
  const start = new Date(dateRange.value[0]);
  const end = new Date(dateRange.value[1]);
  return stats.value.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
});

// 统计卡片数据（基于过滤后的数据）
const totalOrders = computed(() => filteredStats.value.reduce((sum, item) => sum + item.totalOrders, 0));
const totalRevenue = computed(() => filteredStats.value.reduce((sum, item) => sum + item.totalRevenue, 0));
const avgMatchRate = computed(() => {
  const avg = filteredStats.value.length
    ? filteredStats.value.reduce((sum, item) => sum + item.matchRate, 0) / filteredStats.value.length
    : 0;
  return avg.toFixed(2);
});

// 折线图
const { domRef: chartRef, updateOptions: updateChart } = useEcharts(() => ({
  xAxis: { type: 'category', data: [] },
  yAxis: [
    { type: 'value', name: $t('page.manage.order.stats.orderCount'), min: 0, max: 50 },
    { type: 'value', name: $t('page.manage.order.stats.revenue'), min: 0, max: 5000, position: 'right', axisLabel: { formatter: '{value} ¥' } }
  ],
  series: [
    { name: $t('page.manage.order.stats.orderCount'), type: 'line' },
    { name: $t('page.manage.order.stats.revenue'), type: 'line', yAxisIndex: 1 }
  ]
}));

// 更新国际化字段
function updateLocale() {
  updateChart((opts, factory) => {
    const originOpts = factory();
    opts.series[0].name = originOpts.series[0].name;
    opts.series[1].name = originOpts.series[1].name;
    opts.yAxis[0].name = originOpts.yAxis[0].name;
    opts.yAxis[1].name = originOpts.yAxis[1].name;
    return opts;
  });
}

// 监听语言变化
watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);

// 更新统计数据
async function fetchStats() {
  try {
    // TODO: 替换为真实接口：GET /api/management/orders/stats
    const { data, error } = await fetchGetNOrderStats(dateRange.value[0], dateRange.value[1]);
    if (error) {
      window.$message?.error('暂无订单');
      return;
    }

    // 更新 stats 数据
    stats.value = data?.dailyStats || [];

    // 更新图表
    updateChart(opts => {
      const chartData = filteredStats.value.length ? filteredStats.value : [{ date: '', totalOrders: 0, totalRevenue: 0, matchRate: 0 }];
      return {
        xAxis: { type: 'category', data: chartData.map(item => item.date ? item.date.slice(5) : 'Null') },
        yAxis: [
          { type: 'value', name: $t('page.manage.order.stats.orderCount'), min: 0, max: 50 },
          { type: 'value', name: $t('page.manage.order.stats.revenue'), min: 0, max: 5000, position: 'right', axisLabel: { formatter: '{value} ¥' } }
        ],
        series: [
          { name: $t('page.manage.order.stats.orderCount'), type: 'line', data: chartData.map(item => item.totalOrders), yAxisIndex: 0 },
          { name: $t('page.manage.order.stats.revenue'), type: 'line', data: chartData.map(item => item.totalRevenue), yAxisIndex: 1 }
        ]
      };
    });
    // 如果没有数据，提示用户
    if (!filteredStats.value.length) {
      window.$message?.warning($t('page.manage.order.messages.noOrders'));
    }
  } catch (error) { 
    window.$message?.error('获取统计数据失败');
  }
}

// 初始加载
onMounted(() => {
  fetchStats();
});
</script>

<template>
  <ElCard class="mb-4">
    <ElRow :gutter="16">
      <ElCol :span="24" class="mb-4 md:w-auto w-full">
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          :range-separator="$t('page.manage.order.filter.dateRange')"
          :start-placeholder="$t('page.manage.order.filter.dateStart')"
          :end-placeholder="$t('page.manage.order.filter.dateEnd')"
          @change="fetchStats"
        />
      </ElCol>
    </ElRow>
    <ElRow :gutter="16">
      <ElCol :span="8">
        <ElCard shadow="hover">
          <div class="text-center">
            <p>{{ $t('page.manage.order.stats.totalOrders') }}</p>
            <p class="text-2xl">{{ totalOrders }}</p>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="hover">
          <div class="text-center">
            <p>{{ $t('page.manage.order.stats.totalRevenue') }}</p>
            <p class="text-2xl">{{ totalRevenue }} ¥</p>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="hover">
          <div class="text-center">
            <p>{{ $t('page.manage.order.stats.avgMatchRate') }}</p>
            <p class="text-2xl">{{ avgMatchRate }}%</p>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
    <ElRow class="mt-4">
      <ElCol :span="24">
        <div ref="chartRef" class="h-360px"></div>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<style scoped></style>