<script setup>
import { fetchLogsList } from '@/service/api';
import { ref, onMounted } from 'vue';

// 查询表单数据
const queryForm = ref({
  username: '',
  role: '',
  action: '',
  success: undefined,
  dateRange: [], // 使用单一数组存储时间范围
  current: 1,
  size: 10,
});

// 日志列表数据
const logsList = ref([]);
const total = ref(0);
const loading = ref(false);

// 角色选项
const roleOptions = [
  { label: '乘客', value: 'passenger' },
  { label: '司机', value: 'driver' },
  { label: '管理员', value: 'admin' },
  { label: '系统', value: 'system' },
];

// 成功状态选项
const successOptions = [
  { label: '成功', value: true },
  { label: '失败', value: false },
];

// 时间范围选择器快捷选项
const shortcuts = [
  {
    text: '最近一天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
];

// 查询日志列表
const fetchLogs = async () => {
  try {
    loading.value = true;
    const params = {
      ...queryForm.value,
      startTime: queryForm.value.dateRange[0] ? new Date(queryForm.value.dateRange[0]).toISOString() : undefined,
      endTime: queryForm.value.dateRange[1] ? new Date(queryForm.value.dateRange[1]).toISOString() : undefined,
    };
    const { data, error } = await fetchLogsList(params);
    if (!error) {
        logsList.value = data.records;
        total.value = data.total;
    }
  } catch (error) {
    window.$message?.error('获取日志列表失败');
    console.error('获取日志失败:', error);
  } finally {
    loading.value = false;
  }
};

// 重置查询条件
const resetQuery = () => {
  queryForm.value = {
    username: '',
    role: '',
    action: '',
    success: undefined,
    dateRange: [],
    current: 1,
    size: 10,
  };
  fetchLogs();
};

// 页码或页面大小变更
const handlePageChange = () => {
  fetchLogs();
};

// 初始加载日志
onMounted(() => {
  fetchLogs();
});


</script>

<template>
    <div class="log-list-container p-4">
      <!-- 查询表单 -->
      <el-card class="mb-4">
        <el-form :model="queryForm" inline label-width="80px">
          <el-form-item label="用户名">
            <el-input
              v-model="queryForm.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter="fetchLogs"
            >
              <template #prefix>
                <SvgIcon icon="mdi:account" class="text-gray-500" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select
              v-model="queryForm.role"
              placeholder="请选择角色"
              clearable
              @change="fetchLogs"
            >
              <el-option
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="操作类型">
            <el-input
              v-model="queryForm.action"
              placeholder="请输入操作类型"
              clearable
              @keyup.enter="fetchLogs"
            >
              <template #prefix>
                <SvgIcon icon="mdi:cog" class="text-gray-500" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="操作结果">
            <el-select
              v-model="queryForm.success"
              placeholder="请选择结果"
              clearable
              @change="fetchLogs"
            >
              <el-option
                v-for="item in successOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="queryForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :shortcuts="shortcuts"
              @change="fetchLogs"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchLogs">
              <SvgIcon icon="mdi:magnify" class="mr-1" />
              查询
            </el-button>
            <el-button @click="resetQuery">
              <SvgIcon icon="mdi:refresh" class="mr-1" />
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 日志列表 -->
      <el-card>
        <el-table
          :data="logsList"
          v-loading="loading"
          stripe
          border
          class="w-full"
        >
          <el-table-column prop="userId.username" label="用户名" width="150" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
                <el-tag
                    :type="{
                        admin: 'danger',
                        passenger: 'success',
                        driver: 'info',
                        system: 'warning'
                    }[row.role] || 'info'"
                    >
                    {{ row.role === 'passenger' ? '乘客' : row.role === 'driver' ? '司机' : row.role === 'admin' ? '管理员' : '系统' }}
                </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="操作类型" width="200" />
          <el-table-column prop="message" label="操作详情" show-overflow-tooltip />
          <el-table-column prop="success" label="结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.success ? 'success' : 'danger'">
                {{ row.success ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="timestamp" label="时间" width="180">
            <template #default="{ row }">
              {{ new Date(row.timestamp).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 分页 -->
        <el-pagination
          v-model:current-page="queryForm.current"
          v-model:page-size="queryForm.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          class="mt-4 flex justify-end"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </el-card>
    </div>
</template>

<style scoped></style>