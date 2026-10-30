<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ page: Number, totalPages: Number, loading: Boolean })
const emit = defineEmits(['change'])
const jump = ref(props.page)
watch(() => props.page, page => { jump.value = page })
const pages = computed(() => {
  const count = props.totalPages
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const visible = [...new Set([1, count, ...Array.from({ length: 5 }, (_, i) => props.page + i - 2).filter(page => page > 0 && page <= count)])].sort((a, b) => a - b)
  const result = []
  for (const page of visible) {
    const previous = result.at(-1)
    if (typeof previous === 'number' && page - previous === 2) result.push(previous + 1)
    else if (typeof previous === 'number' && page - previous > 2) result.push(`gap-${page}`)
    result.push(page)
  }
  return result
})
function go(page) {
  const target = Math.min(props.totalPages, Math.max(1, Math.floor(Number(page) || 1)))
  if (!props.loading && target !== props.page) emit('change', target)
  jump.value = target
}
</script>

<template>
  <nav v-if="totalPages > 1" class="tb-gallery-pagination" aria-label="图片分页">
    <div class="tb-gallery-page-buttons">
      <button class="tb-gallery-page-direction" :disabled="loading || page <= 1" aria-label="上一页图片" @click="go(page - 1)">← <span>上一页</span></button>
      <template v-for="item in pages" :key="item">
        <button v-if="typeof item === 'number'" class="tb-gallery-page-number" :class="{active:page === item}" :disabled="loading" :aria-current="page === item ? 'page' : undefined" :aria-label="`第 ${item} 页图片`" @click="go(item)">{{ item }}</button>
        <span v-else class="tb-gallery-page-gap" aria-hidden="true">…</span>
      </template>
      <button class="tb-gallery-page-direction" :disabled="loading || page >= totalPages" aria-label="下一页图片" @click="go(page + 1)"><span>下一页</span> →</button>
    </div>
    <form class="tb-gallery-page-jump" @submit.prevent="go(jump)"><label>第 <input v-model="jump" type="number" min="1" :max="totalPages" inputmode="numeric" aria-label="跳转图片页码" :disabled="loading"> / {{ totalPages }} 页</label><button type="submit" :disabled="loading">跳转 ↗</button></form>
  </nav>
</template>
