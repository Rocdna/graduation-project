<script setup lang="ts">
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { $t } from '@/locales';

defineOptions({ name: 'CardData' });
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

interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

const cardData = computed<CardData[]>(() => [
  {
    key: 'orderCount',
    title: $t('page.home.todayOrderCount'),
    value: props.stats.totalOrders,
    unit: '',
    color: {
      start: '#a855f7', // 紫色
      end: '#7e22ce'
    },
    icon: 'ant-design:bar-chart-outlined'
  },
  {
    key: 'todayRevenue',
    title: $t('page.home.todayRevenue'),
    value: props.stats.totalRevenue,
    unit: '￥',
    color: {
      start: '#ff4d94', // 粉色
      end: '#db2777'
    },
    icon: 'ant-design:money-collect-outlined'
  },
  {
    key: 'activeDrivers',
    title: $t('page.home.activeDrivers'),
    value: props.stats.activeDrivers,
    unit: '',
    color: {
      start: '#26deca', // 青色
      end: '#0d9488'
    },
    icon: 'ant-design:car-outlined' // 更换为更贴合司机的图标
  },
  {
    key: 'activePassengers',
    title: $t('page.home.activePassengers'),
    value: props.stats.activePassengers,
    unit: '',
    color: {
      start: '#7c3aed', // 紫蓝色
      end: '#4c1d95'
    },
    icon: 'ant-design:user-outlined' // 更换为更贴合乘客的图标
  }
]);

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}
</script>

<template>
  <ElCard class="card-wrapper">
    <!-- define component start: GradientBg -->
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div class="rd-8px px-16px pb-4px pt-8px text-white" :style="{ backgroundImage: gradientColor }">
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>
    <!-- define component end: GradientBg -->
    <ElRow :gutter="16">
      <ElCol v-for="item in cardData" :key="item.key" :lg="6" :md="12" :sm="24" class="my-8px">
        <GradientBg :gradient-color="getGradientColor(item.color)" class="flex-1">
          <h3 class="text-16px">{{ item.title }}</h3>
          <div class="flex justify-between pt-12px">
            <SvgIcon :icon="item.icon" class="text-32px" />
            <CountTo
              :prefix="item.unit"
              :start-value="1"
              :end-value="item.value"
              class="text-30px text-white dark:text-dark"
            />
          </div>
        </GradientBg>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<style scoped></style>
