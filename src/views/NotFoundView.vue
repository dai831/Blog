<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<template><div class="not-found"><h1>404</h1><p>页面不存在</p><button class="primary-btn" @click="router.push('/')">返回首页</button></div></template>
