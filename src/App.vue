<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import heroImage from './assets/bg.jpg'
import catImage from './assets/login.jpg'
import avatar from './assets/user.png'

const isDark = ref(false)
const mobileOpen = ref(false)
const searchOpen = ref(false)
const searchText = ref('')
const activeCategory = ref('全部')
const selectedArticle = ref(null)
const musicPlaying = ref(false)
const typed = ref('')
const typePhrases = ['Vue 3 / Vite / 前端工程化', 'AI / LLM / Agent', '把踩过的坑，写成能复用的经验']
let typeTimer = null
let observer = null

const categories = ['全部', '前端', 'AI', '工程化', '生活']
const interestTags = ['Vue', 'Vite', 'CSS', 'JavaScript', 'Node.js', 'LLM', 'Agent', 'Nginx']

const articles = [
  {
    id: 1,
    category: '前端',
    title: 'Chrome 调试技巧：Element 面板实战',
    excerpt: '从元素定位、样式覆盖到布局排查，把最常用的 DevTools 调试方式整理成一套高效流程。',
    date: '2026-08-26',
    read: '6 分钟',
    tags: ['Chrome', 'CSS'],
    cover: 'cyber',
    recommended: true,
    content: '调试不是“哪里错了就改哪里”，而是建立稳定的问题定位路径。本文从 DOM、Computed、Layout、Event Listener 等常见面板出发，整理一套可以直接用于日常开发的 Chrome DevTools 调试流程。'
  },
  {
    id: 2,
    category: '工程化',
    title: 'Vite base 为 / 和 ./ 到底有什么区别？',
    excerpt: '为什么本地双击 HTML 会空白，而 Live Server 能正常显示？核心就在资源路径与部署环境。',
    date: '2026-08-26',
    read: '4 分钟',
    tags: ['Vite', '部署'],
    cover: 'violet',
    recommended: true,
    content: 'Vite 的 base 决定构建产物里静态资源 URL 的生成方式。部署在域名根目录、子目录、本地 file 协议时，对资源路径的要求并不相同。理解绝对路径和相对路径后，这类“打包后白屏”的问题会非常容易定位。'
  },
  {
    id: 3,
    category: 'AI',
    title: '从应用工程师视角理解 LLM 与 Agent',
    excerpt: '不从数学公式开始，而从一次真实请求怎么进入模型、调用工具、返回结果讲清楚 Agent。',
    date: '2026-08-23',
    read: '9 分钟',
    tags: ['LLM', 'Agent'],
    cover: 'blue',
    recommended: true,
    content: 'Agent 可以理解为“模型 + 上下文 + 工具 + 循环控制”。对应用开发者来说，最重要的不是从零训练模型，而是理解什么时候让模型判断、什么时候调用工具，以及如何控制上下文和结果质量。'
  },
  {
    id: 4,
    category: '前端',
    title: 'Vue 3 页面为什么会重复请求接口？',
    excerpt: 'watch、onMounted、路由参数和异步组件组合在一起，很容易出现一次操作触发两次请求。',
    date: '2026-08-20',
    read: '7 分钟',
    tags: ['Vue3', 'watch'],
    cover: 'mint',
    recommended: false,
    content: '重复请求通常不是接口问题，而是多个响应式入口同时触发。可以从依赖来源、immediate、路由切换、组件重复挂载几个方向逐项排查，并把请求入口收敛到一个明确的方法。'
  },
  {
    id: 5,
    category: '工程化',
    title: 'Nginx 下 ERR_INCOMPLETE_CHUNKED_ENCODING 排查记录',
    excerpt: '接口数据量变大后浏览器失败，但 API 工具正常，问题可能发生在代理缓冲与链路超时。',
    date: '2026-08-19',
    read: '8 分钟',
    tags: ['Nginx', 'HTTP'],
    cover: 'orange',
    recommended: false,
    content: '当接口通过 Nginx 返回大体量 JSON 时，浏览器端出现 incomplete chunked encoding，需要同时检查 upstream、proxy_buffering、超时、压缩与中间网络设备，而不是只盯着前端。'
  },
  {
    id: 6,
    category: '生活',
    title: '把个人博客重新做成我真正想看的样子',
    excerpt: '不再只是把文章堆在页面上，而是让首页本身就像一张属于自己的数字名片。',
    date: '2026-08-18',
    read: '3 分钟',
    tags: ['Blog', 'Design'],
    cover: 'pink',
    recommended: false,
    content: '博客不只是内容容器。它也可以有清晰的视觉个性：统一的圆角、可呼吸的留白、明确的内容层级，以及那些不会打扰阅读但能让页面更有生命力的小动效。'
  }
]

const filteredArticles = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return articles.filter(item => {
    const categoryOk = activeCategory.value === '全部' || item.category === activeCategory.value
    const searchOk = !keyword || [item.title, item.excerpt, item.category, ...item.tags].join(' ').toLowerCase().includes(keyword)
    return categoryOk && searchOk
  })
})

const featured = computed(() => articles.filter(item => item.recommended).slice(0, 3))

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
  document.documentElement.classList.toggle('dark', isDark.value)
}

function openArticle(article) {
  selectedArticle.value = article
  document.body.style.overflow = 'hidden'
}

function closeArticle() {
  selectedArticle.value = null
  document.body.style.overflow = ''
}

function randomArticle() {
  const article = articles[Math.floor(Math.random() * articles.length)]
  openArticle(article)
}

function openSearch() {
  searchOpen.value = true
  nextTick(() => document.querySelector('.search-input')?.focus())
}

function closeSearch() {
  searchOpen.value = false
  searchText.value = ''
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
  document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`)
  document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`)
}

onMounted(() => {
  runTypewriter()
  window.addEventListener('pointermove', handleMouseMove, { passive: true })
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})

onBeforeUnmount(() => {
  if (typeTimer) window.clearTimeout(typeTimer)
  observer?.disconnect()
  window.removeEventListener('pointermove', handleMouseMove)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="blog-shell">
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
          <button @click="selectCategory('AI')">AI</button>
          <button @click="selectCategory('生活')">生活</button>
          <button @click="scrollToAbout">关于本人</button>
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
          <p class="hero-desc">这里记录前端开发、工程化、AI，以及那些值得被记住的小事。希望每一次踩坑，最后都能变成一篇对别人有用的文章。</p>
          <div class="hero-actions">
            <button class="primary-btn" @click="scrollToArticles">开始阅读 <span>→</span></button>
            <button class="soft-btn" @click="randomArticle">随便逛逛 ✦</button>
          </div>
          <div class="hero-meta">
            <span>⚡ Frontend Developer</span>
            <span>⌁ Chengdu</span>
            <span>◉ Keep Learning</span>
          </div>
        </div>

        <div class="hero-bento reveal">
          <button class="feature-card feature-main" @click="openArticle(featured[0])">
            <img :src="heroImage" alt="featured cover">
            <span class="glass-tag">置顶推荐</span>
            <div class="feature-copy">
              <small>FEATURED · {{ featured[0].category }}</small>
              <h2>{{ featured[0].title }}</h2>
              <p>{{ featured[0].excerpt }}</p>
            </div>
          </button>
          <button class="feature-card feature-small purple-card" @click="openArticle(featured[1])">
            <span class="mini-icon">V</span>
            <small>VITE / BUILD</small>
            <strong>{{ featured[1].title }}</strong>
            <em>READ MORE ↗</em>
          </button>
          <button class="feature-card feature-small ai-card" @click="openArticle(featured[2])">
            <div class="ai-grid"></div>
            <span class="mini-icon">AI</span>
            <small>AI / AGENT</small>
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

          <div class="article-grid">
            <article v-for="article in filteredArticles" :key="article.id" class="article-card reveal" @click="openArticle(article)">
              <div :class="['article-cover', article.cover]">
                <img v-if="article.id === 6" :src="catImage" alt="article cover">
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

          <div v-if="!filteredArticles.length" class="empty-card">
            <span>⌕</span>
            <h3>没有找到相关文章</h3>
            <p>换个关键词或分类试试。</p>
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
              <div><strong>26</strong><span>文章</span></div>
              <div><strong>8</strong><span>标签</span></div>
              <div><strong>4</strong><span>分类</span></div>
            </div>
            <button @click="openSearch">查看我的文章 <span>→</span></button>
          </section>

          <section class="side-card announcement reveal">
            <div class="side-title"><span>📣</span><strong>公告</strong></div>
            <p>欢迎来看我的博客鸭~ 这里主要记录前端、AI 和项目中遇到的真实问题。</p>
          </section>

          <section class="side-card reveal">
            <div class="side-title"><span>✦</span><strong>标签</strong></div>
            <div class="sidebar-tags">
              <button v-for="tag in interestTags" :key="tag" @click="searchText = tag; activeCategory = '全部'; scrollToArticles()">{{ tag }}</button>
            </div>
          </section>

          <section class="side-card reveal">
            <div class="side-title"><span>◫</span><strong>归档</strong></div>
            <div class="archive-row"><span>八月 2026</span><b>6 篇</b></div>
            <div class="archive-row"><span>七月 2026</span><b>8 篇</b></div>
            <div class="archive-row"><span>六月 2026</span><b>5 篇</b></div>
          </section>

          <section class="side-card site-info reveal">
            <div class="side-title"><span>◉</span><strong>网站资讯</strong></div>
            <div><span>文章总数</span><b>26</b></div>
            <div><span>建站天数</span><b>365+</b></div>
            <div><span>全站字数</span><b>38.6k</b></div>
            <div><span>总访问量</span><b>∞</b></div>
          </section>
        </aside>
      </section>
    </main>

    <footer class="site-footer container">
      <div>
        <strong>Daixiaoming 的技术博客</strong>
        <span>记录开发，也记录生活。</span>
      </div>
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

    <Transition name="fade">
      <div v-if="selectedArticle" class="modal-mask article-modal-mask" @click.self="closeArticle">
        <article class="article-modal">
          <button class="modal-close" @click="closeArticle">×</button>
          <span class="modal-category">{{ selectedArticle.category }}</span>
          <h1>{{ selectedArticle.title }}</h1>
          <div class="modal-meta">{{ selectedArticle.date }} · {{ selectedArticle.read }} · {{ selectedArticle.tags.join(' / ') }}</div>
          <div :class="['modal-cover', selectedArticle.cover]">
            <img v-if="selectedArticle.id === 6" :src="catImage" alt="cover">
            <div v-else class="modal-cover-word">{{ selectedArticle.tags[0] }}</div>
          </div>
          <p>{{ selectedArticle.content }}</p>
          <p>这个弹层目前用于演示文章详情交互。你后面可以直接把这里替换成真实 Markdown 内容或接回现有文章详情接口。</p>
          <div class="modal-tags"><span v-for="tag in selectedArticle.tags" :key="tag"># {{ tag }}</span></div>
        </article>
      </div>
    </Transition>
  </div>
</template>
