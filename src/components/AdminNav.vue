<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const items = [
  { path: '/', label: '个人工作台', icon: '◈' },
  { path: '/admin/articles', label: '文档管理', icon: '▤' },
  { path: '/admin/editor', label: '新建文档', icon: '＋' },
  { path: '/admin/vault', label: '常用链接', icon: '⌘' },
  { path: '/blog', label: '查看博客', icon: '↗' }
]
function active(path) {
  if (path === '/admin/editor') return route.path.startsWith('/admin/editor')
  return route.path === path
}
</script>

<template>
  <aside class="admin-sidebar">
    <div class="admin-brand"><b>M</b><span>Markdown<br><small>本地文档管理</small></span></div>
    <button v-for="item in items" :key="item.path" :class="['side-link', { active: active(item.path) }]" @click="router.push(item.path)">
      <span>{{ item.icon }}</span> {{ item.label }}
    </button>
    <div class="sidebar-bottom"><span class="mode-badge local">浏览器本地模式</span></div>
  </aside>
  <nav class="admin-mobile-nav" aria-label="管理导航">
    <button v-for="item in items" :key="item.path" :class="{ active: active(item.path) }" @click="router.push(item.path)">
      <span>{{ item.icon }}</span><small>{{ item.label }}</small>
    </button>
  </nav>
</template>
