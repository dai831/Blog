<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { categoryLabel, listArticles } from '../services/blog'

const route = useRoute()
const mobileOpen = ref(false)
const searchOpen = ref(false)
const query = ref('')
const articles = ref([])
const loading = ref(false)
const error = ref('')
const input = ref(null)
let previousFocus
let previousOverflow = ''
const links = [
  ['/', '首页'], ['/story', '我们的故事'], ['/journal', '技术手记'],
  ['/gallery', '图片欣赏'], ['/playground', '趣味实验室'], ['/about', '关于我']
]
const results = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return articles.value.filter(item => !keyword || `${item.title} ${item.sourceName || ''} ${item.subtext}`.toLowerCase().includes(keyword))
})
function titleFor(item) {
  return (/^\s*(?:\d+[.、]|\*\*)/.test(item.title) && item.sourceName ? item.sourceName : item.title).replace(/[`*]/g, '')
}
function isActive(path) { return route.path === path || (path === '/journal' && route.path.startsWith('/article/')) }
async function openSearch() {
  if (searchOpen.value) return
  mobileOpen.value = false
  previousFocus = document.activeElement
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  searchOpen.value = true
  await nextTick()
  input.value?.focus()
  if (articles.value.length) return
  loading.value = true
  error.value = ''
  try { articles.value = await listArticles() }
  catch { error.value = '文章暂时无法读取，请稍后重试。' }
  finally { loading.value = false }
}
function closeSearch() {
  searchOpen.value = false
  document.body.style.overflow = previousOverflow
  previousFocus?.focus()
}
function onKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch() }
  if (event.key === 'Escape') { if (searchOpen.value) closeSearch(); mobileOpen.value = false }
  if (event.key === 'Tab' && searchOpen.value) {
    const controls = [...document.querySelectorAll('.tb-search-dialog input, .tb-search-dialog button, .tb-search-dialog a')]
    if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus() }
    else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus() }
  }
}
window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (searchOpen.value) document.body.style.overflow = previousOverflow
})
defineExpose({ openSearch })
</script>

<template>
  <header class="tb-header"><div class="tb-container tb-header-inner">
    <RouterLink class="tb-brand" to="/" aria-label="回到首页"><span class="tb-brand-flower">✳</span><span>DAIXIAOMING<span class="tb-brand-sub"> / 生活与代码</span></span></RouterLink>
    <nav class="tb-nav" :class="{ 'is-open': mobileOpen }" aria-label="主导航">
      <RouterLink v-for="[path, label] in links" :key="path" :to="path" :class="{ 'is-active': isActive(path), 'tb-nav-play': path === '/playground' }" :aria-current="isActive(path) ? 'page' : undefined" @click="mobileOpen = false">{{ label }}<span v-if="path === '/playground'" class="tb-nav-play-dot"></span></RouterLink>
    </nav>
    <div class="tb-header-actions"><button class="tb-search-trigger" aria-label="搜索文章" @click="openSearch"><span>⌕</span><span>搜索</span><kbd>⌘ K</kbd></button><button class="tb-mobile-menu" :aria-expanded="mobileOpen" aria-label="切换导航菜单" @click="mobileOpen = !mobileOpen">{{ mobileOpen ? '✕' : '☰' }}</button></div>
  </div></header>
  <Teleport to="body"><Transition name="tb-modal"><div v-if="searchOpen" class="tb-modal-overlay tech-blog-modal" @click.self="closeSearch"><div class="tb-search-dialog" role="dialog" aria-modal="true" aria-label="搜索文章"><div class="tb-search-bar"><span>⌕</span><input ref="input" v-model="query" placeholder="搜索文章、技术关键词…" aria-label="输入搜索关键词"><button aria-label="关闭搜索" @click="closeSearch">✕</button></div><div class="tb-search-results"><p v-if="loading">正在查找文章…</p><p v-else-if="error">{{ error }}</p><template v-else><small>找到 {{ results.length }} 篇文章</small><RouterLink v-for="item in results.slice(0, 10)" :key="item.id" :to="`/article/${encodeURIComponent(item.id)}`" @click="closeSearch"><span>{{ categoryLabel(item.type) }}</span><strong>{{ titleFor(item) }}</strong><b>↗</b></RouterLink><p v-if="!results.length">没有找到匹配内容，换个词试试。</p></template></div><div class="tb-search-hint">按 ESC 关闭 · Ctrl / ⌘ + K 快速打开</div></div></div></Transition></Teleport>
</template>
