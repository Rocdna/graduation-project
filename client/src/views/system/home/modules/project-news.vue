<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({ name: 'ProjectNews' });

interface NewsItem {
  id: number;
  content: string;
  time: string;
}

const newses = computed<NewsItem[]>(() => [
  { id: 1, content: $t('page.home.projectNews.desc1'), time: '2025-03-15 10:00:00' },
  { id: 2, content: $t('page.home.projectNews.desc2'), time: '2025-03-16 14:30:00' },
  { id: 3, content: $t('page.home.projectNews.desc3'), time: '2025-03-17 09:15:00' },
  { id: 4, content: $t('page.home.projectNews.desc4'), time: '2025-03-18 20:45:00' },
  { id: 5, content: $t('page.home.projectNews.desc5'), time: '2025-03-19 16:20:00' }
]);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <ElRow>
        <ElCol :span="18">{{ $t('page.home.projectNews.title') }}</ElCol>
        <ElCol :span="6" class="text-right">
          <a class="text-primary" href="javascript:;">{{ $t('page.home.projectNews.moreNews') }}</a>
        </ElCol>
      </ElRow>
    </template>
    <ElTimeline>
      <ElTimelineItem v-for="item in newses" :key="item.id" :timestamp="item.time" placement="top">
        <ElSpace>
          <SoybeanAvatar class="size-48px!" />
          <p>{{ item.content }}</p>
        </ElSpace>
      </ElTimelineItem>
    </ElTimeline>
  </ElCard>
</template>

<style scoped></style>
