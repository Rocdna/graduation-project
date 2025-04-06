<script setup lang="ts">
import { watch, onMounted, ref } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';
import { fetchGetDashboardStats } from '@/service/api';

defineOptions({ name: 'LineChart' });

const appStore = useAppStore();

// 定义 stats 的类型
interface StatsItem {
  date: string;
  totalOrders: number;
  matchRate: number;
  totalRevenue: number;
}

// 初始化空的 stats 数据
const stats = ref<StatsItem[]>([
  { date: '', totalOrders: 0, matchRate: 0, totalRevenue: 0 },
  { date: '', totalOrders: 0, matchRate: 0, totalRevenue: 0 },
  { date: '', totalOrders: 0, matchRate: 0, totalRevenue: 0 },
  { date: '', totalOrders: 0, matchRate: 0, totalRevenue: 0 },
  { date: '', totalOrders: 0, matchRate: 0, totalRevenue: 0 },
  { date: '', totalOrders: 0, matchRate: 0, totalRevenue: 0 },
  { date: '', totalOrders: 0, matchRate: 0, totalRevenue: 0 }
]);

const { domRef, updateOptions } = useEcharts(() => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: [$t('page.home.orderCount'), $t('page.home.revenue')],
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[],
    axisLabel: {
      color: '#ccc'
    },
    axisLine: {
      lineStyle: {
        color: '#444'
      }
    }
  },
  yAxis: [
    {
      type: 'value',
      name: $t('page.home.orderCount'),
      position: 'left',
      min: 0,
      max: 150,
      axisLabel: {
        color: '#ccc'
      },
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#333'
        }
      }
    },
    {
      type: 'value',
      name: $t('page.home.revenue'),
      position: 'right',
      min: 0,
      max: 4000,
      axisLabel: {
        color: '#ccc',
        formatter: '{value} ¥'
      },
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      color: '#a855f7',
      name: $t('page.home.orderCount'),
      type: 'line',
      smooth: true,
      yAxisIndex: 0,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0.25, color: '#a855f7' },
            { offset: 1, color: 'rgba(168, 85, 247, 0.1)' }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: [] as number[]
    },
    {
      color: '#ff4d94',
      name: $t('page.home.revenue'),
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0.25, color: '#ff4d94' },
            { offset: 1, color: 'rgba(255, 77, 148, 0.1)' }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: [] as number[]
    }
  ]
}));

async function fetchData() {
  try {
    const { data, error } = await fetchGetDashboardStats();
    if (!error) {
      stats.value = data.stats;

      updateOptions(opts => {
        opts.xAxis.data = stats.value.map(item => item.date.slice(5)); // 提取 MM-DD 格式
        opts.series[0].data = stats.value.map(item => item.totalOrders); // 订单量
        opts.series[1].data = stats.value.map(item => item.totalRevenue); // 收入
        return opts;
      });
    }
  } catch (error) {
    console.error('无法获取过去7天的统计数据', error);
  }
}

function updateLocale() {
  updateOptions((opts, factory) => {
    const originOpts = factory();
    opts.legend.data = originOpts.legend.data;
    opts.series[0].name = originOpts.series[0].name;
    opts.series[1].name = originOpts.series[1].name;
    opts.yAxis[0].name = originOpts.yAxis[0].name;
    opts.yAxis[1].name = originOpts.yAxis[1].name;
    return opts;
  });
}

watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <ElCard class="card-wrapper">
    <div ref="domRef" class="h-360px overflow-hidden"></div>
  </ElCard>
</template>

<style scoped></style>