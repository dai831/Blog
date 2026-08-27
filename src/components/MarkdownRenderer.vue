<script setup>
import { computed, nextTick, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps({ content: { type: String, default: '' } })

marked.setOptions({
  gfm: true,
  breaks: false
})

const html = computed(() => marked.parse(props.content || ''))

function highlightCode() {
  nextTick(() => {
    document.querySelectorAll('.markdown-body pre code').forEach(block => {
      if (!block.dataset.highlighted) hljs.highlightElement(block)
    })
  })
}

watch(() => props.content, highlightCode, { immediate: true })
</script>

<template>
  <article class="markdown-body" v-html="html"></article>
</template>
