<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import HeartOrbit from './components/HeartOrbit.vue'
import { siteData } from './data/site'

const active = ref('首页')
const mobileOpen = ref(false)
const now = ref(Date.now())
let timer

const anniversaryDays = computed(() => {
  const start = new Date(siteData.anniversary.date).getTime()
  return Math.max(0, Math.floor((now.value - start) / 86400000))
})

const goTo = (name) => {
  active.value = name
  mobileOpen.value = false
  const map = {
    '首页': 'home',
    '关于我们': 'about',
    '故事': 'story',
    '回忆': 'memories',
    '纪念日': 'anniversary'
  }
  document.getElementById(map[name])?.scrollIntoView({ behavior: 'smooth' })
}

const onScroll = () => {
  const sections = [
    ['纪念日', 'anniversary'],
    ['回忆', 'memories'],
    ['故事', 'story'],
    ['关于我们', 'about'],
    ['首页', 'home']
  ]
  const item = sections.find(([, id]) => {
    const el = document.getElementById(id)
    return el && el.getBoundingClientRect().top <= 180
  })
  if (item) active.value = item[0]
}

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 60000)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="site-shell">
    <div class="noise"></div>
    <header class="nav-shell">
      <button class="brand" @click="goTo('首页')">
        <span class="brand-mark">♥</span>
        <span>{{ siteData.brand }}</span>
      </button>

      <nav class="desktop-nav">
        <button
          v-for="item in siteData.nav"
          :key="item"
          :class="{ active: active === item }"
          @click="goTo(item)"
        >
          {{ item }}
        </button>
      </nav>

      <button class="menu-btn" @click="mobileOpen = !mobileOpen">{{ mobileOpen ? '×' : '☰' }}</button>
      <div v-if="mobileOpen" class="mobile-nav">
        <button v-for="item in siteData.nav" :key="item" @click="goTo(item)">{{ item }}</button>
      </div>
    </header>

    <main>
      <section id="home" class="hero section-grid">
        <div class="hero-copy">
          <div class="eyebrow"><span></span>{{ siteData.hero.eyebrow }}</div>
          <h1>
            {{ siteData.hero.titleTop }}
            <strong>{{ siteData.hero.titleBottom }}</strong>
          </h1>
          <p class="hero-description">{{ siteData.hero.description }}</p>
          <div class="hero-actions">
            <button class="primary-btn" @click="goTo('回忆')">看看我们的回忆 <span>↗</span></button>
            <button class="text-btn" @click="goTo('故事')">从故事开始 →</button>
          </div>
          <div class="hero-meta">
            <div><small>OUR DAY ONE</small><strong>{{ siteData.hero.since }}</strong></div>
            <div class="meta-line"></div>
            <blockquote>{{ siteData.hero.quote }}</blockquote>
          </div>
        </div>
        <div class="hero-visual">
          <HeartOrbit />
          <div class="floating-note note-one">Always on your side.</div>
          <div class="floating-note note-two">still counting ↓</div>
        </div>
      </section>

      <section id="about" class="content-section about-section">
        <div class="section-heading">
          <span>01 / ABOUT US</span>
          <h2>两个人，两个世界，<br />慢慢长成同一个宇宙。</h2>
        </div>

        <div class="people-grid">
          <article v-for="(person, index) in siteData.people" :key="person.key" class="person-card">
            <div class="person-index">0{{ index + 1 }}</div>
            <div class="avatar-box" :class="`avatar-${person.key}`">
              <span>{{ person.avatarText }}</span>
            </div>
            <div class="person-info">
              <small>{{ person.alias }}</small>
              <h3>{{ person.name }}</h3>
              <p class="role">{{ person.role }}</p>
              <p>{{ person.bio }}</p>
              <div class="tag-list">
                <span v-for="tag in person.tags" :key="tag"># {{ tag }}</span>
              </div>
            </div>
          </article>
        </div>

        <div class="stats-grid">
          <div v-for="item in siteData.stats" :key="item.label" class="stat-card">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </section>

      <section id="story" class="content-section story-section">
        <div class="section-heading split-heading">
          <div><span>02 / OUR STORY</span><h2>时间会往前走，<br />故事会被留下。</h2></div>
          <p>我们不需要把每一天都过成电影，只想把真正重要的瞬间认真保存。</p>
        </div>

        <div class="timeline">
          <div class="timeline-line"></div>
          <article v-for="(item, index) in siteData.timeline" :key="item.date" class="timeline-item" :class="item.side">
            <div class="timeline-dot"><span>{{ index + 1 }}</span></div>
            <div class="timeline-card">
              <small>{{ item.date }}</small>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="memories" class="content-section memories-section">
        <div class="section-heading split-heading">
          <div><span>03 / MEMORIES</span><h2>我们收藏的，<br />不只是照片。</h2></div>
          <p>这些卡片都是静态数据，之后直接替换图片和文字就可以继续更新。</p>
        </div>

        <div class="memory-grid">
          <article v-for="(item, index) in siteData.memories" :key="item.title" class="memory-card" :class="{ wide: index === 0 || index === 5 }">
            <div class="memory-image"><img :src="item.image" :alt="item.title" /></div>
            <div class="memory-overlay"></div>
            <div class="memory-content">
              <div class="memory-top"><span>{{ item.tag }}</span><small>{{ item.date }}</small></div>
              <div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></div>
            </div>
          </article>
        </div>
      </section>

      <section id="anniversary" class="content-section anniversary-section">
        <div class="anniversary-panel">
          <div class="big-number">{{ anniversaryDays }}</div>
          <div class="anniversary-copy">
            <span>DAYS TOGETHER</span>
            <h2>{{ siteData.anniversary.title }}</h2>
            <p>{{ siteData.anniversary.text }}</p>
            <button class="primary-btn" @click="goTo('首页')">回到开头 ↑</button>
          </div>
          <div class="heart-watermark">♥</div>
        </div>
      </section>
    </main>

    <footer>
      <div><span>♥</span> {{ siteData.brand }}</div>
      <p>Made with Vue 3 + Vite · Pure static & easy to deploy.</p>
      <small>© 2026 OUR STORY. ALL MEMORIES RESERVED.</small>
    </footer>
  </div>
</template>
