<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import './admin-system.css'
const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const dark = ref(false)
const admin = computed(() => true)
const groups = ref([
 { label: 'Dashboard', icon: '⌂', open: true, items: [{ path: '/', icon: '◈', label: '工作台' }] },
 { label: '内容管理', icon: '▤', open: true, items: [{ path: '/admin/articles', icon: '▤', label: '文章管理' }, { path: '/admin/editor', icon: '＋', label: '创作中心' }, { path: '/journal', icon: '≡', label: '技术手记' }, { path: '/blog', icon: '▦', label: '博客首页' }] },
 { label: '生活记录', icon: '♡', open: true, items: [{ path: '/anniversary', icon: '♡', label: '结婚纪念日' }, { path: '/story', icon: '♧', label: '我们的故事' }, { path: '/gallery', icon: '▧', label: '图片相册' }] },
 { label: '工具与个人', icon: '⌘', open: true, items: [{ path: '/admin/vault', icon: '⌘', label: '收藏与账号' }, { path: '/playground', icon: '⚑', label: '趣味实验室' }, { path: '/about', icon: '☺', label: '关于我' }] }
])
const section = computed(() => groups.value.find(g => g.items.some(i => i.path === route.path))?.label || '内容管理')
const tabs = ref([{ path: '/', title: '工作台' }])
watch(() => route.path, () => {
 if (!tabs.value.some(t => t.path === route.path)) tabs.value.push({ path: route.path, title: route.meta.title || '页面' })
}, { immediate: true })
function closeTab(path) {
 const index = tabs.value.findIndex(t => t.path === path)
 tabs.value = tabs.value.filter(t => t.path !== path)
 if (route.path === path) router.push(tabs.value[Math.max(0, index - 1)].path)
}
</script>
<template>
 <div :class="{ 'management-system': admin, 'menu-collapsed': collapsed, 'admin-dark': dark }">
  <template v-if="admin">
   <aside class="system-sidebar"><RouterLink class="system-brand" to="/"><b>D</b><span>DXM Admin</span></RouterLink><div class="system-menu-scroll"><section v-for="group in groups" :key="group.label"><button class="system-group" :aria-expanded="group.open" :title="group.label" @click="group.open = !group.open"><i>{{ group.icon }}</i><span>{{ group.label }}</span><small>{{ group.open ? '⌃' : '⌄' }}</small></button><div v-show="group.open || collapsed"><RouterLink v-for="m in group.items" :key="m.path" :to="m.path" :title="m.label" :class="['system-menu', { current: route.path === m.path || (m.path === '/admin/editor' && route.path.startsWith('/admin/editor/')) }]"><i>{{ m.icon }}</i><span>{{ m.label }}</span></RouterLink></div></section></div></aside>
   <header class="system-header"><button @click="collapsed = !collapsed" aria-label="展开或收起菜单">☰</button><span class="system-breadcrumb">{{ section }} <span>/</span> <strong>{{ route.meta.title }}</strong></span><div class="system-tools"><RouterLink to="/blog">访问博客 ↗</RouterLink><button @click="dark = !dark" aria-label="切换明暗主题">{{ dark ? '☀' : '☾' }}</button><span class="system-avatar">D</span><span>Daixiaoming</span></div></header>
   <div class="system-tabs"><div v-for="tab in tabs" :key="tab.path" :class="['system-tab', { active: route.path === tab.path }]"><RouterLink :to="tab.path">{{ tab.title }}</RouterLink><button v-if="tab.path !== '/'" @click="closeTab(tab.path)" :aria-label="`关闭${tab.title}页签`">×</button></div></div>
  </template>
  <div :class="{ 'system-content': admin }">
  <router-view v-slot="{ Component, route }">
    <Transition name="tb-page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
  </div>
 </div>
</template>

