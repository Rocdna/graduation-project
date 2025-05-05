import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { SetupStoreId } from '@/enum';
import { useLoading } from '@sa/hooks';
import { fetchDriverTasks, fetchAcceptOrder, fetchConfirmOrder, fetchCompleteOrder, fetchPassengerOrder, fetchCancelOrder, fetchCreateOrder } from '@/service/api';
import { formatToLocal } from '@/utils/format';

interface OrderTask {
    _id: string;
    orderNumber: string;
    status: 'pending' | 'matched' | 'confirmed' | 'completed' | 'canceled';
    startLocation: [ number, number ];
    startAddress: string;
    endAddress: string;
    endLocation: [ number, number ];
    seatCount: number;
    totalPrice: number;
    startTime: string;
    estimatedTime: number;
    distance: number;
    tripId?: any;
    driverId?: any;
    passengerId: any;
}

// const baseInfo = {
//   _id: '',
//   driverId: {},
//   status: 'start',
//   tripId: '',
//   startLocation: [],
//   startAddress: '',
//   endAddress: '',
//   endLocation: [],
//   seatCount: 0,
//   totalPrice: 0,
//   startTime: ''
// };

// 定义初始数据生成函数
function getBaseInfo() {
  return {
    _id: '',
    driverId: {},
    status: 'start',
    tripId: '',
    startLocation: [],
    startAddress: '',
    endAddress: '',
    endLocation: [],
    seatCount: 0,
    totalPrice: 0,
    startTime: ''
  };
}

export const useOrderStore = defineStore(SetupStoreId.Order, () => {
  const { loading, startLoading, endLoading } = useLoading();

  // 使用 reactive 定义状态对象
  const state = reactive({
    tasks: [] as OrderTask[],
    passengerOrder: getBaseInfo()
  });

  // 计算属性
  const availableOrders = computed(() => state.tasks.filter(task => task.status === 'pending'));
  const acceptedOrders = computed(() => state.tasks.filter(task => ['matched', 'confirmed'].includes(task.status)));
  const currentStatus = computed(() => state.passengerOrder.status);
  const driverInfo = computed(() => state.passengerOrder.driverId);
  // 获取任务列表
  async function fetchTasks() {
    startLoading();
    const { data, error } = await fetchDriverTasks();
    if (!error) {
        state.tasks = data; // 更新任务列表
    }
    endLoading();
  }

  // 司机接受订单
  async function matchOrder(orderId: string) {
    startLoading();
    try {
      const order = state.tasks.find(task => task._id === orderId);
      if (!order) throw new Error('订单未找到');

      const { data, error } = await fetchAcceptOrder(orderId, {
        status: 'matched',
        startLocation: order.startLocation, // 使用字符串地址而非坐标
        endLocation: order.endLocation,
        startAddress: order.startAddress, // API 要求 startAddress，复用 startLocation
        endAddress: order.endAddress,     // 同上
        estimatedTime: order.estimatedTime,             
        price: order.totalPrice,
        seats: order.seatCount,
        distance: order.distance,
      });

      if (!error) {
        // 更新任务列表
        const updatedOrder = data.order || data; // 根据实际返回调整
        const index = state.tasks.findIndex(task => task._id === orderId);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...updatedOrder, status: 'matched' };
        }
        window.$message?.success('接受订单成功')
      }
      
    } catch (error) {
      console.error('接受订单失败:', error);
    } finally {
      endLoading();
    }
  }
  // 司机确认订单
  async function confirmOrder(orderId: string) {
    startLoading();
    try {
      const { data, error } = await fetchConfirmOrder(orderId, { status: 'confirmed' });
      if (!error) {
        // 更新任务列表
        const updatedOrder = data.order || data;
        const index = state.tasks.findIndex(task => task._id === orderId);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...updatedOrder, status: 'confirmed' };
        }
        window.$message?.success('确定订单成功')
      }

    } catch (error) {
      console.error('确认订单失败:', error);
    } finally {
      endLoading();
    }
  }
  // 司机完成订单
  async function completeOrder(orderId: string) {
    startLoading();
    try {
      const { data, error } = await fetchCompleteOrder(orderId, { status: 'completed' });
      if (!error) {
        // 从任务列表移除已完成订单
        state.tasks = state.tasks.filter(task => task._id !== orderId);
        window.$message?.success('订单已完成');
      }
    } catch (error) {
      console.error('完成订单失败:', error);
    } finally {
      endLoading();
    }
  }
  // 取消一个订单
  async function cancelOrder(orderId: string) {
    // 把对应订单号的订单从 tasks 列表中删除
    state.tasks = state.tasks.filter(task => task._id !== orderId);
    window.$message?.success('订单已取消');
  }

  // 乘客创建新的订单，广播给司机消息
  async function newOrder(order: OrderTask) {
    console.log(order);
    state.tasks.push(order);
    window.$message?.success('您有新的订单啦！');
  }

  // 乘客实时获取当前订单
  async function getCurrentOrder() {
    startLoading();
    let flag = false;
    try {
      const { data, error } = await fetchPassengerOrder();
      if (!error) {
        if (data != null) {
          Object.assign(state.passengerOrder, data);
          state.passengerOrder.startTime = formatToLocal(state.passengerOrder.startTime);
          flag = true;
        }
      }
    } catch (error) {
      console.error('获取当前订单失败:', error);
    } finally {
      endLoading();
    }
    return flag;
  }

  // 乘客订单被接单
  async function orderMatched(order: OrderTask) {
    try {
      if (order._id === state.passengerOrder._id) {
        state.passengerOrder.status = 'matched';
        console.log(order.driverId);
        Object.assign(state.passengerOrder.driverId, order.driverId);
        console.log(state.passengerOrder.driverId);
      } else {
        console.error('订单确认失败:', '订单ID不匹配');
      }
    } catch(error) {
      console.error('接单失败:', error);
    }
  }

  // 乘客订单确认
  function orderConfirmed(orderId: string) {
    if (orderId === state.passengerOrder._id) {
      state.passengerOrder.status = 'confirmed';
    } else {
      console.error('订单确认失败:', '订单ID不匹配');
    }
  }

  // 乘客订单完成
  function orderCompleted(orderId: string) {
    if (orderId === state.passengerOrder._id) {
      state.passengerOrder.status = 'completed';
    } else {
      console.error('订单完成失败:', '订单ID不匹配');
    }
  }

  // 乘客取消订单  返回值
  async function orderCancelled(orderId: string, info: { reason?: string, status: 'cancelled' }) {
    startLoading();
    let flag = false;
    if (orderId === state.passengerOrder._id) {
      try {
        const { data, error } = await fetchCancelOrder(orderId, info);
        if (!error) {
          resetPassengerOrder();
          window.$message?.success('订单已取消！');
          flag = true;
        }
      } catch (error) {
        console.error('取消订单失败:', error);
      } finally {
        endLoading();
      }
    } else {
      console.error('订单取消失败:', '订单ID不匹配');
    }
    return flag;
  }

  // 乘客发布订单 返回值
  async function createOrder(info: {
    startAddress: string;
    endAddress: string;
    startLocation: [number, number];
    endLocation: [number, number];
    estimatedTime: number;
    startTime: string;
    seatCount: number;
    totalPrice: number;
    distance: number;
  }) {
    let flag = false;
    startLoading();
    try {
      const { data, error } = await fetchCreateOrder(info);
      if (!error) {
        Object.assign(state.passengerOrder, data);
        state.passengerOrder.startTime = formatToLocal(state.passengerOrder.startTime);
        window.$message?.success('订单发布成功');
        flag = true;
      }
    } catch (error) {
      console.error('发布订单失败:', error);
    } finally {
      endLoading();
    }
    return flag;
  }

  // 乘客数据重置
  function resetPassengerOrder() {
    Object.assign(state.passengerOrder, getBaseInfo());
  }
  // 清空任务数据
  function clearTasks() {
    state.tasks = [];
  }

  return {
    state,
    isLoading: loading,
    availableOrders,
    acceptedOrders,
    fetchTasks,
    getCurrentOrder,
    clearTasks,
    matchOrder,
    confirmOrder,
    completeOrder,
    cancelOrder,
    orderMatched,
    orderConfirmed,
    orderCompleted,
    orderCancelled,
    createOrder,
    currentStatus,
    driverInfo,
    resetPassengerOrder,
    newOrder
  };
})

