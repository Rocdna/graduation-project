<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'HeaderBanner' });
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
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

interface StatisticData {
  id: number;
  title: string;
  value: number;
}

const statisticData = computed<StatisticData[]>(() => [
  { id: 0, title: $t('page.home.todayOrders'), value: props.stats.totalOrders },
  { id: 1, title: $t('page.home.todayMatchRate'), value: props.stats.matchRate, formatter: (val: number) => `${val}%` },
  { id: 2, title: $t('page.home.newUsers'), value: props.stats.newUsers }
]);
</script>

<template>
  <ElCard class="card-wrapper">
    <ElRow :gutter="gap" class="px-8px">
      <ElCol :md="18" :sm="24">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img src="@/assets/imgs/comic.jpg" class="size-full" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">
              {{ $t('page.home.greeting', { userName: authStore.userInfo.username }) }}
            </h3>
            <p class="text-#999 leading-30px">{{ $t('page.home.weatherDesc') }}</p>
          </div>
        </div>
      </ElCol>
      <ElCol :md="6" :sm="24">
        <ElSpace direction="horizontal" class="w-full justify-end" :size="24">
          <ElStatistic v-for="item in statisticData" :key="item.id" class="whitespace-nowrap" v-bind="item" />
        </ElSpace>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<style scoped></style>
