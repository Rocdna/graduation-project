<script setup lang="js">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟评价数据
const reviews = ref([
  { id: 'R001', user: '张三', content: '服务态度很好哦。', rating: 4, date: '2025-03-10 10:30' },
  { id: 'R002', user: '李四', content: '服务态度一般，需改进。', rating: 2, date: '2025-03-09 15:45' },
  { id: 'R003', user: '王五', content: '非常满意，期待下次乘车！', rating: 5, date: '2025-03-08 09:15' },
])

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredReviews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return reviews.value
    .filter(review => 
      !searchQuery.value || 
      review.content.includes(searchQuery.value) || 
      review.user.includes(searchQuery.value)
    )
    .slice(start, end)
})

// 详情对话框
const showDetailDialog = ref(false)
const selectedReview = ref({})

// 操作方法
const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const viewReview = (row) => {
  selectedReview.value = { ...row }
  showDetailDialog.value = true
}

const deleteReview = (row) => {
  ElMessageBox.confirm(`确定删除评价 ${row.id} 吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    reviews.value = reviews.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>



<template>
  <!-- <LookForward /> -->
  <!-- views/ReviewManagement.vue -->
  <div class="review-management p-6 min-h-screen bg-gray-100">
    <el-card class="rounded-lg">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold">评价管理</span>
          <el-input
            v-model="searchQuery"
            placeholder="搜索评价内容或用户"
            class="w-200"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
      </template>

      <el-table :data="filteredReviews" class="w-full" border>
        <el-table-column prop="id" label="评价ID" width="120" />
        <el-table-column prop="user" label="用户" width="150" />
        <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled class="text-xl" />
          </template>
        </el-table-column>
        <el-table-column prop="date" label="提交时间" width="150" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button
              class="text-blue-600 hover:text-blue-800"
              @click="viewReview(row)"
            >
              查看
            </el-button>
            <el-button
              class="text-red-600 hover:text-red-800"
              @click="deleteReview(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="reviews.length"
        layout="prev, pager, next"
        class="mt-4 flex justify-end"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 查看评价详情对话框 -->
    <el-dialog
      title="评价详情"
      v-model="showDetailDialog"
      width="500px"
      class="rounded-lg"
    >
      <div class="p-4">
        <p><strong>评价ID：</strong>{{ selectedReview.id }}</p>
        <p><strong>用户：</strong>{{ selectedReview.user }}</p>
        <p><strong>评分：</strong>
          <el-rate v-model="selectedReview.rating" disabled class="text-xl inline-block" />
        </p>
        <p><strong>提交时间：</strong>{{ selectedReview.date }}</p>
        <p><strong>评价内容：</strong>{{ selectedReview.content }}</p>
      </div>
      <template #footer>
        <el-button
          @click="showDetailDialog = false"
          class="px-4 py-2 rounded"
        >
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>


</style>
