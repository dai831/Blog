<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import heroImage from '../assets/bg.jpg'
import { categories, categoryLabel, listArticles } from '../services/blog'
import { loadWallpapers } from '../services/wallpaper'

const router = useRouter()
const articles = ref([])
const wallpapers = ref([])
const loading = ref(true)
const error = ref('')
const category = ref('全部')
const query = ref('')
const searchOpen = ref(false)
const mobileOpen = ref(false)
const visibleCount = ref(9)
const progress = ref(0)
const searchInput = ref(null)
let observer

const topics = [
  { name: '前端', en: 'FRONTEND', glyph: '</>', description: '交互、样式与浏览器里的细节。', tone: 'cyan' },
  { name: 'Vue', en: 'FRAMEWORK', glyph: 'V', description: '从组件设计到真实项目实践。', tone: 'violet' },
  { name: '工程化', en: 'ENGINEERING', glyph: '⌘', description: '构建、部署与开发效率。', tone: 'orange' },
  { name: '工具', en: 'TOOLBOX', glyph: '✳', description: '把踩过的坑整理成可复用的方法。', tone: 'green' }
]

function tagsFor(item) {
  const text = `${item.title} ${item.subtext}`.toLowerCase()
  const rules = [['Vue', /vue/], ['CSS', /css|样式|圆角|边框/], ['JavaScript', /javascript|\bjs\b/], ['Node.js', /node|npm/], ['Electron', /electron/], ['Nginx', /nginx/], ['Git', /git/], ['Vite', /vite/], ['UniApp', /uniapp/], ['地图', /地图|qgis/]]
  return rules.filter(([, pattern]) => pattern.test(text)).map(([name]) => name).slice(0, 2)
}
function dateFor(item) {
  const value = item.publishedAt || item.updatedAt || item.createdAt
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date) : '技术笔记'
}
const displayArticles = computed(() => articles.value.map((item, index) => ({
  ...item,
  category: categoryLabel(item.type),
  excerpt: item.subtext || '一篇关于开发实践的技术记录，打开阅读全文。',
  tags: tagsFor(item),
  read: `${Math.max(1, Math.ceil(String(item.richtext || '').length / 450))} 分钟阅读`,
  date: dateFor(item),
  image: wallpapers.value[index % wallpapers.value.length]?.url || ''
})))
const featured = computed(() => {
  const picked = displayArticles.value.filter(item => /vue|electron|前端开发规范|css/i.test(item.title))
  return [...picked, ...displayArticles.value.filter(item => !picked.includes(item))].slice(0, 3)
})
const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return displayArticles.value.filter(item => (category.value === '全部' || item.category === category.value) && (!keyword || `${item.title} ${item.excerpt} ${item.tags.join(' ')} ${item.category}`.toLowerCase().includes(keyword)))
})
const visibleArticles = computed(() => filtered.value.slice(0, visibleCount.value))
const totalWords = computed(() => Math.round(articles.value.reduce((sum, item) => sum + String(item.richtext || '').length, 0) / 1000))

function scrollTo(id) {
  mobileOpen.value = false
  if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' })
  else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
function selectCategory(name) {
  category.value = name
  visibleCount.value = 9
  scrollTo('articles')
}
function openArticle(item) { router.push(`/article/${encodeURIComponent(item.id)}`) }
function openSearch() { searchOpen.value = true; mobileOpen.value = false; nextTick(() => searchInput.value?.focus()) }
function onKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch() }
  if (event.key === 'Escape') searchOpen.value = false
}
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(100, window.scrollY / max * 100) : 0
}
async function load() {
  try { articles.value = await listArticles() }
  catch (cause) { error.value = cause?.message || '文章读取失败' }
  finally { loading.value = false }
  await nextTick()
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.06 })
  document.querySelectorAll('.tb-reveal').forEach(item => observer.observe(item))
}
watch(visibleArticles, async () => {
  await nextTick()
  document.querySelectorAll('.tb-reveal:not(.is-visible)').forEach(item => observer?.observe(item))
})
onMounted(() => {
  load()
  loadWallpapers().then(items => { wallpapers.value = items })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  onScroll()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="tech-blog">
    <div class="tb-progress" :style="{ width: `${progress}%` }"></div>
    <header class="tb-header">
      <div class="tb-container tb-header-inner">
        <button class="tb-brand" @click="scrollTo('top')" aria-label="回到首页"><span class="tb-brand-symbol">D<span>.</span></span><span class="tb-brand-name">DAIXIAOMING<span> / DEV JOURNAL</span></span></button>
        <nav :class="['tb-nav', { 'is-open': mobileOpen }]" aria-label="主导航">
          <button @click="scrollTo('top')">首页</button><button @click="scrollTo('featured')">精选</button><button @click="scrollTo('topics')">探索领域</button><button @click="scrollTo('articles')">全部文章</button><button @click="scrollTo('about')">关于</button>
        </nav>
        <div class="tb-header-actions"><button class="tb-search-trigger" @click="openSearch" aria-label="搜索文章"><span>⌕</span><span>搜索</span><kbd>⌘ K</kbd></button><button class="tb-mobile-menu" @click="mobileOpen = !mobileOpen" :aria-expanded="mobileOpen" aria-label="切换菜单">{{ mobileOpen ? '✕' : '☰' }}</button></div>
      </div>
    </header>

    <main>
      <section id="top" class="tb-hero">
        <img class="tb-hero-image" :src="heroImage" alt="未来城市与星空" fetchpriority="high">
        <div class="tb-hero-overlay"></div><div class="tb-hero-grid"></div>
        <div class="tb-container tb-hero-content">
          <div class="tb-hero-eyebrow"><span class="tb-live-dot"></span> EXPLORING THE DIGITAL FRONTIER <span>/ 001 — 026</span></div>
          <h1>把热爱写进代码<span class="tb-title-dot">.</span><br><em>把思考留给未来</em><span class="tb-title-dot">.</span></h1>
          <p>一个关于前端开发、工程实践与持续探索的个人空间。<br>在这里，记录每一次实验，也认真回答每一个真实问题。</p>
          <div class="tb-hero-actions"><button class="tb-primary-action" @click="scrollTo('featured')">开始探索 <span>↗</span></button><button class="tb-text-action" @click="scrollTo('about')">了解我 <span>↓</span></button></div>
        </div>
        <div class="tb-container tb-hero-bottom"><span>SCROLL TO EXPLORE <i>↓</i></span><span>DAIXIAOMING.DEV / EST. 2024</span><span>31° N &nbsp; 121° E</span></div>
      </section>

      <div class="tb-ticker" aria-label="博客主题"><div>BUILD SOMETHING MEANINGFUL <span>✳</span> THINK DEEPER <span>✳</span> KEEP CREATING <span>✳</span> BUILD SOMETHING MEANINGFUL <span>✳</span> THINK DEEPER <span>✳</span> KEEP CREATING <span>✳</span></div></div>

      <section id="featured" class="tb-section tb-featured tb-container">
        <div class="tb-section-heading tb-reveal"><div><span class="tb-kicker"><i></i> 01 / EDITOR'S PICK</span><h2>值得停下来，<br><em>认真读一读。</em></h2></div><p>从真实项目里提炼思路，让每篇记录都有下一次可以复用的价值。</p></div>
        <div v-if="loading" class="tb-state">正在整理精选文章…</div><div v-else-if="error" class="tb-state">{{ error }}</div>
        <div v-else class="tb-feature-grid"><button v-for="(item, index) in featured" :key="item.id" :class="['tb-feature-card', `tb-feature-${index}`, 'tb-reveal']" @click="openArticle(item)"><div class="tb-feature-visual" :style="item.image ? { backgroundImage: `linear-gradient(180deg,rgba(4,9,19,.05),rgba(4,9,19,.55)),url('${item.image}')` } : {}"><span>✳</span><b>0{{ index + 1 }}</b></div><div class="tb-feature-content"><div class="tb-feature-top"><span>{{ item.category }} / {{ item.tags.join(' · ') }}</span><span>↗</span></div><h3>{{ item.title }}</h3><p>{{ item.excerpt }}</p><div class="tb-feature-meta"><span>{{ item.date }}</span><span>{{ item.read }}</span></div></div></button></div>
      </section>

      <section id="topics" class="tb-section tb-topics"><div class="tb-container"><div class="tb-section-heading tb-reveal"><div><span class="tb-kicker"><i></i> 02 / EXPLORE TOPICS</span><h2>沿着好奇心，<br><em>继续深入。</em></h2></div><p>选一个方向，从熟悉的问题开始，慢慢走向更广阔的技术世界。</p></div><div class="tb-topic-grid"><button v-for="(topic, index) in topics" :key="topic.name" :class="['tb-topic-card', `tone-${topic.tone}`, 'tb-reveal']" @click="selectCategory(topic.name)"><div class="tb-topic-top"><span>0{{ index + 1 }} / {{ topic.en }}</span><span>↗</span></div><div class="tb-topic-glyph">{{ topic.glyph }}</div><div><h3>{{ topic.name }}</h3><p>{{ topic.description }}</p></div></button></div></div></section>

      <section id="articles" class="tb-section tb-articles tb-container"><div class="tb-section-heading tb-reveal"><div><span class="tb-kicker"><i></i> 03 / THE ARCHIVE</span><h2>所有文章<span class="tb-article-count">{{ String(filtered.length).padStart(2, '0') }}</span></h2></div><p>持续写，持续修正。每一篇都来自真实的尝试和思考。</p></div>
        <div class="tb-article-controls"><div class="tb-category-list" aria-label="文章分类"><button v-for="name in ['全部', ...categories.map(item => item.label)]" :key="name" :class="{ active: category === name }" @click="selectCategory(name)">{{ name }}</button></div><button class="tb-filter-search" @click="openSearch">⌕ <span>搜索文章</span></button></div>
        <div v-if="loading" class="tb-state">正在读取文章…</div><div v-else-if="error" class="tb-state">{{ error }}</div><div v-else-if="!filtered.length" class="tb-state">暂时没有找到相关文章，试试其他分类或关键词。</div>
        <div v-else class="tb-article-list"><button v-for="(item, index) in visibleArticles" :key="item.id" class="tb-article-row tb-reveal" @click="openArticle(item)"><span class="tb-row-number">{{ String(index + 1).padStart(2, '0') }}</span><div class="tb-row-main"><div class="tb-row-tags"><span>{{ item.category }}</span><span v-for="tag in item.tags" :key="tag">{{ tag }}</span></div><h3>{{ item.title }}</h3><p>{{ item.excerpt }}</p></div><span class="tb-row-date">{{ item.date }}<small>{{ item.read }}</small></span><span class="tb-row-arrow">↗</span></button></div>
        <button v-if="visibleCount < filtered.length" class="tb-more" @click="visibleCount += 9">加载更多文章 <span>↓</span></button>
      </section>

      <section id="about" class="tb-about"><div class="tb-container tb-about-inner"><div class="tb-about-art tb-reveal"><span class="tb-about-orbit orbit-one"></span><span class="tb-about-orbit orbit-two"></span><span class="tb-about-center">D<span>.</span></span><small>ALWAYS IN BETA</small></div><div class="tb-about-copy tb-reveal"><span class="tb-kicker"><i></i> 04 / ABOUT THE AUTHOR</span><h2>你好，<br>我是 <em>Daixiaoming.</em></h2><p>一名前端开发者。喜欢把复杂问题拆开，也喜欢把解决过程写下来。这里收集了我的技术笔记、实践经验和一些仍在进行中的探索。</p><div class="tb-about-stats"><div><strong>{{ articles.length }}</strong><span>篇技术记录</span></div><div><strong>{{ totalWords }}k</strong><span>字的思考</span></div><div><strong>∞</strong><span>保持好奇</span></div></div><button class="tb-outline-action" @click="router.push('/admin/articles')">进入内容管理 <span>↗</span></button></div></div></section>
    </main>

    <footer class="tb-footer"><div class="tb-container"><div class="tb-footer-top"><div><span class="tb-footer-logo">D<span>.</span></span><h2>保持热爱，<br><em>继续创造。</em></h2></div><button @click="scrollTo('top')">回到顶部 ↑</button></div><div class="tb-footer-bottom"><span>© {{ new Date().getFullYear() }} DAIXIAOMING. BUILT WITH CURIOSITY.</span><span>VUE 3 / VITE / MARKDOWN</span><span>DESIGNED FOR THE FUTURE.</span></div></div></footer>

    <Transition name="tb-modal"><div v-if="searchOpen" class="tb-search-overlay" @click.self="searchOpen = false"><div class="tb-search-dialog" role="dialog" aria-modal="true" aria-label="搜索文章"><div class="tb-search-bar"><span>⌕</span><input ref="searchInput" v-model="query" placeholder="搜索文章、标签或技术关键词…"><button @click="searchOpen = false" aria-label="关闭搜索">ESC</button></div><div class="tb-search-list"><div class="tb-search-hint">{{ filtered.length }} 个搜索结果</div><button v-for="item in filtered.slice(0, 8)" :key="item.id" @click="searchOpen = false; openArticle(item)"><span>{{ item.category }}</span><strong>{{ item.title }}</strong><span>↗</span></button><p v-if="!filtered.length">没有找到匹配的文章。</p></div><div class="tb-search-foot">按 ESC 关闭 · 文章保存在当前项目与浏览器中</div></div></div></Transition>
  </div>
</template>
