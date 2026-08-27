<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminNav from '../components/AdminNav.vue'
import { categoryLabel, deleteArticle, isBuiltinArticle, listArticles, publishArticle, unpublishArticle } from '../services/blog'

const router = useRouter()
const articles = ref([])
const loading = ref(true)

function formatDate(value) {
  if (!value) return '随代码发布'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value))
}

async function load() {
  loading.value = true
  try { articles.value = await listArticles({ admin: true }) }
  catch (e) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

async function remove(item) {
  if (isBuiltinArticle(item)) return ElMessage.info('这是代码内置 Markdown，请从 src/content 目录删除源文件')
  try {
    await ElMessageBox.confirm(`确认删除“${item.title}”吗？`, '删除本地文档', { type: 'warning' })
    await deleteArticle(item.id)
    ElMessage.success('已删除')
    await load()
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error(e.message || '删除失败')
  }
}

async function togglePublish(item) {
  if (isBuiltinArticle(item)) return ElMessage.info('代码内置文档默认公开展示，无需发布')
  try {
    if (item.status === 'published') {
      await unpublishArticle(item)
      ElMessage.success('已转为草稿')
    } else {
      await publishArticle(item)
      ElMessage.success('已发布到当前浏览器')
    }
    await load()
  } catch (e) { ElMessage.error(e.message) }
}

function edit(item) {
  router.push(`/admin/editor/${item.id}`)
}

onMounted(load)
</script>

<template>
  <div class="admin-page">
    <AdminNav />
    <main class="admin-main">
      <header class="admin-top">
        <div>
          <h1>文档管理</h1>
          <p>优先读取 <code>src/content</code> 内置 Markdown；后来上传的文件只保存在当前浏览器。</p>
        </div>
        <button class="primary-btn big-action" @click="router.push('/admin/editor')">＋ 上传 / 新建</button>
      </header>

      <div class="local-alert">
        <strong>本地优先：</strong>代码内置文档所有访问者都能看到；浏览器上传文档不会上传服务器，只在当前浏览器保存。代码内置文档在浏览器里编辑时，会另存为本地副本，不修改源码文件。
      </div>

      <div class="table-card desktop-table-card">
        <div v-if="loading" class="state-card">正在加载...</div>
        <div v-else-if="!articles.length" class="empty-admin"><h3>还没有文档</h3><p>把 Markdown 放进 src/content，或者上传一份本地文件。</p></div>
        <div v-else class="article-table-wrap">
          <table class="article-table">
            <thead><tr><th>标题</th><th>来源</th><th>分类</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="item in articles" :key="item.id">
                <td><strong>{{ item.title }}</strong><small>{{ item.subtext || '暂无摘要' }}</small></td>
                <td><span :class="['source-badge', item.source]">{{ item.source === 'builtin' ? '代码内置' : '浏览器本地' }}</span></td>
                <td>{{ categoryLabel(item.type) }}</td>
                <td><span :class="['status-badge', item.status]">{{ item.source === 'builtin' ? '随代码公开' : (item.status === 'published' ? '已发布' : '草稿') }}</span></td>
                <td>{{ formatDate(item.updatedAt) }}</td>
                <td class="actions">
                  <button @click="router.push(`/article/${item.id}`)">查看</button>
                  <button @click="edit(item)">{{ item.source === 'builtin' ? '复制编辑' : '编辑' }}</button>
                  <button v-if="item.source !== 'builtin'" @click="togglePublish(item)">{{ item.status === 'published' ? '转草稿' : '发布' }}</button>
                  <button v-if="item.source !== 'builtin'" class="danger" @click="remove(item)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <section v-if="!loading" class="mobile-doc-list">
        <article v-for="item in articles" :key="item.id" class="mobile-doc-card">
          <div class="mobile-doc-head">
            <span :class="['source-badge', item.source]">{{ item.source === 'builtin' ? '代码内置' : '浏览器本地' }}</span>
            <span class="status-badge" :class="item.status">{{ item.source === 'builtin' ? '公开' : (item.status === 'published' ? '已发布' : '草稿') }}</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.subtext || '暂无摘要' }}</p>
          <small>{{ categoryLabel(item.type) }} · {{ formatDate(item.updatedAt) }}</small>
          <div class="mobile-card-actions">
            <button class="secondary-btn" @click="router.push(`/article/${item.id}`)">查看</button>
            <button class="secondary-btn" @click="edit(item)">{{ item.source === 'builtin' ? '复制编辑' : '编辑' }}</button>
            <button v-if="item.source !== 'builtin'" class="primary-btn" @click="togglePublish(item)">{{ item.status === 'published' ? '转草稿' : '发布' }}</button>
            <button v-if="item.source !== 'builtin'" class="danger-btn" @click="remove(item)">删除</button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>
