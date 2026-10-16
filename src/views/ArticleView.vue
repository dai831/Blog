<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlogHeader from '../components/BlogHeader.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import { categoryLabel, getArticle, listArticles } from '../services/blog'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const allArticles = ref([])
const loading = ref(true)
const error = ref('')
const headings = ref([])
const activeHeading = ref(0)
const progress = ref(0)
const copied = ref(false)
let copyTimer

const related = computed(() => allArticles.value.filter(item => item.id !== article.value?.id && item.type === article.value?.type).slice(0, 3))
const readMinutes = computed(() => Math.max(1, Math.ceil(String(article.value?.richtext || '').length / 450)))
const date = computed(() => {
  const value = article.value?.publishedAt || article.value?.updatedAt || article.value?.createdAt
  const parsed = value ? new Date(value) : null
  return parsed && !Number.isNaN(parsed.getTime()) ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(parsed) : '随代码发布'
})

function updateScroll() {
  const total = document.documentElement.scrollHeight - innerHeight
  progress.value = total > 0 ? Math.min(100, scrollY / total * 100) : 0
  const nodes = [...document.querySelectorAll('.reading-paper .markdown-body h2, .reading-paper .markdown-body h3')]
  const index = nodes.reduce((result, node, i) => node.getBoundingClientRect().top < 160 ? i : result, 0)
  activeHeading.value = index
}
function jumpTo(index) {
  document.querySelectorAll('.reading-paper .markdown-body h2, .reading-paper .markdown-body h3')[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
async function copyLink() {
  try {
    await navigator.clipboard.writeText(location.href)
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = false }, 2000)
  } catch { copied.value = false }
}
async function load(id) {
  loading.value = true
  error.value = ''
  article.value = null
  try {
    const [current, list] = await Promise.all([getArticle(id), listArticles()])
    article.value = current
    allArticles.value = list
    document.title = `${current.title} | Daixiaoming · 生活与代码`
    loading.value = false
    await nextTick()
    headings.value = [...document.querySelectorAll('.reading-paper .markdown-body h2, .reading-paper .markdown-body h3')].map(node => ({
      text: node.textContent?.trim() || '',
      level: node.tagName.toLowerCase()
    }))
    updateScroll()
  } catch (cause) {
    error.value = cause?.message || '文章读取失败'
  } finally { loading.value = false }
}
watch(() => route.params.id, id => { if (id) load(id) }, { immediate: true })
window.addEventListener('scroll', updateScroll, { passive: true })
onBeforeUnmount(() => { window.removeEventListener('scroll', updateScroll); clearTimeout(copyTimer) })
</script>

<template>
  <div class="reading-page">
    <div class="tb-progress" :style="{ width: `${progress}%` }"></div>
    <BlogHeader />
    <main class="reading-main tb-container">
      <button class="reading-back" @click="router.push('/')">← 返回全部文章</button>
      <div v-if="loading" class="reading-state">正在读取文章…</div>
      <div v-else-if="error" class="reading-state">{{ error }} <button @click="router.push('/')">返回首页 ↗</button></div>
      <template v-else-if="article">
        <header class="reading-hero">
          <div class="reading-eyebrow"><span>FIELD NOTE / {{ categoryLabel(article.type).toUpperCase() }}</span><span>NO. {{ String(allArticles.findIndex(item => item.id === article.id) + 1).padStart(3, '0') }}</span></div>
          <div class="reading-hero-body"><div><div class="reading-label"><i></i>{{ categoryLabel(article.type) }} · TECH ARTICLE</div><h1>{{ article.title }}</h1><p>{{ article.subtext || '来自真实项目和技术探索的一篇记录。' }}</p><div class="reading-meta"><span>{{ date }}</span><span>{{ readMinutes }} 分钟阅读</span><span>{{ article.source === 'builtin' ? '技术笔记' : '最新发布' }}</span></div></div><div class="reading-hero-art"><span>✳</span><small>THINK / BUILD / REPEAT</small></div></div>
        </header>
        <div class="reading-layout">
          <div class="reading-content">
            <div class="reading-toolbar"><span>ARTICLE CONTENT</span><button @click="copyLink">{{ copied ? '✓ 已复制' : '↗ 分享文章' }}</button></div>
            <div class="reading-paper"><MarkdownRenderer :content="article.richtext" /></div>
            <div class="reading-end"><span>✳</span><h2>感谢读到这里。</h2><p>如果这篇文章解决了你的问题，那这次记录就有了意义。</p><button @click="router.push('/')">继续探索其他文章 ↗</button></div>
          </div>
          <aside class="reading-aside"><div class="reading-toc"><span>ON THIS PAGE</span><div v-if="headings.length" class="reading-toc-list"><button v-for="(heading, index) in headings" :key="index" :class="{ active: activeHeading === index, sub: heading.level === 'h3' }" @click="jumpTo(index)">{{ heading.text }}</button></div><p v-else>这篇文章没有章节目录。</p><div class="reading-aside-line"></div><button class="reading-top" @click="scrollTop">↑ 回到顶部</button></div></aside>
        </div>
        <section v-if="related.length" class="reading-related"><div class="reading-related-head"><span>KEEP EXPLORING</span><h2>继续阅读<span>↗</span></h2></div><div class="reading-related-grid"><button v-for="item in related" :key="item.id" @click="router.push(`/article/${item.id}`)"><small>{{ categoryLabel(item.type) }}</small><strong>{{ item.title }}</strong><span>阅读文章 ↗</span></button></div></section>
      </template>
    </main>
    <footer class="reading-footer"><div class="tb-container"><button @click="router.push('/')">D<span>.</span> DAIXIAOMING</button><span>© {{ new Date().getFullYear() }} · KEEP CREATING</span></div></footer>
  </div>
</template>
