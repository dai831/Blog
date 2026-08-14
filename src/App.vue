<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { siteData as d } from './data/site'

const menuOpen = ref(false)
const currentQuote = ref(0)
const now = ref(new Date())
let timer

const daysTogether = computed(() => {
  const start = new Date(`${d.couple.since}T00:00:00`)
  return Math.max(1, Math.floor((now.value - start) / 86400000) + 1)
})

const nextAnniversary = computed(() => {
  const [month, day] = d.couple.anniversary.split('-').map(Number)
  let target = new Date(now.value.getFullYear(), month - 1, day, 0, 0, 0)
  if (target <= now.value) target = new Date(now.value.getFullYear() + 1, month - 1, day, 0, 0, 0)
  const diff = target - now.value
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000)
  }
})

const completedWishes = computed(() => d.wishlist.filter(i => i.done).length)
const wishProgress = computed(() => Math.round(completedWishes.value / d.wishlist.length * 100))

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  menuOpen.value = false
}

function nextQuote() {
  currentQuote.value = (currentQuote.value + 1) % d.quotes.length
}

onMounted(() => {
  timer = window.setInterval(() => { now.value = new Date() }, 30000)
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <div class="page-shell">
    <div class="ambient ambient-a"></div>
    <div class="ambient ambient-b"></div>

    <header class="topbar">
      <button class="brand" @click="scrollTo('home')">
        <span class="brand-heart">♡</span>
        <span>{{ d.couple.title }}</span>
      </button>
      <nav :class="['nav', { open: menuOpen }]">
        <button v-for="item in d.nav" :key="item[0]" @click="scrollTo(item[0])">{{ item[1] }}</button>
      </nav>
      <button class="menu-btn" @click="menuOpen = !menuOpen" aria-label="menu">☰</button>
    </header>

    <main>
      <section id="home" class="hero section-wrap">
        <div class="hero-copy reveal">
          <div class="eyebrow"><span></span> OUR LITTLE UNIVERSE</div>
          <h1>{{ d.couple.leftName }} <i>×</i> {{ d.couple.rightName }}</h1>
          <h2>{{ d.couple.subtitle }}</h2>
          <p>{{ d.couple.intro }}</p>
          <div class="hero-actions">
            <button class="primary-btn" @click="scrollTo('story')">开始翻阅 <span>→</span></button>
            <button class="ghost-btn" @click="scrollTo('gallery')">看看我们的照片</button>
          </div>
          <div class="hero-meta">
            <span>Since {{ d.couple.since }}</span><b>·</b><span>{{ d.couple.city }}</span>
          </div>
        </div>

        <div class="hero-card-wrap">
          <div class="photo-card card-one">
            <div class="photo-visual peach"><span>🌷</span></div>
            <small>KEEP THIS MOMENT</small>
            <strong>今天也很喜欢你</strong>
          </div>
          <div class="photo-card card-two">
            <div class="photo-visual lilac"><span>☁️</span></div>
            <small>OUR DAILY LIFE</small>
            <strong>普通日子，也值得收藏</strong>
          </div>
          <div class="floating-note">“一起把以后写得很长。”</div>
        </div>
      </section>

      <section class="counter-strip section-wrap">
        <div class="days-card">
          <span class="tiny-label">WE HAVE BEEN TOGETHER</span>
          <strong>{{ daysTogether }}</strong>
          <span>天</span>
          <p>故事还在继续更新中 ···</p>
        </div>
        <div class="stats-grid">
          <div v-for="s in d.stats" :key="s.label" class="stat-item">
            <strong>{{ s.value }}</strong><span>{{ s.label }}</span>
          </div>
        </div>
      </section>

      <section id="story" class="story section-wrap content-section">
        <div class="section-heading">
          <span class="section-kicker">01 · OUR STORY</span>
          <h3>我们是怎么走到今天的</h3>
          <p>不是所有重要的时刻都轰轰烈烈，更多时候，它只是两个普通人愿意一次又一次走向彼此。</p>
        </div>
        <div class="timeline">
          <article v-for="(item, index) in d.timeline" :key="item.title" class="timeline-item">
            <div class="timeline-dot">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="timeline-card">
              <span>{{ item.date }}</span><h4>{{ item.title }}</h4><p>{{ item.text }}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="moments" class="moments-section content-section">
        <div class="section-wrap">
          <div class="section-heading horizontal">
            <div><span class="section-kicker">02 · LITTLE MOMENTS</span><h3>日常，是最漫长的情书</h3></div>
            <p>真正想保存的，往往不是某个盛大的纪念日，而是那些“今天没发生什么，但和你在一起挺开心”的瞬间。</p>
          </div>
          <div class="moment-grid">
            <article v-for="item in d.moments" :key="item.title" class="moment-card">
              <div class="moment-icon">{{ item.emoji }}</div><span>{{ item.tag }}</span><h4>{{ item.title }}</h4><p>{{ item.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="gallery" class="gallery section-wrap content-section">
        <div class="section-heading centered">
          <span class="section-kicker">03 · PHOTO DIARY</span>
          <h3>把喜欢装进相册里</h3>
          <p>这里先用了唯美色块作为静态占位，后面只需要把它们替换成你们自己的照片就行。</p>
        </div>
        <div class="gallery-grid">
          <article v-for="(g, index) in d.gallery" :key="g.title" :class="['gallery-card', `g-${index+1}`]">
            <div :class="['gallery-visual', g.tone]"><span>{{ g.emoji }}</span><em>0{{ index+1 }}</em></div>
            <div class="gallery-caption"><h4>{{ g.title }}</h4><p>{{ g.sub }}</p></div>
          </article>
        </div>
      </section>

      <section id="letters" class="letters content-section">
        <div class="section-wrap">
          <div class="section-heading horizontal">
            <div><span class="section-kicker">04 · LETTERS</span><h3>有些话，想认真写给你</h3></div>
            <p>聊天记录会被新的消息覆盖，所以把舍不得忘记的话，单独留一页。</p>
          </div>
          <div class="letter-grid">
            <article v-for="(letter, index) in d.letters" :key="letter.title" class="letter-card">
              <div class="letter-no">0{{ index + 1 }}</div><small>{{ letter.date }}</small><h4>{{ letter.title }}</h4><p>{{ letter.text }}</p><span class="letter-sign">To my favorite person ♡</span>
            </article>
          </div>
        </div>
      </section>

      <section id="wishlist" class="wishlist section-wrap content-section">
        <div class="wishlist-panel">
          <div class="wishlist-copy">
            <span class="section-kicker">05 · WISH LIST</span><h3>想和你一起完成的事</h3>
            <p>愿望不一定要惊天动地，小到一起逛超市，大到一起看极光，都值得认真期待。</p>
            <div class="progress-row"><span>我们的完成度</span><strong>{{ wishProgress }}%</strong></div>
            <div class="progress"><i :style="{ width: wishProgress + '%' }"></i></div>
            <small>已完成 {{ completedWishes }} / {{ d.wishlist.length }} 项</small>
          </div>
          <div class="wish-list">
            <div v-for="item in d.wishlist" :key="item.text" :class="['wish-item', { done: item.done }]">
              <span>{{ item.done ? '✓' : '○' }}</span><p>{{ item.text }}</p><em>{{ item.done ? '已收藏' : '待解锁' }}</em>
            </div>
          </div>
        </div>
      </section>

      <section id="music" class="music-section content-section">
        <div class="section-wrap music-layout">
          <div class="record-card">
            <div class="record"><div class="record-center">♡</div></div>
            <p>PLAYLIST FOR US</p><strong>一些一听就会想起你的歌</strong>
          </div>
          <div class="music-list">
            <div class="section-heading compact"><span class="section-kicker">06 · PLAYLIST</span><h3>一起听过的旋律</h3></div>
            <div v-for="song in d.playlist" :key="song.no" class="song-row">
              <span>{{ song.no }}</span><div><strong>{{ song.title }}</strong><small>{{ song.artist }}</small></div><button>♡</button>
            </div>
          </div>
        </div>
      </section>

      <section class="quote-section section-wrap content-section">
        <button class="quote-card" @click="nextQuote">
          <span>“</span><p>{{ d.quotes[currentQuote] }}</p><small>点击换一句 · OUR WORDS</small>
        </button>
      </section>

      <section id="about" class="about section-wrap content-section">
        <div class="section-heading centered"><span class="section-kicker">07 · NEXT CHAPTER</span><h3>下一次纪念日倒计时</h3><p>我们不急着把未来一次想完，只期待一个又一个可以一起抵达的明天。</p></div>
        <div class="countdown">
          <div><strong>{{ nextAnniversary.days }}</strong><span>DAYS</span></div><b>:</b>
          <div><strong>{{ String(nextAnniversary.hours).padStart(2, '0') }}</strong><span>HOURS</span></div><b>:</b>
          <div><strong>{{ String(nextAnniversary.mins).padStart(2, '0') }}</strong><span>MINUTES</span></div>
        </div>
        <div class="about-note">
          <span class="mini-heart">♡</span>
          <p>这个网站会和我们一样慢慢长大。以后可以继续添加新的旅行、新的照片、新的纪念日，还有那些当下看起来普通、未来却一定会很怀念的小事。</p>
        </div>
      </section>
    </main>

    <footer>
      <div><strong>{{ d.couple.leftName }} × {{ d.couple.rightName }}</strong><span>Made with love & tiny moments.</span></div>
      <p>© 2026 {{ d.couple.title }} · 愿所有认真喜欢，都有很长很长的以后。</p>
    </footer>
  </div>
</template>
