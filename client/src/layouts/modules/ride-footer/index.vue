<script lang="ts" setup>

</script>

<template>

  <footer class="py-3 px-3 sm:py-8 sm:px-6 text-center bg-dark-200/50 border-t border-gray-700/20">
    <div class="container mx-auto">
      <div class="flex flex-col items-center gap-0.5 sm:gap-4">
        <!-- 品牌图标 -->
        <SvgIcon icon="mdi:car" class="w-4 h-4 sm:w-8 sm:h-8 text-purple-300" />
        <!-- 品牌名称 -->
        <h2 class="text-base sm:text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
          拼途灵动
        </h2>
        <!-- 描述文字 -->
        <p class="text-gray-400 text-xs sm:text-base max-w-[180px] sm:max-w-md mx-auto">
          致力于为用户提供便捷、安全、高效的拼车服务，让出行更轻松，让生活更美好。我们连接城市与乡村，倡导绿色出行，打造智能化拼车体验。
        </p>
        <!-- 链接区域 -->
        <div class="flex flex-col sm:flex-row gap-0.5 sm:gap-4 mt-0.5 sm:mt-2 mb-0.5 sm:mb-2">
          <a href="https://github.com/Rocdna" class="flex items-center space-x-1 text-purple-300 hover:text-pink-300 text-sm sm:text-base py-1.5 transition-colors">
            <SvgIcon icon="mdi:email" class="w-2.5 h-2.5 sm:w-5 sm:h-5 text-purple-300 hover:text-pink-300 transition-colors" />
            <span>联系我们</span>
          </a>
          <span class="hidden sm:block text-gray-500">|</span>
          <a href="https://github.com/Rocdna" class="flex items-center space-x-1 text-purple-300 hover:text-pink-300 text-sm sm:text-base py-1.5 transition-colors">
            <SvgIcon icon="mdi:document" class="w-2.5 h-2.5 sm:w-5 sm:h-5 text-purple-300 hover:text-pink-300 transition-colors" />
            <span>服务条款</span>
          </a>
          <span class="hidden sm:block text-gray-500">|</span>
          <a href="https://github.com/Rocdna" class="flex items-center space-x-1 text-purple-300 hover:text-pink-300 text-sm sm:text-base py-1.5 transition-colors">
            <SvgIcon icon="mdi:lock" class="w-2.5 h-2.5 sm:w-5 sm:h-5 text-purple-300 hover:text-pink-300 transition-colors" />
            <span>隐私政策</span>
          </a>
        </div>
        <!-- 版权信息 -->
        <p class="text-gray-500 text-xs sm:text-base">© 2025 拼途灵动 版权所有</p>
      </div>
    </div>
  </footer>

</template>

<style scoped>
</style>