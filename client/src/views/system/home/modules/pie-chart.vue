<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';

defineOptions({ name: 'PieChart' });

const props = defineProps<{
  stats: {
    totalOrders: number;
    matchRate: number;
    totalRevenue: number;
    newUsers: number;
    activeDrivers: number;
    activePassengers: number;
  };
}>();

const appStore = useAppStore();

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'item',
    textStyle: {
      color: '#fff'
    },
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderColor: '#444',
    formatter: (params: any) => {
      const { name, value, percent } = params;
      return `${name}: ${value} (${percent}%)`;
    }
  },
  legend: {
    bottom: '0%',
    left: 'center',
    itemStyle: {
      borderWidth: 0
    }
  },
  series: [
    {
      color: ['#a855f7', '#ff4d94', '#26deca', '#7c3aed'], // 拼车系统主题色
      name: $t('page.home.userDistribution'), // 改为“用户分布”
      type: 'pie',
      radius: ['45%', '75%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '12'
        }
      },
      labelLine: {
        show: false
      },
      data: [] as { name: string; value: number }[]
    }
  ]
}));

// 数据
function updateChartData(stats: any) {
  updateOptions(opts => {
    opts.series[0].data = [
      { name: $t('page.home.activeDrivers'), value: stats.activeDrivers },
      { name: $t('page.home.activePassengers'), value: stats.activePassengers },
      { name: $t('page.home.todayOrderCount'), value: stats.totalOrders },
      { name: $t('page.home.newUsers'), value: stats.newUsers }
    ];
    return opts;
  });
}

// 语言
function updateLocale() {
  updateOptions((opts, factory) => {
    const originOpts = factory();
    opts.series[0].name = originOpts.series[0].name;
    opts.series[0].data = [
      { name: $t('page.home.activeDrivers'), value: props.stats.activeDrivers },
      { name: $t('page.home.activePassengers'), value: props.stats.activePassengers },
      { name: $t('page.home.todayOrderCount'), value: props.stats.totalOrders },
      { name: $t('page.home.todayRevenue'), value: props.stats.totalRevenue }
    ];
    return opts;
  });
}
// 监听 stats 变化，更新图表
watch(
  () => props.stats,
  (newStats) => {
    updateChartData(newStats);
  },
  { immediate: true }
);

// 监听语言变化，更新图表
watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);
</script>

<template>
  <ElCard class="card-wrapper">
      {{ $t('page.home.userDistribution') }}
    <div ref="domRef" class="h-360px overflow-hidden"></div>
  </ElCard>
</template>

<style scoped>
</style>