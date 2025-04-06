import { createApp } from 'vue';
import './plugins/assets';
import {
  setupAppVersionNotification,
  setupDayjs,
  setupIconifyOffline,
  setupLoading,
  setupNProgress,
  setupUI,
  setupSocket
} from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { setupI18n } from './locales';
import App from './App.vue';
async function setupApp() {
  setupLoading();

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);

  setupUI(app);

  setupStore(app);

  await setupRouter(app);

  setupI18n(app);

  // 设置WebSocket - 在路由之后，挂载之前
  const socket = setupSocket();
  // 将socket实例提供给整个应用
  app.provide('socket', socket);
  // 可选：添加到全局属性
  app.config.globalProperties.$socket = socket;


  app.mount('#app');
  
}

setupApp();
