<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlogHeader from '../components/BlogHeader.vue'
import BlogFooter from '../components/BlogFooter.vue'
import GalleryPagination from '../components/GalleryPagination.vue'
import { fetchWallpaperPage, loadWallpaperCategories, wallpaperCategories } from '../services/wallpaper'

const route = useRoute()
const router = useRouter()
const categories = ref(wallpaperCategories)
const photos = ref([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')
const failedPhotos = ref(new Set())
const activeIndex = ref(null)
const galleryStart = ref(null)
const categoryId = computed(() => /^\d+$/.test(String(route.query.category || '')) ? String(route.query.category) : 'latest')
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isSafeInteger(value) && value > 0 ? value : 1
})
const pageSize = computed(() => [12, 24, 48].includes(Number(route.query.size)) ? Number(route.query.size) : 12)
const categoryLabel = computed(() => categories.value.find(item => item.id === categoryId.value)?.label || (categoryId.value === 'latest' ? '最新推荐' : '图片分类'))
const activePhoto = computed(() => activeIndex.value === null ? null : photos.value[activeIndex.value])
const range = computed(() => total.value ? `${(page.value - 1) * pageSize.value + 1}–${Math.min(page.value * pageSize.value, total.value)}` : '0')
let controller
let requestId = 0
let previousFocus
let previousOverflow = ''
let touchStartX = null
let firstLoad = true

function updateQuery(changes) {
  const query = { ...route.query, ...changes }
  if (query.category === 'latest') delete query.category
  if (Number(query.page) === 1) delete query.page
  if (Number(query.size) === 12) delete query.size
  router.push({ path: '/gallery', query })
}
function changeCategory(id) { updateQuery({ category: id, page: 1 }) }
function changePage(value) { updateQuery({ page: value }) }
function changeSize(event) { updateQuery({ size: event.target.value, page: 1 }) }
async function load() {
  controller?.abort()
  controller = new AbortController()
  const current = ++requestId
  const shouldScroll = !firstLoad
  firstLoad = false
  closePhoto()
  loading.value = true
  error.value = ''
  photos.value = []
  failedPhotos.value = new Set()
  if (shouldScroll) galleryStart.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  try {
    const result = await fetchWallpaperPage({ categoryId: categoryId.value, page: page.value, pageSize: pageSize.value, signal: controller.signal })
    if (current !== requestId) return
    if (result.totalPages > 0 && page.value > result.totalPages) {
      await router.replace({ path: '/gallery', query: { ...route.query, page: String(result.totalPages) } })
      return
    }
    photos.value = result.items
    total.value = result.total
    totalPages.value = result.totalPages
  } catch (cause) {
    if (current === requestId && cause?.name !== 'AbortError') error.value = cause?.message || '图片暂时无法加载，请重试。'
  } finally { if (current === requestId) loading.value = false }
}
function markFailed(photo) { failedPhotos.value = new Set([...failedPhotos.value, photo.id]) }
async function openPhoto(index) {
  previousFocus = document.activeElement
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  activeIndex.value = index
  await nextTick()
  document.querySelector('.tb-gallery-lightbox .tb-lightbox-close')?.focus()
}
function closePhoto() {
  if (activeIndex.value === null) return
  activeIndex.value = null
  document.body.style.overflow = previousOverflow
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
}
function movePhoto(step) {
  if (activeIndex.value === null) return
  activeIndex.value = Math.min(photos.value.length - 1, Math.max(0, activeIndex.value + step))
}
function onKeydown(event) {
  if (!activePhoto.value || document.querySelector('.tb-search-dialog')) return
  if (event.key === 'Escape') closePhoto()
  if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1) }
  if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1) }
  if (event.key === 'Tab') {
    const controls = [...document.querySelectorAll('.tb-gallery-lightbox button:not(:disabled), .tb-gallery-lightbox a')]
    if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus() }
    else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus() }
  }
}
function onTouchStart(event) { touchStartX = event.changedTouches[0]?.clientX ?? null }
function onTouchEnd(event) {
  if (touchStartX === null) return
  const distance = event.changedTouches[0].clientX - touchStartX
  if (Math.abs(distance) > 55) movePhoto(distance < 0 ? 1 : -1)
  touchStartX = null
}
watch([categoryId, page, pageSize], load, { immediate: true })
onMounted(() => {
  loadWallpaperCategories().then(items => { categories.value = items })
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => { requestId += 1; controller?.abort(); closePhoto(); window.removeEventListener('keydown', onKeydown) })
</script>

<template>
  <div class="tech-blog tb-page-gallery tb-inner-page"><BlogHeader />
    <main>
      <section class="tb-page-intro"><div class="tb-container"><RouterLink class="tb-breadcrumb" to="/">首页 <span>↗</span></RouterLink><div class="tb-page-intro-grid"><div><span class="tb-eyebrow">A COLLECTION OF BEAUTIFUL THINGS</span><h1>用眼睛，<br>收藏这个世界。</h1><p>风景、色彩与想象力。选一种喜欢的画面，翻开属于它的下一页。</p></div><span class="tb-page-intro-glyph" aria-hidden="true">✦</span></div></div></section>
      <section id="gallery" ref="galleryStart" class="tb-gallery tb-section"><div class="tb-container">
        <div class="tb-gallery-filter-head"><div><span class="tb-eyebrow">FIND YOUR KIND OF BEAUTIFUL</span><h2>今天，想看点什么？</h2></div><label class="tb-gallery-size">每页 <select :value="pageSize" aria-label="每页图片数量" @change="changeSize"><option :value="12">12 张</option><option :value="24">24 张</option><option :value="48">48 张</option></select></label></div>
        <nav class="tb-gallery-categories" aria-label="图片分类"><button :class="{active:categoryId === 'latest'}" :aria-pressed="categoryId === 'latest'" @click="changeCategory('latest')">✦ 最新推荐</button><button v-for="item in categories" :key="item.id" :class="{active:categoryId === item.id}" :aria-pressed="categoryId === item.id" @click="changeCategory(item.id)">{{ item.label }}</button></nav>
        <label class="tb-gallery-mobile-category">图片分类 <select :value="categoryId" aria-label="选择图片分类" @change="changeCategory($event.target.value)"><option value="latest">✦ 最新推荐</option><option v-for="item in categories" :key="item.id" :value="item.id">{{ item.label }}</option></select></label>
        <div class="tb-gallery-results-head" aria-live="polite"><div><strong>{{ categoryLabel }}</strong><span v-if="loading">正在寻找好看的画面…</span><span v-else-if="!error">共 {{ total.toLocaleString('zh-CN') }} 张 · 当前 {{ range }} 张</span><span v-else>暂时无法读取</span></div><span v-if="!loading && !error && totalPages">第 {{ page }} / {{ totalPages }} 页</span></div>
        <div v-if="loading" class="tb-gallery-grid tb-gallery-skeleton" aria-busy="true" aria-label="图片加载中"><div v-for="index in pageSize" :key="index" class="tb-photo tb-photo-skeleton"></div></div>
        <div v-else-if="error" class="tb-gallery-empty" role="alert"><span>☁</span><h3>风景暂时没有送达</h3><p>{{ error }}</p><button class="tb-button tb-button-outline" @click="load">重新加载 <span>↻</span></button></div>
        <div v-else-if="!photos.length" class="tb-gallery-empty"><span>✧</span><h3>这一页还没有图片</h3><p>试试其他分类，或回到最新推荐看看。</p><button class="tb-button tb-button-outline" @click="changeCategory('latest')">查看最新推荐 <span>↗</span></button></div>
        <div v-else class="tb-gallery-grid"><button v-for="(photo,index) in photos" :key="photo.id" class="tb-photo tb-gallery-result-photo" @click="openPhoto(index)"><img v-if="!failedPhotos.has(photo.id)" :src="photo.url" :alt="photo.title" :loading="index < 3 ? 'eager' : 'lazy'" @error="markFailed(photo)"><span v-else class="tb-photo-unavailable">☁<small>图片暂时无法显示</small></span><span class="tb-photo-overlay"><span><small>NO. {{ String((page-1)*pageSize+index+1).padStart(2,'0') }} / {{ photo.category }}</small><strong>{{ photo.title }}</strong></span><b>↗</b></span></button></div>
        <GalleryPagination v-if="!error && !loading" :page="page" :total-pages="totalPages" :loading="loading" @change="changePage" />
        <p class="tb-gallery-credit">精选壁纸与视觉作品 · 图片版权归原作者所有。</p>
      </div></section>
    </main><BlogFooter />
    <Teleport to="body"><Transition name="tb-modal"><div v-if="activePhoto" class="tb-modal-overlay tb-lightbox tb-gallery-lightbox tech-blog-modal" @click.self="closePhoto"><div class="tb-lightbox-inner" role="dialog" aria-modal="true" :aria-label="activePhoto.title"><button class="tb-lightbox-close" aria-label="关闭图片" @click="closePhoto">✕</button><img :key="activePhoto.id" :src="activePhoto.url" :alt="activePhoto.title" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd"><div class="tb-gallery-lightbox-caption"><div><strong>{{ activePhoto.title }}</strong><span>{{ activePhoto.category }} · 作者：{{ activePhoto.credit || '原作者' }}</span></div><a :href="activePhoto.url" target="_blank" rel="noopener noreferrer">查看原图 ↗</a></div><div class="tb-gallery-lightbox-controls"><button aria-label="上一张图片" :disabled="activeIndex === 0" @click="movePhoto(-1)">← 上一张</button><span>{{ activeIndex + 1 }} / {{ photos.length }}<small>方向键或左右滑动切换</small></span><button aria-label="下一张图片" :disabled="activeIndex === photos.length-1" @click="movePhoto(1)">下一张 →</button></div></div></div></Transition></Teleport>
  </div>
</template>
