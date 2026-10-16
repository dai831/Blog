<script setup>
import { computed, nextTick, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import powershell from 'highlight.js/lib/languages/powershell'
import python from 'highlight.js/lib/languages/python'
import nginx from 'highlight.js/lib/languages/nginx'
import yaml from 'highlight.js/lib/languages/yaml'
import plaintext from 'highlight.js/lib/languages/plaintext'

for (const [name, language] of Object.entries({ javascript, typescript, css, xml, json, bash, powershell, python, nginx, yaml, plaintext })) {
  hljs.registerLanguage(name, language)
}
hljs.registerAliases(['vue', 'html'], { languageName: 'xml' })
hljs.registerAliases(['shell'], { languageName: 'bash' })

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
