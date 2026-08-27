<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <header class="site-header">
    <div class="shell header-inner">
      <button class="brand" @click="router.push('/')">
        <span class="brand-mark">M</span>
        <span><strong>Markdown</strong><small>本地文档站</small></span>
      </button>
      <nav>
        <router-link to="/">文档</router-link>
        <router-link to="/admin/articles">管理</router-link>
      </nav>
    </div>
  </header>
</template>
