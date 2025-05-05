<script setup>
import BackGround from '../modules/global-bg/index.vue';
import GlobalContent from '../modules/global-content/index.vue';
import RideHeader from '../modules/ride-header/index.vue'
import RideFooter from '../modules/ride-footer/index.vue'
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
const auth = useAuthStore();

const effect = computed(() => {
  return auth.userInfo.bgEffect;
})
const route = useRoute();
const isShow = computed(() => {
  return ["ride_carpool", "ride_grab"].includes(route.name);
})
defineOptions({ name: 'BgLayout' });


</script>

<template>
  <div class="bg-gradient-to-b from-gray-800 to-black">
    <RideHeader/>
    <GlobalContent :show-padding="false" />
    <BackGround v-if="!isShow && effect"/>
    <RideFooter v-if="!isShow"/>
  </div>

</template>

<style scoped></style>