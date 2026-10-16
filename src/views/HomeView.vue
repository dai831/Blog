<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { categories, categoryLabel, listArticles } from '../services/blog'
import { loadWallpapers } from '../services/wallpaper'
import { daysSince, daysUntilNext, yearsSince } from '../utils/milestones'
import BlogHeader from '../components/BlogHeader.vue'
import BlogFooter from '../components/BlogFooter.vue'

const props = defineProps({ page: { type: String, default: 'home' } })
const router = useRouter()
const header = ref(null)
const articles = ref([])
const wallpapers = ref([])
const loading = ref(true)
const error = ref('')
const activeCategory = ref('全部')
const visibleCount = ref(6)
const activePhoto = ref(null)
const galleryLoading = ref(false)
const galleryMessage = ref('')
let galleryPage = 1
const progress = ref(0)
const now = ref(new Date())
let revealObserver
let clockTimer
let previousFocus
let previousOverflow = ''

const weddingDate = new Date(2022, 8, 30)
const birthday = new Date(2024, 8, 26)
const marriedYears = computed(() => yearsSince(weddingDate, now.value))
const togetherDays = computed(() => daysSince(weddingDate, now.value))
const babyYears = computed(() => yearsSince(birthday, now.value))
const babyDays = computed(() => daysSince(birthday, now.value))
const anniversaryCountdown = computed(() => daysUntilNext(8, 30, now.value))
const birthdayCountdown = computed(() => daysUntilNext(8, 26, now.value))
const anniversaryYears = computed(() => Array.from({ length: marriedYears.value + 1 }, (_, i) => ({ year: 2022 + i, label: i === 0 ? '故事开始' : `第 ${i} 个结婚纪念日` })))
const pageInfo = computed(() => ({
  story: { label: 'OUR LITTLE UNIVERSE', title: '两个人的故事，\n三个人的以后。', text: '从 2022 年 9 月 30 日到现在，收藏时间里最温柔的坐标。', glyph: '♡' },
  journal: { label: 'THE DEVELOPER’S NOTEBOOK', title: '边学边做，\n把答案留在这里。', text: '从真实问题出发，记录前端开发、工程实践和那些终于想通的瞬间。', glyph: '{ }' },
  gallery: { label: 'A COLLECTION OF BEAUTIFUL THINGS', title: '用眼睛，\n收藏这个世界。', text: '风景、色彩与想象力。点开一张图，让思绪去远处散个步。', glyph: '✦' },
  about: { label: 'ME, IN A FEW WORDS', title: '写代码的人，\n也热爱烟火日常。', text: '一个关于我、热爱和这个小小博客的介绍。很高兴在这里遇见你。', glyph: '☺' }
})[props.page])

function getTags(item) {
  const text = `${item.title} ${item.subtext}`.toLowerCase()
  const rules = [['Vue', /vue/], ['CSS', /css|样式|圆角|边框/], ['JavaScript', /javascript|\bjs\b/], ['Node.js', /node|npm/], ['Electron', /electron/], ['Nginx', /nginx/], ['Git', /git/], ['Vite', /vite/], ['UniApp', /uniapp/], ['地图', /地图|qgis/]]
  return rules.filter(([, pattern]) => pattern.test(text)).map(([label]) => label).slice(0, 2)
}
function getDate(item) {
  const value = item.publishedAt || item.updatedAt || item.createdAt
  const parsed = value ? new Date(value) : null
  return parsed && !Number.isNaN(parsed.getTime()) ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(parsed) : '技术手记'
}
const displayArticles = computed(() => articles.value.map(item => ({
  ...item,
  title: (/^\s*(?:\d+[.、]|\*\*)/.test(item.title) && item.sourceName ? item.sourceName.replace(/[_-]/g, ' ') : item.title).replace(/[`*]/g, ''),
  category: categoryLabel(item.type), excerpt: item.subtext || '来自实际开发过程的一篇技术记录。',
  tags: getTags(item), date: getDate(item), read: `${Math.max(1, Math.ceil(String(item.richtext || '').length / 450))} 分钟阅读`
})))
const featured = computed(() => {
  const priority = [/前端开发规范/, /Electron.*多架构/, /Vue3.*Vite.*HTTPS/i]
  const preferred = priority.map(pattern => displayArticles.value.find(item => pattern.test(`${item.title} ${item.sourceName || ''}`))).filter(Boolean)
  return [...preferred, ...displayArticles.value.filter(item => !preferred.includes(item))].slice(0, 3)
})
const filtered = computed(() => {
  return displayArticles.value.filter(item => activeCategory.value === '全部' || item.category === activeCategory.value)
})
const visibleArticles = computed(() => filtered.value.slice(0, visibleCount.value))
const gallery = computed(() => wallpapers.value.slice(0, props.page === 'gallery' ? 12 : 6))

function scrollTo(id) {
  if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' })
  else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
function chooseCategory(name) { activeCategory.value = name; visibleCount.value = 6; scrollTo('journal') }
function openArticle(item) { router.push(`/article/${encodeURIComponent(item.id)}`) }
function openSearch() { header.value?.openSearch() }
async function refreshGallery() {
  galleryLoading.value = true
  galleryMessage.value = ''
  const nextPage = galleryPage % 3 + 1
  const images = await loadWallpapers({ page: nextPage, limit: 12 })
  if (images.length) { wallpapers.value = images; galleryPage = nextPage }
  else galleryMessage.value = '这组风景暂时没有送达，请稍后再试。'
  galleryLoading.value = false
}
function onKeydown(event) {
  if (event.key === 'Escape') activePhoto.value = null
  if (event.key === 'Tab' && activePhoto.value) {
    const controls = [...document.querySelectorAll('.tb-lightbox [role="dialog"] button')]
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
}
function onScroll() { const max = document.documentElement.scrollHeight - innerHeight; progress.value = max > 0 ? Math.min(100, scrollY / max * 100) : 0 }
function observeReveals() { document.querySelectorAll('.tb-reveal:not(.is-visible)').forEach(node => revealObserver?.observe(node)) }
watch([visibleArticles, gallery], async () => { await nextTick(); observeReveals() })
watch(() => Boolean(activePhoto.value), async opened => {
  if (opened) {
    previousFocus = document.activeElement
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    document.querySelector('.tb-lightbox [role="dialog"] button')?.focus()
  } else {
    document.body.style.overflow = previousOverflow
    previousFocus?.focus()
  }
})
onMounted(async () => {
  clockTimer = window.setInterval(() => { now.value = new Date() }, 60000)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  onScroll()
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target) }
    }), { threshold: .08, rootMargin: '0px 0px -40px 0px' })
    observeReveals()
  } else document.querySelectorAll('.tb-reveal').forEach(node => node.classList.add('is-visible'))
  const photoTask = ['home', 'gallery'].includes(props.page) ? loadWallpapers({ limit: props.page === 'gallery' ? 12 : 6 }).then(items => { wallpapers.value = items }) : Promise.resolve()
  try { if (['home', 'journal', 'about'].includes(props.page)) articles.value = await listArticles() }
  catch (cause) { error.value = cause?.message || '文章暂时无法加载' }
  finally { loading.value = false }
  await photoTask
})
onBeforeUnmount(() => {
  window.clearInterval(clockTimer)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  revealObserver?.disconnect()
  if (activePhoto.value) document.body.style.overflow = previousOverflow
})
</script>

<template>
  <div class="tech-blog" :class="['tb-page-' + page, { 'tb-inner-page': page !== 'home' }]">
    <div class="tb-progress" :style="{ width: `${progress}%` }"></div>
    <BlogHeader ref="header" />

    <main>
      <section v-if="pageInfo" class="tb-page-intro"><div class="tb-container"><RouterLink class="tb-breadcrumb" to="/">首页 <span>↗</span></RouterLink><div class="tb-page-intro-grid"><div><span class="tb-eyebrow">{{ pageInfo.label }}</span><h1>{{ pageInfo.title }}</h1><p>{{ pageInfo.text }}</p></div><span class="tb-page-intro-glyph" aria-hidden="true">{{ pageInfo.glyph }}</span></div></div></section>
      <section v-if="page === 'home'" id="top" class="tb-hero"><div class="tb-container tb-hero-grid">
        <div class="tb-hero-copy"><div class="tb-pill"><span class="tb-pill-dot"></span> PERSONAL BLOG · CODE & LIFE</div><h1>把日子过成<span class="tb-heading-underline">故事</span><span class="tb-hero-star">✳</span><br>把热爱写进<span class="tb-heading-code">代码。</span></h1><p class="tb-hero-desc">你好，我是 Daixiaoming。这里收藏我的技术手记，也收藏和家人一起走过的日子。认真生活，保持好奇，偶尔把美好定格。</p><div class="tb-hero-actions"><button class="tb-button tb-button-dark" @click="router.push('/journal')">读点技术 <span>↗</span></button><button class="tb-button tb-button-outline" @click="router.push('/story')">看看我们的故事 <span>↘</span></button></div><div class="tb-hero-footnote"><span class="tb-mini-avatars"><i>♥</i><i>✳</i><i>☺</i></span><span>开发者 · 伴侣 · 宝宝的家长<br><small>认真记录每一种身份</small></span></div></div>
        <div class="tb-hero-art" aria-label="生活、技术与图片灵感拼贴"><div class="tb-art-sun" aria-hidden="true">✺</div><div class="tb-art-card tb-art-card-photo"><img v-if="gallery[0]" :src="gallery[0].url" :alt="gallery[0].title" fetchpriority="high"><div v-else class="tb-art-photo-fallback">✿</div><span class="tb-art-photo-caption">LIFE IN COLORS <b>↗</b></span></div><div class="tb-art-card tb-art-card-note"><span>今天也要</span><strong>好好<br>生活<span>♡</span></strong><small>and keep building.</small></div><div class="tb-art-sticker tb-art-sticker-code">&lt; keep<br>creating /&gt;</div><div class="tb-art-sticker tb-art-sticker-date">09.30 <span>♡</span></div><div class="tb-art-spark" aria-hidden="true">✧</div></div>
      </div><div class="tb-hero-bottom tb-container"><span>向下滚动，开始探索 <b>↓</b></span><span>CODE · LOVE · EVERYDAY LIFE</span></div></section>
      <div v-if="page === 'home'" class="tb-ribbon" aria-hidden="true"><div>写代码，也写生活 <span>✳</span> CREATE & REMEMBER <span>✳</span> 写代码，也写生活 <span>✳</span> CREATE & REMEMBER <span>✳</span> 写代码，也写生活 <span>✳</span> CREATE & REMEMBER <span>✳</span></div></div>

      <section v-if="page === 'home'" class="tb-explore tb-container"><RouterLink v-for="entry in [{path:'/story',name:'我们的故事',sub:'把重要的日子好好收藏',symbol:'♡',tone:'pink'},{path:'/journal',name:'技术手记',sub:'一些能用得上的开发经验',symbol:'⌘',tone:'blue'},{path:'/gallery',name:'图片欣赏',sub:'留一点时间给色彩与远方',symbol:'✦',tone:'yellow'},{path:'/playground',name:'趣味实验室',sub:'来一局，给大脑放个小假',symbol:'☺',tone:'purple'}]" :key="entry.path" :to="entry.path" :class="'tb-explore-' + entry.tone"><span>{{ entry.symbol }}</span><div><strong>{{ entry.name }}</strong><small>{{ entry.sub }}</small></div><b>↗</b></RouterLink></section>

      <section v-if="['home', 'story'].includes(page)" id="story" class="tb-story tb-section"><div class="tb-container"><div class="tb-section-intro tb-reveal"><span class="tb-eyebrow">01 / THE LITTLE BIG MOMENTS</span><div class="tb-section-heading"><h2>写在生活里的<span>重要日期<span class="tb-text-spark">✳</span></span></h2><p>有些数字不只代表时间，还提醒我为什么要努力创造更好的每一天。</p></div></div><div class="tb-story-grid">
        <article class="tb-story-card tb-wedding tb-reveal"><div class="tb-story-top"><span>OUR ANNIVERSARY</span><span>♡</span></div><div class="tb-wedding-icon" aria-hidden="true">♥</div><div class="tb-story-content"><span class="tb-story-label">每年 9 月 30 日</span><h3>从那天起，<br>多了一个<span>「我们」。</span></h3><p>2022.09.30 是我们的结婚纪念日。时间继续向前，值得珍惜的始终是一起认真度过的每一天。</p><div class="tb-story-stats"><div><strong>{{ marriedYears }}</strong><small>周年</small></div><div><strong>{{ togetherDays.toLocaleString('zh-CN') }}</strong><small>天相伴</small></div><div><strong>{{ anniversaryCountdown === 0 ? '今天' : anniversaryCountdown }}</strong><small>{{ anniversaryCountdown === 0 ? '纪念日快乐' : '天后纪念日' }}</small></div></div></div></article>
        <article class="tb-story-card tb-baby tb-reveal"><div class="tb-story-top"><span>HELLO, LITTLE ONE</span><span>✿</span></div><div class="tb-baby-illustration" aria-hidden="true"><span>✺</span><i>✦</i></div><div class="tb-story-content"><span class="tb-story-label">2024 年 9 月 26 日</span><h3>世界有了<br>更可爱的<span>新章节。</span></h3><p>宝宝来到我们身边的日子。想把成长里的每一份惊喜，都妥帖放进记忆里。</p><div class="tb-story-stats"><div><strong>{{ babyYears }}</strong><small>岁</small></div><div><strong>{{ babyDays.toLocaleString('zh-CN') }}</strong><small>天成长</small></div><div><strong>{{ birthdayCountdown === 0 ? '今天' : birthdayCountdown }}</strong><small>{{ birthdayCountdown === 0 ? '生日快乐' : '天后生日' }}</small></div></div></div></article>
      </div><div class="tb-timeline tb-reveal"><div><span>2022.09.30</span><strong>我们的结婚纪念日</strong></div><i></i><div><span>2024.09.26</span><strong>宝宝出生的日子</strong></div><i></i><div><span>现在 → 未来</span><strong>故事继续发生</strong></div></div></div></section>

      <section v-if="['home', 'journal'].includes(page)" id="journal" class="tb-journal tb-section"><div class="tb-container"><div class="tb-section-intro tb-reveal"><span class="tb-eyebrow">02 / NOTES FROM THE DESK</span><div class="tb-section-heading"><h2>技术手记<span class="tb-heading-bubble">⌘</span></h2><p>前端、Vue、工程实践与解决问题的过程。写下能复用的经验，也保留探索时的好奇心。</p></div></div>
        <div v-if="loading" class="tb-state">正在整理文章…</div><div v-else-if="error" class="tb-state">{{ error }}</div><div v-else-if="featured.length" class="tb-feature-grid"><button v-for="(item, index) in featured" :key="item.id" class="tb-feature-card tb-reveal" :class="`tb-feature-${index}`" @click="openArticle(item)"><div class="tb-feature-visual"><span class="tb-feature-index">0{{ index + 1 }} / FEATURED</span><span class="tb-feature-glyph">{{ index === 0 ? '{ }' : index === 1 ? '✳' : '</>' }}</span><span class="tb-feature-arrow">↗</span></div><div class="tb-feature-content"><span class="tb-feature-category">{{ item.category }} <span v-for="tag in item.tags" :key="tag">· {{ tag }}</span></span><h3>{{ item.title }}</h3><p>{{ item.excerpt }}</p><div class="tb-feature-meta"><span>{{ item.date }}</span><span>{{ item.read }}</span></div></div></button></div>
<template v-if="page === 'journal'">        <div class="tb-archive-header tb-reveal"><div><span class="tb-eyebrow">THE ARCHIVE</span><h3>继续往下读 <sup>{{ filtered.length }}</sup></h3></div><button @click="openSearch">⌕ <span>搜索文章</span></button></div><div class="tb-category-list" aria-label="文章分类"><button v-for="name in ['全部', ...categories.map(item => item.label)]" :key="name" :class="{ active: activeCategory === name }" @click="chooseCategory(name)">{{ name }}</button></div><div v-if="!loading && !error && !filtered.length" class="tb-state">这个分类暂时没有文章，试试其他方向。</div><div class="tb-article-list"><button v-for="(item, index) in visibleArticles" :key="item.id" class="tb-article-row tb-reveal" @click="openArticle(item)"><span class="tb-row-number">{{ String(index + 1).padStart(2, '0') }}</span><span class="tb-row-main"><span class="tb-row-category">{{ item.category }} <span v-for="tag in item.tags" :key="tag">/ {{ tag }}</span></span><strong>{{ item.title }}</strong><small>{{ item.excerpt }}</small></span><span class="tb-row-date">{{ item.date }}<small>{{ item.read }}</small></span><span class="tb-row-arrow">↗</span></button></div><button v-if="visibleCount < filtered.length" class="tb-load-more" @click="visibleCount += 6">加载更多文章 <span>↓</span></button></template><RouterLink v-else class="tb-inline-link" to="/journal">去文章归档，发现更多 {{ articles.length }} 篇记录 <span>↗</span></RouterLink>
      </div></section>

      <section v-if="page === 'gallery'" id="gallery" class="tb-gallery tb-section"><div class="tb-container"><div class="tb-section-intro tb-reveal"><span class="tb-eyebrow">03 / VISUAL DIARY</span><div class="tb-section-heading"><h2>图片欣赏<span class="tb-gallery-star">✦</span></h2><p>把喜欢的风景，存进眼睛里。偶尔离开屏幕里的代码，看看色彩与远方。</p></div></div><div class="tb-gallery-toolbar"><span>{{ gallery.length }} 个值得停留的画面</span><button class="tb-button tb-button-outline" :disabled="galleryLoading" @click="refreshGallery">{{ galleryLoading ? '风景正在路上…' : '换一组风景' }} <span>⟳</span></button></div><p v-if="galleryMessage" role="status" class="tb-gallery-message">{{ galleryMessage }}</p><div v-if="gallery.length" class="tb-gallery-grid"><button v-for="(photo, index) in gallery" :key="photo.url" class="tb-photo tb-reveal" :class="`tb-photo-${index}`" @click="activePhoto = photo"><img :src="photo.url" :alt="photo.title" loading="lazy"><span class="tb-photo-overlay"><span><small>NO. {{ String(index + 1).padStart(2, '0') }} / {{ photo.category }}</small><strong>{{ photo.title }}</strong></span><b>↗</b></span></button></div><div v-else class="tb-gallery-fallback"><div v-for="(symbol, index) in ['✿', '☼', '✧']" :key="index" class="tb-fallback-art">{{ symbol }}</div><p>图片正在路上，稍后刷新看看。</p></div><p class="tb-gallery-credit">精选壁纸与视觉作品 · 图片版权归原作者所有。</p></div></section>

      <section v-if="page === 'about'" id="about" class="tb-about tb-section"><div class="tb-container tb-about-grid"><div class="tb-about-art tb-reveal"><div class="tb-about-circle"><span>D<span>.</span></span><i>KEEP CURIOUS</i></div><span class="tb-about-flower">✿</span><span class="tb-about-smile">☺</span><div class="tb-about-note">你好，很高兴<br>在这里遇见你。<span>↗</span></div></div><div class="tb-about-copy tb-reveal"><span class="tb-eyebrow">04 / A LITTLE ABOUT ME</span><h2>你好，我是<br><span>Daixiaoming<span class="tb-about-dot">.</span></span></h2><p>我是一名前端开发者，喜欢琢磨交互细节，也喜欢把遇到的问题整理成能再次翻阅的答案。工作之外，我同样珍惜和家人在一起的普通日子。</p><p>这个博客是我的小小收藏夹：技术实践、图片灵感、结婚纪念日，以及宝宝成长带来的新视角。愿每次来访，都能发现一点有用或美好的东西。</p><div class="tb-about-tags"><span>Vue & Frontend</span><span>记录生活</span><span>保持好奇</span></div><RouterLink class="tb-button tb-button-dark" to="/playground" style="text-decoration:none">去实验室玩一会儿 <span>↗</span></RouterLink></div></div></section>
      <section v-if="page === 'story'" class="tb-yearbook tb-section"><div class="tb-container"><span class="tb-eyebrow">A YEAR AT A TIME</span><h2>每一个 9 月 30 日，<br>都是新的开始。</h2><div class="tb-year-grid"><div v-for="(entry, index) in anniversaryYears" :key="entry.year"><span>{{ entry.year }}.09.30</span><strong>{{ index === 0 ? '♡' : String(index).padStart(2, '0') }}</strong><small>{{ entry.label }}</small></div></div><p>相伴的日子会继续增加，我们也会继续把平凡过得有声有色。</p></div></section>
      <section v-if="page === 'about'" class="tb-toolbox tb-section"><div class="tb-container"><span class="tb-eyebrow">THINGS I WRITE ABOUT</span><h2>我的技术工具箱 <span>⌘</span></h2><p>从实际写下的 {{ articles.length }} 篇笔记里，看看最近在探索什么。</p><div class="tb-toolbox-grid"><RouterLink v-for="item in categories" :key="item.value" to="/journal"><span>{{ item.label }}</span><strong>{{ articles.filter(article => Number(article.type) === item.value).length }}<small> 篇笔记</small></strong><b>↗</b></RouterLink></div><RouterLink class="tb-inline-link" to="/playground">除了写代码，也一起玩一会儿 <span>↗</span></RouterLink></div></section>
    </main>
    <BlogFooter />
    <Transition name="tb-modal"><div v-if="activePhoto" class="tb-modal-overlay tb-lightbox" @click.self="activePhoto = null"><div class="tb-lightbox-inner" role="dialog" aria-modal="true" :aria-label="activePhoto.title"><button class="tb-lightbox-close" aria-label="关闭图片" @click="activePhoto = null">✕</button><img :src="activePhoto.url" :alt="activePhoto.title"><div><strong>{{ activePhoto.title }}</strong><span>{{ activePhoto.category }} · 图片作者：{{ activePhoto.credit || '原作者' }}</span></div></div></div></Transition>
  </div>
</template>
