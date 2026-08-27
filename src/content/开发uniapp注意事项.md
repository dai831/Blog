```vue
<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">{{ pageTitle }}</text>
    </view>

    <!-- 主要内容区 -->
    <view class="content">
      <!-- 输入框示例 -->
      <view class="input-group">
        <text class="label">用户名:</text>
        <input 
          v-model="username" 
          class="input" 
          placeholder="请输入用户名"
          @keyup.enter="handleSubmit"
        />
      </view>

      <view class="input-group">
        <text class="label">密码:</text>
        <input 
          v-model="password" 
          class="input" 
          placeholder="请输入密码"
          type="password"
          @keyup.enter="handleSubmit"
        />
      </view>

      <!-- 按钮 -->
      <button class="btn" @click="handleSubmit">提交</button>

      <!-- 显示数据 -->
      <view class="data-display" v-if="showData">
        <text>输入的用户名: {{ username }}</text>
        <text>输入的密码: {{ password }}</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="footer">
      <text @click="goToHome">首页</text>
      <text @click="goToAbout">关于</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'

// 页面数据
const pageTitle = ref('Vue3 页面模板')
const username = ref('')
const password = ref('')
const showData = ref(false)

// onLoad → onShow → onMounted 

// 生命周期钩子
// 可以获取页面路由参数 (options)
// 此时页面 DOM 尚未渲染完成
onLoad((options) => {
	// 获取参数
	// 发起网络请求
  console.log(options, '页面加载')
})

// 页面初次显示
// 从其他页面返回时 只有这个 其他不会渲染
// 应用从后台切换到前台时
onShow(() => {
  console.log('页面显示')
})

// 只执行一次
// 可以安全地操作 DOM 元素
// 在 Uniapp 中可能比 onLoad 稍晚触发
onMounted(() =>{
	// 基于已渲染的DOM初始化图表
	// 操作 DOM 元素
	// 初始化第三方库（需要 DOM 的）
	// 绑定原生事件监听器
	console.log('onMounted加载')
})
onHide(() => {
	console.log('onHide 隐藏触发')
})
// 跨平台一致性：在所有平台（小程序/H5/App）都会触发
// 可靠性：确保页面卸载时一定会执行清理
// 安全性：防止切换页面时内存泄漏

// 使用了错误的页面跳转方式：
// uni.navigateTo：保留当前页面，不会触发 onUnload
// uni.redirectTo：关闭当前页面，会触发 onUnload
// 页面栈未达到限制：小程序默认页面栈最多10层，超过后底层页面会自动卸载
// H5平台特殊行为：某些路由切换方式可能不会触发卸载
onUnload(() => {
	console.log('onUnload加载11111')
})
// 方法
const handleSubmit = () => {
  if (!username.value || !password.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  showData.value = true
  console.log('提交数据:', {
    username: username.value,
    password: password.value
  })
}


const goToHome = () => {
  uni.redirectTo({
    url: '/pages/index/index'
  })
}

const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/about'
  })
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 750rpx;
  height: 100%;
  padding: 20rpx;
}

.header {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
}

.content {
  flex: 1;
  padding: 40rpx 20rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.btn {
  margin-top: 40rpx;
  background-color: #007AFF;
  color: white;
  border-radius: 8rpx;
}

.data-display {
  margin-top: 40rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.data-display text {
  display: block;
  margin-bottom: 10rpx;
}

.footer {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  border-top: 1rpx solid #eee;
}

.footer text {
  color: #007AFF;
}
</style>
```

