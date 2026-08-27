<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import heroImage from '../assets/bg.jpg'
import catImage from '../assets/login.jpg'
import avatar from '../assets/user.png'
import { categoryLabel, listArticles } from '../services/blog'

const router = useRouter()
const isDark = ref(false)
const mobileOpen = ref(false)
const searchOpen = ref(false)
const searchText = ref('')
const activeCategory = ref('全部')
const musicPlaying = ref(false)
const typed = ref('')
const articles = ref([])
const loading = ref(true)
const error = ref('')
const typePhrases = ['Vue 3 / Vite / 前端工程化', 'Markdown / 技术文档 / 开发记录', '把踩过的坑，写成能复用的经验']
let typeTimer = null
let observer = null

const categories = ['全部', '前端', 'Vue', 'Node', '工程化', '工具', '其他']
const interestTags = ['Vue', 'Vite', 'CSS', 'JavaScript', 'Node.js', 'Electron', 'Nginx', 'Git']
const coverStyles = ['cyber', 'violet', 'blue', 'mint', 'orange', 'pink']

function tagsFor(article) {
  const text = `${article.title || ''} ${article.subtext || ''}`.toLowerCase()
  const hits = []
  const rules = [
    ['Vue', ['vue']], ['Vite', ['vite']], ['CSS', ['css']], ['JavaScript', ['javascript', 'js']],
    ['Node.js', ['node', 'npm']], ['Electron', ['electron']], ['Nginx', ['nginx']], ['Git', ['git']],
    ['QGIS', ['qgis']], ['UniApp', ['uniapp']], ['地图', ['地图', '瓦片']], ['工具', ['快捷键', '工具']]
  ]
  for (const [label, words] of rules) {
    if (words.some(word => text.includes(word.toLowerCase()))) hits.push(label)
  }
  if (!hits.length) hits.push(categoryLabel(article.type))
  return hits.slice(0, 3)
}

function formatDate(article) {
  const value = article.publishedAt || article.updatedAt || article.createdAt
  if (!value) return article.source === 'builtin' ? '代码内置' : '浏览器本地'
  try {
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
  } catch {
    return '最近更新'
  }
}

function readMinutes(content) {
  return Math.max(1, Math.ceil(String(content || '').replace(/[#>*`\[\]()_\-|]/g, '').length / 450))
}

const displayArticles = computed(() => articles.value.map((item, index) => ({
  ...item,
  category: categoryLabel(item.type),
  excerpt: item.subtext || '点击查看完整 Markdown 文档。',
  date: formatDate(item),
  read: `${readMinutes(item.richtext)} 分钟`,
  tags: tagsFor(item),
  cover: coverStyles[index % coverStyles.length],
  recommended: index < 3
})))

const filteredArticles = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return displayArticles.value.filter(item => {
    const categoryOk = activeCategory.value === '全部' || item.category === activeCategory.value
    const searchOk = !keyword || [item.title, item.excerpt, item.category, ...item.tags].join(' ').toLowerCase().includes(keyword)
    return categoryOk && searchOk
  })
})

const featured = computed(() => displayArticles.value.slice(0, 3))
const stats = computed(() => ({
  articles: displayArticles.value.length,
  tags: new Set(displayArticles.value.flatMap(item => item.tags)).size,
  categories: new Set(displayArticles.value.map(item => item.category)).size,
  words: Math.round(displayArticles.value.reduce((sum, item) => sum + String(item.richtext || '').length, 0) / 1000)
}))

function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  mobileOpen.value = false
}

function scrollToAbout() {
  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  mobileOpen.value = false
}

function scrollToArticles() {
  document.querySelector('#articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  mobileOpen.value = false
}

function selectCategory(name) {
  activeCategory.value = name
  nextTick(scrollToArticles)
}

function toggleTheme() {
  isDark.value = !isDark.value
}

function openArticle(article) {
  if (!article?.id) return
  router.push(`/article/${encodeURIComponent(article.id)}`)
}

function randomArticle() {
  if (!displayArticles.value.length) return
  openArticle(displayArticles.value[Math.floor(Math.random() * displayArticles.value.length)])
}

function openSearch() {
  searchOpen.value = true
  nextTick(() => document.querySelector('.search-input')?.focus())
}

function closeSearch() {
  searchOpen.value = false
}

function runTypewriter() {
  let phraseIndex = 0
  let charIndex = 0
  let deleting = false
  const tick = () => {
    const phrase = typePhrases[phraseIndex]
    if (!deleting) {
      typed.value = phrase.slice(0, charIndex + 1)
      charIndex += 1
      if (charIndex === phrase.length) {
        deleting = true
        typeTimer = window.setTimeout(tick, 1700)
        return
      }
    } else {
      typed.value = phrase.slice(0, Math.max(0, charIndex - 1))
      charIndex -= 1
      if (charIndex === 0) {
        deleting = false
        phraseIndex = (phraseIndex + 1) % typePhrases.length
      }
    }
    typeTimer = window.setTimeout(tick, deleting ? 45 : 90)
  }
  tick()
}

function handleMouseMove(event) {
  const shell = document.querySelector('.blog-shell')
  shell?.style.setProperty('--mouse-x', `${event.clientX}px`)
  shell?.style.setProperty('--mouse-y', `${event.clientY}px`)
}

async function loadArticles() {
  loading.value = true
  error.value = ''
  try {
    articles.value = await listArticles()
  } catch (e) {
    error.value = e?.message || '读取 Markdown 文档失败'
  } finally {
    loading.value = false
    await nextTick()
    observer?.disconnect()
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
  }
}

onMounted(() => {
  runTypewriter()
  loadArticles()
  window.addEventListener('pointermove', handleMouseMove, { passive: true })
})

onBeforeUnmount(() => {
  if (typeTimer) window.clearTimeout(typeTimer)
  observer?.disconnect()
  window.removeEventListener('pointermove', handleMouseMove)
})
</script>

<template>
  <div :class="['blog-shell', { dark: isDark }]">
    <div class="pointer-glow"></div>
    <div class="bg-orb orb-one"></div>
    <div class="bg-orb orb-two"></div>

    <header class="site-header">
      <div class="nav-wrap">
        <button class="logo" @click="goTop">
          <span class="logo-dot">D</span>
          <span>Daixiaoming</span>
        </button>

        <nav :class="['desktop-nav', { open: mobileOpen }]">
          <button @click="goTop">首页</button>
          <button @click="scrollToArticles">文章</button>
          <button @click="selectCategory('前端')">前端</button>
          <button @click="selectCategory('工程化')">工程化</button>
          <button @click="scrollToAbout">关于本人</button>
          <button @click="router.push('/admin/articles')">管理</button>
        </nav>

        <div class="nav-actions">
          <button class="icon-btn" title="搜索" @click="openSearch">⌕</button>
          <button class="icon-btn" :title="isDark ? '浅色模式' : '深色模式'" @click="toggleTheme">{{ isDark ? '☀' : '☾' }}</button>
          <button class="menu-btn" @click="mobileOpen = !mobileOpen">☰</button>
        </div>
      </div>
    </header>

    <main>
      <section class="hero container">
        <div class="hero-copy reveal">
          <span class="hello-pill"><i></i> HELLO WORLD</span>
          <h1>你好，我是<br><strong>Daixiaoming.</strong></h1>
          <p class="typing-line"><span>{{ typed }}</span><i></i></p>
          <p class="hero-desc">这里记录前端开发、工程化、Markdown 技术文档，以及那些值得被记住的小事。代码里的文档直接展示，临时上传内容则只保存在当前浏览器。</p>
          <div class="hero-actions">
            <button class="primary-btn" @click="scrollToArticles">开始阅读 <span>→</span></button>
            <button class="soft-btn" @click="randomArticle">随便逛逛 ✦</button>
          </div>
          <div class="hero-meta">
            <span>⚡ Frontend Developer</span>
            <span>⌁ Markdown Notes</span>
            <span>◉ Keep Learning</span>
          </div>
        </div>

        <div class="hero-bento reveal" v-if="featured.length">
          <button v-if="featured[0]" class="feature-card feature-main" @click="openArticle(featured[0])">
            <img :src="heroImage" alt="featured cover">
            <span class="glass-tag">置顶推荐</span>
            <div class="feature-copy">
              <small>FEATURED · {{ featured[0].category }}</small>
              <h2>{{ featured[0].title }}</h2>
              <p>{{ featured[0].excerpt }}</p>
            </div>
          </button>
          <button v-if="featured[1]" class="feature-card feature-small purple-card" @click="openArticle(featured[1])">
            <span class="mini-icon">MD</span>
            <small>{{ featured[1].category }} / NOTES</small>
            <strong>{{ featured[1].title }}</strong>
            <em>READ MORE ↗</em>
          </button>
          <button v-if="featured[2]" class="feature-card feature-small ai-card" @click="openArticle(featured[2])">
            <div class="ai-grid"></div>
            <span class="mini-icon">DEV</span>
            <small>{{ featured[2].category }} / DOCS</small>
            <strong>{{ featured[2].title }}</strong>
            <em>EXPLORE ↗</em>
          </button>
          <div class="welcome-card">
            <div class="wave">👋</div>
            <div><small>WELCOME</small><strong>欢迎来到我的博客</strong></div>
          </div>
        </div>
      </section>

      <section class="interest container reveal">
        <div class="interest-title">
          <span>兴趣点</span>
          <small>寻找你感兴趣的领域</small>
        </div>
        <div class="tag-cloud">
          <button v-for="tag in interestTags" :key="tag" @click="searchText = tag; activeCategory = '全部'; scrollToArticles()"># {{ tag }}</button>
        </div>
      </section>

      <section id="articles" class="content container">
        <div class="main-column">
          <div class="section-title reveal">
            <div>
              <span class="eyebrow">ARTICLE</span>
              <h2>文章</h2>
            </div>
            <div class="category-tabs">
              <button v-for="item in categories" :key="item" :class="{ active: activeCategory === item }" @click="activeCategory = item">{{ item }}</button>
            </div>
          </div>

          <div v-if="loading" class="empty-card"><span>◌</span><h3>正在读取 Markdown</h3><p>代码内置文档会优先展示。</p></div>
          <div v-else-if="error" class="empty-card"><span>!</span><h3>读取失败</h3><p>{{ error }}</p></div>
          <div v-else class="article-grid">
            <article v-for="article in filteredArticles" :key="article.id" class="article-card reveal" @click="openArticle(article)">
              <div :class="['article-cover', article.cover]">
                <img v-if="article.cover === 'pink'" :src="catImage" alt="article cover">
                <div v-else class="cover-art">
                  <span>{{ article.tags[0] }}</span>
                  <i></i><i></i><i></i>
                </div>
                <span v-if="article.recommended" class="recommend">荐</span>
              </div>
              <div class="article-body">
                <span class="article-category">{{ article.category }}</span>
                <h3>{{ article.title }}</h3>
                <p>{{ article.excerpt }}</p>
                <div class="article-meta">
                  <span>◷ {{ article.date }}</span>
                  <span>◉ {{ article.read }}</span>
                  <span>{{ article.tags.join(' · ') }}</span>
                </div>
              </div>
            </article>
          </div>

          <div v-if="!loading && !error && !filteredArticles.length" class="empty-card">
            <span>⌕</span><h3>没有找到相关文章</h3><p>换个关键词或分类试试。</p>
          </div>
        </div>

        <aside class="sidebar">
          <section id="about" class="author-card side-card reveal">
            <div class="author-bg"></div>
            <img :src="avatar" alt="avatar" class="avatar">
            <h3>Daixiaoming</h3>
            <p>前端开发工程师</p>
            <div class="author-bio">热爱 Vue、CSS、工程化与一切能让开发体验变得更好的东西。</div>
            <div class="author-stats">
              <div><strong>{{ stats.articles }}</strong><span>文章</span></div>
              <div><strong>{{ stats.tags }}</strong><span>标签</span></div>
              <div><strong>{{ stats.categories }}</strong><span>分类</span></div>
            </div>
            <button @click="scrollToArticles">查看我的文章 <span>→</span></button>
          </section>

          <section class="side-card announcement reveal">
            <div class="side-title"><span>📣</span><strong>公告</strong></div>
            <p>欢迎来看我的博客鸭~ 这里主要记录前端、开发工具和项目中遇到的真实问题。</p>
          </section>

          <section class="side-card reveal">
            <div class="side-title"><span>✦</span><strong>标签</strong></div>
            <div class="sidebar-tags">
              <button v-for="tag in interestTags" :key="tag" @click="searchText = tag; activeCategory = '全部'; scrollToArticles()">{{ tag }}</button>
            </div>
          </section>

          <section class="side-card site-info reveal">
            <div class="side-title"><span>◉</span><strong>网站资讯</strong></div>
            <div><span>文章总数</span><b>{{ stats.articles }}</b></div>
            <div><span>代码文档</span><b>{{ articles.filter(i => i.source === 'builtin').length }}</b></div>
            <div><span>本地文档</span><b>{{ articles.filter(i => i.source === 'local').length }}</b></div>
            <div><span>全站字数</span><b>{{ stats.words }}k</b></div>
          </section>

          <section class="side-card reveal admin-shortcuts">
            <div class="side-title"><span>⚙</span><strong>管理入口</strong></div>
            <button @click="router.push('/admin/articles')">Markdown 文档管理</button>
            <button @click="router.push('/admin/vault')">常用链接 / 账号库</button>
          </section>
        </aside>
      </section>
    </main>

    <footer class="site-footer container">
      <div><strong>Daixiaoming 的技术博客</strong><span>记录开发，也记录生活。</span></div>
      <p>© 2026 Daixiaoming · Built with Vue 3 & Vite</p>
    </footer>

    <div class="floating-tools">
      <button class="music-ball" :class="{ playing: musicPlaying }" @click="musicPlaying = !musicPlaying" :title="musicPlaying ? '暂停音乐' : '播放音乐'">♫</button>
      <button @click="openSearch" title="搜索">⌕</button>
      <button @click="toggleTheme" title="切换主题">◐</button>
      <button @click="goTop" title="回到顶部">↑</button>
    </div>

    <Transition name="fade">
      <div v-if="searchOpen" class="modal-mask" @click.self="closeSearch">
        <div class="search-panel">
          <div class="search-head">
            <div><small>SEARCH</small><h3>搜索文章</h3></div>
            <button @click="closeSearch">×</button>
          </div>
          <label class="search-box">
            <span>⌕</span>
            <input v-model="searchText" class="search-input" placeholder="输入标题、标签或分类...">
          </label>
          <div class="search-results">
            <button v-for="article in filteredArticles" :key="article.id" @click="closeSearch(); openArticle(article)">
              <span>{{ article.category }}</span>
              <div><strong>{{ article.title }}</strong><small>{{ article.date }} · {{ article.read }}</small></div>
              <em>↗</em>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped src="../home-legacy.css"></style>
<style scoped>
.admin-shortcuts { display: grid; gap: 8px; }
.admin-shortcuts .side-title { margin-bottom: 4px; }
.admin-shortcuts > button { min-height: 40px; border: 1px solid var(--line); border-radius: 10px; background: var(--bg); color: var(--text); font-size: 11px; font-weight: 700; transition: .2s; }
.admin-shortcuts > button:hover { color: var(--primary); border-color: color-mix(in srgb, var(--primary) 30%, var(--line)); background: var(--blue-soft); }
@media (max-width: 760px) {
  .desktop-nav button, .icon-btn, .menu-btn { min-height: 46px; }
  .menu-btn, .icon-btn { width: 46px; height: 46px; }
  .category-tabs button, .tag-cloud button, .sidebar-tags button { min-height: 42px; }
  .article-card { cursor: pointer; }
  .floating-tools button { width: 48px; height: 48px; }
  .admin-shortcuts > button { min-height: 48px; }
}
</style>
