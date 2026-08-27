<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SiteHeader from '../components/SiteHeader.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import { categoryLabel, getArticle } from '../services/blog'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const article = ref(null)

function formatDate(value) {
  if (!value) return '随代码发布'
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long' }).format(new Date(value))
}

onMounted(async () => {
  try { article.value = await getArticle(route.params.id) }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div class="page-bg">
    <SiteHeader />
    <main class="doc-shell">
      <button class="back-link touch-btn" @click="router.push('/')">← 返回文档列表</button>
      <div v-if="loading" class="state-card">正在读取文档...</div>
      <div v-else-if="error" class="state-card error">{{ error }}</div>
      <template v-else-if="article">
        <header class="article-hero">
          <div class="article-labels">
            <span class="category-chip">{{ categoryLabel(article.type) }}</span>
            <span :class="['source-badge', article.source]">{{ article.source === 'builtin' ? '代码内置' : '浏览器本地' }}</span>
          </div>
          <h1>{{ article.title }}</h1>
          <p v-if="article.subtext">{{ article.subtext }}</p>
          <div class="article-meta">{{ formatDate(article.publishedAt || article.updatedAt) }}</div>
        </header>
        <div class="document-paper"><MarkdownRenderer :content="article.richtext" /></div>
      </template>
    </main>
  </div>
</template>
