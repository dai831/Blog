<template>
  <footer class="tb-footer"><div class="tb-container"><div class="tb-footer-main"><div><span class="tb-footer-logo">✳ DAIXIAOMING</span><h2>故事未完，<br><em>明天继续。</em></h2></div><div class="tb-footer-links"><RouterLink to="/story">我们的故事 ↗</RouterLink><RouterLink to="/journal">技术手记 ↗</RouterLink><RouterLink to="/gallery">图片欣赏 ↗</RouterLink><RouterLink to="/playground">趣味实验室 ↗</RouterLink><RouterLink to="/about">关于我 ↗</RouterLink><RouterLink to="/admin/articles">内容管理 ↗</RouterLink></div></div><div class="tb-footer-bottom"><span>© {{ new Date().getFullYear() }} DAIXIAOMING · MADE WITH LOVE & CODE</span><span>结婚纪念日 09.30 · 宝宝生日 09.26</span><button @click="scrollToTop">BACK TO TOP ↑</button></div></div></footer>
</template>
<script setup>
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
</script>
