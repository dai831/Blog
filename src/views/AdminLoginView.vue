<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { enterLocalMode, getApiBase, login, setApiBase, testApi } from '../services/blog'

const router = useRouter()
const route = useRoute()
const apiBase = ref(getApiBase())
const identifier = ref('')
const password = ref('')
const loading = ref(false)
const testing = ref(false)

async function handleLogin() {
  if (!identifier.value || !password.value) return ElMessage.warning('请输入账号和密码')
  loading.value = true
  try {
    setApiBase(apiBase.value)
    await login(identifier.value, password.value)
    ElMessage.success('登录成功')
    router.replace(route.query.redirect || '/admin/articles')
  } catch (e) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

async function handleTest() {
  testing.value = true
  try {
    setApiBase(apiBase.value)
    await testApi()
    ElMessage.success('API 连接正常')
  } catch (e) { ElMessage.error(e.message) }
  finally { testing.value = false }
}

function localDemo() {
  enterLocalMode()
  ElMessage.info('已进入本地演示模式：数据仅保存在当前浏览器')
  router.replace('/admin/articles')
}
</script>

<template>
  <div class="login-page">
    <div class="login-side">
      <span class="eyebrow">MARKDOWN BLOG ADMIN</span>
      <h1>上传 Markdown，<br>直接发布成文档。</h1>
      <p>后台只保留文章管理与编辑功能，不再混入旧版分类、美图、个人中心等重复页面。</p>
    </div>
    <div class="login-card">
      <button class="back-link" @click="router.push('/')">← 返回博客</button>
      <h2>管理后台</h2>
      <p class="muted">连接你现有的 `/apk` 后端后，发布的文章即可被其他访问者看到。</p>
      <label>API 地址</label>
      <div class="api-row">
        <input v-model="apiBase" placeholder="/apk 或 https://api.example.com/apk" />
        <button class="secondary-btn" :disabled="testing" @click="handleTest">测试</button>
      </div>
      <label>账号</label>
      <input v-model="identifier" autocomplete="username" placeholder="用户名或邮箱" @keyup.enter="handleLogin" />
      <label>密码</label>
      <input v-model="password" type="password" autocomplete="current-password" placeholder="密码" @keyup.enter="handleLogin" />
      <button class="primary-wide" :disabled="loading" @click="handleLogin">{{ loading ? '正在登录...' : '登录管理后台' }}</button>
      <div class="divider"><span>没有启动后端时</span></div>
      <button class="demo-btn" @click="localDemo">进入本地演示模式</button>
      <p class="login-tip">本地演示模式不会把文章同步给其他设备，仅用于先看页面和编辑效果。</p>
    </div>
  </div>
</template>
