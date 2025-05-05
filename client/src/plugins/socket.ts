import { io } from 'socket.io-client'
import { useOrderStore } from '@/store/modules/order';
import { useAuthStore } from '@/store/modules/auth';
import { useNotificationStore } from '@/store/modules/notification';

const socket = io(import.meta.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000', {
  autoConnect: false, // 禁用自动连接
});

// 类型扩展
declare module 'socket.io-client' {
  interface Socket {
    connect(): void;
    disconnect(): void;
  }
}

export function setupSocket() {
    const orderStore = useOrderStore();
    const noti = useNotificationStore();
    const authStore = useAuthStore();
    // 合法角色
    const allowedRoles = ['passenger', 'driver', 'admin'];
    socket.on('connect', () => {
      if (authStore.userInfo && allowedRoles.includes(authStore.userInfo.role)) {
        socket.emit('register', {
          userId: authStore.userInfo._id,
          role: authStore.userInfo.role,
          token: authStore.token
        }); // 注册当前用户 ID
        console.log('WebSocket 已连接，用户 ID:', authStore.userInfo._id);
        if (authStore.userInfo.role === 'driver') {
          orderStore.fetchTasks();  // 司机上线时同步订单
        }
      } else {
        console.error('未找到用户信息，无法注册');
      }
    });
    socket.on('connect_error', (error) => {
      console.error('WebSocket 连接失败:', error);
    });
    // 监听订单相关通知
    socket.on('order', async (notification) => {
      noti.addNotification(notification);
    });
    // 乘客发布新订单
    socket.on('newOrder', async ({ order }) => {
      orderStore.newOrder(order);
    });
    // 司机接单
    socket.on('order_matched', async (data) => {
      orderStore.orderMatched(data.orderId);
    });
    // 司机确认订单
    socket.on('order_confirmed', async (data) => {
      orderStore.orderConfirmed(data.orderId._id);
    });
    // 完成订单
    socket.on('order_completed', async (data) => {
      orderStore.orderCompleted(data.orderId._id);
    });
    // 乘客取消订单，有司机接单
    socket.on('order_cancelled', async (data) => {
      orderStore.cancelOrder(data.orderId._id);
      noti.addNotification(data);
    });
    // 乘客取消没有司机接单的订单
    socket.on('orderRemoved', async (orderId) => {
      // 删除一条订单
      orderStore.cancelOrder(orderId);
    });
    // 监听其他通知（如订单完成、评价请求）
    socket.on('system', async (notification) => {
      // 可触发评价弹窗（乘客端）
      noti.addNotification(notification);
    });
    // 监听评价相关通知
    socket.on('review', async (notification) => {
      noti.addNotification(notification);
    });
    // 支付通知
    socket.on('payment', async (notification) => {
      noti.addNotification(notification);
    });
    socket.on('disconnect', () => {
      console.log('WebSocket 已断开');
    });
    return socket;
}


export function getSocket() {
  return socket
}