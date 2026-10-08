<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <header class="reading-header">
    <div class="tb-container reading-header-inner">
      <button class="tb-brand" @click="router.push('/')" aria-label="回到博客首页"><span class="tb-brand-symbol">D<span>.</span></span><span class="tb-brand-name">DAIXIAOMING<span> / DEV JOURNAL</span></span></button>
      <nav aria-label="站点导航"><button @click="router.push('/')">首页</button><button @click="router.push('/admin/articles')">内容管理 ↗</button></nav>
    </div>
  </header>
</template>
