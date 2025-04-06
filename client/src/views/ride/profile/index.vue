<script lang="ts" setup>
import { computed, ref, watch,onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { ElForm, ElMessageBox } from 'element-plus';
import { formatToLocal } from '@/utils/format'

const auth = useAuthStore();
const { updateDriverStatus, updateNotificationSettings, updateProfile } = auth;
const userInfo = auth.userInfo;
const role = userInfo.role;

// 支付方式图标映射
const paymentIcons: Record<string, string> = {
  aliplay: 'mdi:all-inclusive-box', // 假设使用 Material Design Icons 的支付宝图标
  wechat: 'mdi:wechat',   // 假设使用微信图标
  creditCard: 'mdi:credit-card', // 使用银行卡图标
};

const getPaymentIcon = (type: string | undefined):string => {
  return paymentIcons[type || ''] || 'mdi:credit-card'; // 默认使用信用卡图标
};

// 表单数据，初始化时从 userInfo 同步
const form = ref({
  notification: {
    orderNotifications: userInfo.notificationSettings?.orderNotifications || false,
    paymentNotifications: userInfo.notificationSettings?.paymentNotifications || false,
    reviewNotifications: userInfo.notificationSettings?.reviewNotifications || false,
    systemNotifications: userInfo.notificationSettings?.systemNotifications || false,
  },
});

// 计算初始表单值
const initialForm = computed(() => ({
  name: userInfo?.profile?.name || '',
  idNumber: userInfo?.profile?.idNumber || '',
  gender: userInfo?.profile?.gender || 'other',
  birthDate: userInfo?.profile?.birthDate || '' || new Date(),
  defaultPaymentMethod: userInfo?.profile?.defaultPaymentMethod || '',
  licensePlate: userInfo?.profile?.licensePlate || '',
  vehicleModel: userInfo?.profile?.vehicleModel || '',
  avatar: userInfo.profile?.avatar || '',
  status: userInfo.profile?.status || 'offline',
  rating: userInfo.profile?.rating || 5,
  rides: 0,
  lastLogin: userInfo.lastLogin || new Date().toISOString(),
  createdAt: userInfo.createdAt || new Date().toISOString(),
  updatedAt: userInfo.updatedAt || new Date().toISOString(),
  username: userInfo.username || '',
  phone: userInfo.phone || '',
  role: userInfo.role || 'visitor',
  recentActivities: [ // 新增：最近活动
    { id: 1, action: '完成拼车', date: '2025/3/15 18:30:00', details: '从上海到杭州' }
  ],
  points: 1000, // 新增：积分
}));

// 计算状态颜色
const statusColor = computed(() => {
  const colorMap = {
    online: '#4A90E2', // 柔和蓝色，主色调
    offline: '#6B7280', // 深灰色
    locked: '#EF4444', // 红色，突出警告
  };
  return colorMap[initialForm.value.status] || '#6B7280';
});

// 计算状态文本
const statusText = computed(() => {
  const textMap = {
    online: '可拼车',
    offline: '不可拼车',
    locked: '账户锁定',
  };
  return textMap[initialForm.value.status] || '不可拼车';
});



// 使用 ref 管理表单数据
const editedForm = ref({ ...initialForm.value });

// 表单引用
const editFormRef = ref<InstanceType<typeof ElForm> | null>(null);

// 身份证号校验规则
const validateIdNumber = (rule: any, value: string, callback: (error?: Error) => void) => {
  const idNumberRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
  if (!value) {
    callback(new Error('请输入身份证号'));
  } else if (!idNumberRegex.test(value)) {
    callback(new Error('请输入有效的身份证号'));
  } else {
    callback();
  }
};

// 表单校验规则
const editRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  idNumber: [
    { required: true, validator: validateIdNumber, trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' },
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' },
  ],
  defaultPaymentMethod: [
    { required: true, message: '请选择默认支付方式', trigger: 'change' },
  ],
  licensePlate: [
    { required: false, message: '请输入车牌号', trigger: 'blur' }, // 可选字段
  ],
  vehicleModel: [
    { required: false, message: '请输入车辆型号', trigger: 'blur' }, // 可选字段
  ],
};

// 保存状态
const saving = ref(false);

// 表单对话框控制
const formDialogVisible = ref(false);
// 打开编辑对话框
const openEditDialog = () => {
  if (editedForm.value) {
    formDialogVisible.value = true; // 设置 dialogVisible 为 true，打开对话框
  }
};

// 打开对话框时初始化表单
const onDialogOpen = () => {
  editedForm.value = { ...initialForm.value };
};

// 关闭对话框时重置表单
const onDialogClose = () => {
  editedForm.value = { ...initialForm.value };
  editFormRef.value?.resetFields();
};

// 对话框关闭前的确认
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的更改将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      done();
    })
    .catch(() => {
      // 用户取消关闭
    });
};

// 保存表单
const saveEditedForm = async () => {
  if (!editFormRef.value) return;
  try {
    // 表单校验
    await editFormRef.value.validate();

    saving.value = true;
    // 提交到后端
    await updateProfile({
      name: editedForm.value.name,
      idNumber: editedForm.value.idNumber,
      birthDate: editedForm.value.birthDate,
      gender: editedForm.value.gender,
      licensePlate: editedForm.value.licensePlate,
      vehicleModel: editedForm.value.vehicleModel,
      defaultPaymentMethod: editedForm.value.defaultPaymentMethod,
    });
    formDialogVisible.value = false;
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  // 重置表单
  editedForm.value = { ...initialForm.value };
  editFormRef.value?.resetFields();
  // 关闭对话框（如果在对话框中）
  formDialogVisible.value = false;
};


// 添加保存通知设置的方法
const saveNotificationSettings = () => {
  updateNotificationSettings(form.value.notification);
};

// 监听 userInfo 变化，保持表单与真实数据同步
watch(
  () => auth.userInfo,
  (newUserInfo) => {
    form.value.notification = {
      orderNotifications: newUserInfo.notificationSettings?.orderNotifications || false,
      paymentNotifications: newUserInfo.notificationSettings?.paymentNotifications || false,
      reviewNotifications: newUserInfo.notificationSettings?.reviewNotifications || false,
      systemNotifications: newUserInfo.notificationSettings?.systemNotifications || false,
    };
  },
  { immediate: true }
);


// 取消设置的函数
const cancelNotificationSettings = () => {
  // 恢复到 userInfo 中的原始通知设置
  form.value.notification = {
    orderNotifications: userInfo.notificationSettings?.orderNotifications || false,
    paymentNotifications: userInfo.notificationSettings?.paymentNotifications || false,
    reviewNotifications: userInfo.notificationSettings?.reviewNotifications || false,
    systemNotifications: userInfo.notificationSettings?.systemNotifications || false,
  };
};


// 性别选项
const genderOptions = ['male', 'female', 'other'];

// 头像对话框控制
const dialogVisible = ref(false);

const backendUrl = import.meta.env.VITE_SERVICE_BASE_URL || 'http://localhost:3000';
// 构造完整的头像 URL
const getAvatarUrl = (avatar: string): string => {
  // 如果 avatar 已经是完整 URL，直接返回
  if (avatar.startsWith('http')) {
    return avatar;
  }
  // 否则，拼接后端地址
  return `${backendUrl}${avatar}`; // 例如 http://localhost:5000/uploads/123456789.jpg
};

// 上传成功回调
const handleAvatarSuccess = (response: any) => {
  if (response.code === 200 && response.data.success) {
    // 更新 userInfo 中的头像
    if (userInfo?.profile) {
      userInfo.profile.avatar = getAvatarUrl(response.data.avatar); // 假设后端返回头像 URL
    }
    window.$message?.success('头像上传成功');
  } else {
    window.$message?.error('头像上传失败');
  }
};

// 上传请求头
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${auth.token}`,
}));
// 上传前校验
const beforeAvatarUpload = (file: File): boolean => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
  const isLt2M = file.size / 1024 / 1024 < 2; // 限制文件大小 2MB
  if (!isImage) {
    window.$message?.error('只能上传 JPG/PNG 格式的图片！');
    return false;
  }
  if (!isLt2M) {
    window.$message?.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

// 上传失败
const handleAvatarError = (error: Error) => {
  window.$message?.error('头像上传失败，请稍后重试');
  console.error(error);
};

// 头像放大
// 控制放大图片对话框的显示
const imageDialogVisible = ref(false);

// 打开放大图片对话框
const openImageDialog = () => {
  imageDialogVisible.value = true;
};

// 判断是否为移动端
const isMobile = ref(window.innerWidth <= 640);
const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 640;
};

onMounted(() => {
  window.addEventListener('resize', updateIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile);
});

// 计算属性：处理 birthDate 的格式转换
const birthDateForInput = computed({
  get: () => {
    if (!editedForm.value.birthDate) return '';
    const date = new Date(editedForm.value.birthDate);
    return date.toISOString().split('T')[0]; // 转换为 yyyy-MM-dd 格式
  },
  set: (value: string) => {
    if (value) {
      editedForm.value.birthDate = new Date(value); // 将字符串转换回 Date 对象
    } else {
      editedForm.value.birthDate = '';
    }
  },
});


</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300 pt-16">
    <!-- 个人中心内容 -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 标题：简化为单一蓝色，添加下划线装饰 -->
      <h2 class="text-2xl md:text-3xl font-bold mb-12 text-center text-blue-500 relative">
        个人中心
        <span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-blue-500 rounded-full"></span>
      </h2>

      <!-- 主内容区域：调整为不对称布局 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- 左侧：用户信息和统计 -->
        <div class="lg:col-span-1 space-y-8">
          <!-- 用户信息卡片：突出头像，微透明背景 -->
          <div class="bg-gray-800/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-700">
            <div class="flex items-center gap-4 mb-4">
              <div class="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group" @click="dialogVisible = true">
                <img
                  v-if="initialForm.avatar"
                  :src="initialForm.avatar"
                  class="w-full h-full rounded-full object-cover border-2 border-blue-500 group-hover:border-blue-600 transition-all duration-300"
                  alt="User Avatar"
                />
                <span v-else class="w-full h-full flex items-center justify-center bg-gray-700 text-xl rounded-full">
                  {{ initialForm.username[0] || 'U' }}
                </span>
              </div>
              <div>
                <h3 class="text-xl font-semibold flex items-center gap-2 text-white">
                  <SvgIcon icon="mdi:account-circle" class="text-white text-2xl group-hover:text-blue-500 transition-colors duration-300" />
                  {{ initialForm.username }}
                </h3>
                <p class="text-gray-400">手机号: {{ initialForm.phone }}</p>
                <p :style="{ color: statusColor }" class="text-sm font-medium">{{ statusText }}</p>
              </div>
            </div>
            <div class="space-y-2 text-gray-300">
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:shield-account" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                <strong>角色:</strong> {{ initialForm.role }}
              </p>
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:star" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                <strong>评分:</strong>
                <ElRate 
                  v-model="initialForm.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  :score-template="initialForm.rating + '分'"
                />
              </p>
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:clock-outline" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                <strong>最后登录:</strong> {{ formatToLocal(initialForm.lastLogin) }}
              </p>
            </div>
          </div>

          <!-- 统计信息卡片：新增 -->
          <div class="bg-gray-800/80 p-6 rounded-xl shadow-md border border-gray-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <SvgIcon icon="mdi:chart-bar" class="text-white text-xl group-hover:text-blue-500 transition-colors duration-300" />
              用户统计
            </h3>
            <div class="space-y-2 text-gray-300">
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:car" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                <strong>拼车次数:</strong> {{ initialForm.rides }}
              </p>
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:coin" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                <strong>积分:</strong> {{ initialForm.points }}
              </p>
            </div>
          </div>
          
          <!-- 通知设置卡片：新增 -->
          <div class="bg-gray-800/80 p-6 rounded-xl shadow-md border border-gray-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <SvgIcon icon="mdi:bell-outline" class="text-white text-xl group-hover:text-blue-500 transition-colors duration-300" />
              通知设置
            </h3>
            <div class="space-y-4 text-gray-300">
              <!-- 订单提醒 -->
              <div class="flex items-center justify-between">
                <p class="flex items-center gap-2">
                  <SvgIcon icon="mdi:car" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                  <span>订单提醒</span>
                </p>
                <ElSwitch
                  v-model="form.notification.orderNotifications"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
              <!-- 支付通知 -->
              <div class="flex items-center justify-between">
                <p class="flex items-center gap-2">
                  <SvgIcon icon="mdi:coin" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                  <span>支付通知</span>
                </p>
                <ElSwitch
                  v-model="form.notification.paymentNotifications"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
              <!-- 评价通知 -->
              <div class="flex items-center justify-between">
                <p class="flex items-center gap-2">
                  <SvgIcon icon="mdi:calendar" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                  <span>评价通知</span>
                </p>
                <ElSwitch
                  v-model="form.notification.systemNotifications"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
              <!-- 系统消息 -->
              <div class="flex items-center justify-between">
                <p class="flex items-center gap-2">
                  <SvgIcon icon="mdi:information-outline" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                  <span>系统消息</span>
                </p>
                <ElSwitch
                  v-model="form.notification.reviewNotifications"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
            </div>
            <!-- 保存按钮 -->
            <div class="mt-6 flex gap-1 justify-center">
              <ElButton type="primary" @click="saveNotificationSettings" class="w-6xl">
                保存设置
              </ElButton>
              <ElButton type="primary" @click="cancelNotificationSettings" class="w-6xl">
                取消设置
              </ElButton>
            </div>
          </div>
        </div>

        <!-- 右侧：账户信息、最近活动和编辑信息 -->
        <div class="lg:col-span-2 space-y-8">
          <!-- 账户信息卡片 -->
          <div class="bg-gray-800/80 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <SvgIcon icon="mdi:information-outline" class="text-white text-xl group-hover:text-blue-500 transition-colors duration-300" />
              账户信息
            </h3>
            <div class="space-y-2 text-gray-300">
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:account-check" :style="{ color: statusColor }" class="text-lg" />
                <strong>状态:</strong> {{ statusText }}
              </p>
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:calendar-plus" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                <strong>创建时间:</strong> {{ formatToLocal(initialForm.createdAt) }}
              </p>
              <p class="flex items-center gap-2">
                <SvgIcon icon="mdi:calendar-edit" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                <strong>更新时间:</strong> {{ formatToLocal(initialForm.updatedAt) }}
              </p>
            </div>
          </div>

          <!-- 最近活动卡片：新增 -->
          <div class="bg-gray-800/80 p-6 rounded-xl shadow-md border border-gray-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <SvgIcon icon="mdi:history" class="text-white text-xl group-hover:text-blue-500 transition-colors duration-300" />
              最近活动
            </h3>
            <div class="space-y-4">
              <div v-for="activity in initialForm.recentActivities" :key="activity.id" class="flex items-center justify-between text-gray-300 border-b border-gray-700 pb-2">
                <div>
                  <p class="flex items-center gap-2">
                    <SvgIcon icon="mdi:alert-circle-outline" class="text-white text-lg group-hover:text-blue-500 transition-colors duration-300" />
                    <strong>{{ activity.action }}</strong>
                  </p>
                  <p class="text-sm text-gray-400">{{ activity.details }}</p>
                </div>
                <p class="text-sm text-gray-400">{{ formatToLocal(activity.date) }}</p>
              </div>
            </div>
          </div>

          <!-- 替换原来的“编辑个人信息”区域 -->
          <div class="bg-gray-800/80 p-4 sm:p-6 rounded-xl shadow-md border border-gray-700">
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <h3 class="text-xl sm:text-3xl font-semibold flex items-center gap-2 text-white">
                <SvgIcon icon="mdi:pencil-outline" class="text-white text-base sm:text-xl group-hover:text-blue-500 transition-colors duration-300" />
                个人信息
              </h3>
              <button
                @click="openEditDialog"
                class="px-2 py-1 sm:px-3 sm:py-2 bg-blue-500 rounded-lg text-white font-semibold hover:bg-blue-600 transition-all duration-300 hover:shadow-glow flex items-center gap-1"
              >
                <SvgIcon icon="mdi:edit" class="text-white text-base sm:text-lg" />
                编辑
              </button>
            </div>
            <div class="space-y-1 sm:space-y-2 text-gray-300">
              <p class="flex items-center gap-2 text-sm sm:text-lg p-1">
                <SvgIcon icon="mdi:account" class="text-white text-base sm:text-xl group-hover:text-blue-500 transition-colors duration-300" />
                <strong>姓名:</strong> {{ initialForm.name || '未设置' }}
              </p>
              <p class="flex items-center gap-2 text-sm sm:text-lg p-1">
                <SvgIcon icon="mdi:gender-male-female" class="text-white text-base sm:text-xl group-hover:text-blue-500 transition-colors duration-300" />
                <strong>性别:</strong> {{ initialForm.gender || '未设置' }}
              </p>
              <p class="flex items-center gap-2 text-sm sm:text-lg p-1">
                <SvgIcon icon="mdi:calendar" class="text-white text-base sm:text-xl group-hover:text-blue-500 transition-colors duration-300" />
                <strong>出生日期:</strong> {{ formatToLocal(initialForm.birthDate) || '未设置' }}
              </p>
              <p class="flex items-center gap-2 text-sm sm:text-lg p-1">
                <SvgIcon icon="mdi:id-card" class="text-white text-base sm:text-xl" />
                <strong>身份证号:</strong> {{ initialForm.idNumber || '未设置' }}
              </p>
              <!-- 乘客：默认支付方式 -->
              <p v-if="role === 'passenger'" class="flex items-center gap-2 text-sm sm:text-lg p-1">
                <SvgIcon icon="mdi:paypal" class="text-white text-base sm:text-xl" />
                <strong>默认支付方式:</strong>{{ initialForm.defaultPaymentMethod || '信用卡' }}
                <SvgIcon
                  :icon="getPaymentIcon(initialForm.defaultPaymentMethod as string)"
                  class="text-white text-base sm:text-xl"
                />
              </p>
              <!-- 司机：车牌号和车型 -->
              <div v-if="role === 'driver'" class="space-y-1 sm:space-y-2">
                <p class="flex items-center gap-2 text-sm sm:text-lg p-1">
                  <SvgIcon icon="mdi:car" class="text-white text-base sm:text-xl" />
                  <strong>车牌号:</strong>
                  <span>{{ userInfo.profile?.licensePlate || '未设置' }}</span>
                </p>
                <p class="flex items-center gap-2 text-sm sm:text-lg p-1">
                  <SvgIcon icon="mdi:car-side" class="text-white text-base sm:text-xl" />
                  <strong>车型:</strong>
                  <span>{{ userInfo.profile?.vehicleModel || '未设置' }}</span>
                </p>
              </div>
            </div>
          </div>
            
          <!-- 状态修改 -->
          <div v-if="role == 'driver'" class="bg-gray-800/80 p-t-0">
            <button @click="updateDriverStatus('offline')" v-if="initialForm.status == 'online'" class="w-full h-12 bg-red-5 text-light rounded-lg hover:bg-red-6">下线</button>
            <button @click="updateDriverStatus('online')" v-else class="w-full h-12 bg-green-5 text-light rounded-lg hover:bg-green-4">上线</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="上传头像"
      :width="isMobile ? '90%' : '40%'"
      modal-class="custom-modal"
      :lock-scroll="true"
      :before-close="() => (dialogVisible = false)"
    >
      <!-- 图片容器 -->
      <div class="avatar-container w-full m-auto mb-4 flex justify-center" style="user-select: none">
       <!-- 图片和遮罩的直接容器 -->
        <div class="image-wrapper relative" >
          <img
            :src="initialForm.avatar"
            class="w-65 h-65 rounded-2xl border-2 border-blue-300 white-shadow cursor-pointer"
          />
          <!-- 遮罩和放大图标 -->
          <div
            class="avatar-overlay absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 rounded-2xl opacity-0 pointer-events-none transition-opacity duration-300"
          >
            <svg
              class="w-10 h-10 text-white cursor-pointer hover:text-blue-500 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              @click.stop="openImageDialog"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zm0-4v-4m0 0V7m0 4h4m-4 0H7"
              />
            </svg>
          </div>
        </div>
      </div>
      
      <el-upload
        class="upload-demo"
        drag
        action="http://localhost:3000/users/avatar"
        name="avatar"
        :auto-upload="true"
        :show-file-list="false"
        :headers="uploadHeaders"
        :on-error="handleAvatarError"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <SvgIcon icon="mdi:cloud-upload-outline" class="text-gray-400 text-9xl ma group-hover:text-blue-500 transition-colors duration-300" />
        <div class="el-upload__text text-gray-300">
          拖拽或 <em class="text-blue-500 hover:text-blue-400 transition-colors duration-300">点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-gray-400">支持 <b class="text-violet">jpg/png</b> 文件，建议尺寸不大于 <b class="text-violet">2MB</b></div>
        </template>
      </el-upload>
    </el-dialog>

    <!-- 新增编辑对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      title="编辑个人信息"
      :width="isMobile ? '90%' : '40%'"
      :lock-scroll="true"
      modal-class="custom-modal"
      center
      :close-on-click-modal="false"
      :before-close="handleClose"
      @open="onDialogOpen"
      @close="onDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editedForm"
        :rules="editRules"
        :label-position="isMobile ? 'top' : 'left'"
        :label-width="isMobile ? 'auto' : '110px'"
        class="space-y-2 sm:space-y-4 px-2 sm:px-4"
        @submit.prevent="saveEditedForm"
      >
        <!-- 姓名 -->
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="editedForm.name"
            placeholder="请输入姓名"
            clearable
            class="w-full"
          />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="editedForm.gender"
            placeholder="请选择性别"
            class="w-full"
          >
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <!-- 身份证号 -->
        <el-form-item label="身份证号" prop="idNumber">
          <el-input
            v-model="editedForm.idNumber"
            placeholder="请输入身份证号"
            clearable
            class="w-full"
          />
        </el-form-item>

        <!-- 默认支付方式 -->
        <el-form-item v-if="role == 'passenger'" label="默认支付方式" prop="defaultPaymentMethod">
          <el-select
            v-model="editedForm.defaultPaymentMethod"
            placeholder="请选择支付方式"
            class="w-full"
          >
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银行卡" value="bank" />
          </el-select>
        </el-form-item>

        <!-- 车牌号 -->
        <el-form-item
          v-if="role === 'driver'"
          label="车牌号"
          prop="licensePlate"
        >
          <el-input
            v-model="editedForm.licensePlate"
            placeholder="请输入车牌号"
            clearable
            class="w-full"
          />
        </el-form-item>

        <!-- 车辆型号 -->
        <el-form-item
          v-if="role === 'driver'"
          label="车辆型号"
          prop="vehicleModel"
        >
          <el-input
            v-model="editedForm.vehicleModel"
            placeholder="请输入车辆型号"
            clearable
            class="w-full"
          />
        </el-form-item>

        <!-- 出生日期 -->
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="editedForm.birthDate"
            v-if="!isMobile"
            type="date"
            placeholder="请选择出生日期"
            class="w-full sm:mb-4"
            :disabled-date="(date: Date) => date > new Date()"
          />
          <input
            v-else
            v-model="birthDateForInput"
            type="date"
            class="w-full border rounded px-3 py-2"
            :max="new Date().toISOString().split('T')[0]"
          />
        </el-form-item>

        <!-- 对话框底部按钮 -->
        <div class="flex justify-end gap-2 sm:gap-3">
          <el-button
            class="w-full sm:w-auto"
            type="primary"
            :loading="saving"
            @click="saveEditedForm"
          >
            保存
          </el-button>
          <el-button
            class="w-full sm:w-auto"
            @click="cancelEdit"
          >
            取消
          </el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 放大图片的对话框 -->
    <el-dialog
      v-model="imageDialogVisible"
      :width="isMobile ? '100%' : ''"
      :before-close="() => (imageDialogVisible = false)"
      style="user-select: none"
    >
      <img :src="initialForm.avatar" class="max-w-full max-h-[80vh] m-auto" />
    </el-dialog>
  </div>
</template>

<style scoped>
/* 自定义背景颜色 */
.bg-gray-850 {
  background-color: #1f2525;
}

/* 使用 :deep() 穿透样式隔离，确保作用于 el-dialog 根元素 */
:deep(.el-dialog) {
  background-color: rgba(48, 48, 48, 0.96) !important; /* 确保 background-color 生效 */
  border: 1px solid #94978e91 !important;
}

:deep(.el-dialog__title) {
  color: #FFFFFF !important; /* 设置标题颜色为白色 */
  font-size: 16px !important; /* 可选：调整字体大小 */
  font-weight: 600 !important; /* 可选：加粗标题 */
}

:deep(.el-overlay) {
  background: rgba(0, 0, 0, 0.5) !important;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px) !important;
}

/* 自定义遮罩层的样式 */
.custom-modal {
  background: rgba(0, 0, 0, 0.5) !important; /* 半透明黑色背景 */
  backdrop-filter: blur(15px) !important;  /* 添加模糊效果，值可调整 */
}

/* Element Plus 上传组件样式调整 */
:deep(.el-upload-dragger) {
  background: #1f2525;
  border: 1px dashed #6B7280;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #4A90E2;
  background: #25232E;
}

/* 标签字体颜色 */
:deep(.el-form-item__label) {
  color: #e7e7e7; /* 深灰色，与截图一致 */
}

/* 优化输入框和选择框的 placeholder 颜色 */
input::placeholder {
  color: #6B7280;
}

/* 优化文字颜色 */
.text-gray-300 {
  color: #D1D5DB;
}

.text-white {
  color: #FFFFFF;
}

/* 优化图标容器 */
.icon-container {
  display: flex;
  align-items: center;
}

.icon-container:hover .group-hover\:text-blue-500 {
  color: #4A90E2;
}

.white-shadow {
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.359);
}

/* 图片容器 */
.avatar-container {
  display: flex;
  justify-content: center;
}

/* 图片和遮罩的直接容器 */
.image-wrapper {
  position: relative;
}

/* 图片样式 */
.image-wrapper img {
  display: block; /* 移除底部间距 */
  transition: filter 0.3s ease;
}

/* 悬浮时变暗效果 */
.image-wrapper:hover img {
  filter: brightness(70%);
}

/* 遮罩和放大图标 */
.avatar-overlay {
  transition: opacity 0.3s ease;
}

/* 悬浮时显示遮罩 */
.image-wrapper:hover .avatar-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* 确保图标可点击 */
.avatar-overlay svg {
  pointer-events: auto; /* 确保图标可点击 */
}

</style>