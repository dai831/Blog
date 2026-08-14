<template>
    <div>
        <markdown-it :source="markdownContent" />
    </div>
</template>
  
  <script setup>
import MarkdownIt from "vue3-markdown-it";
const props = defineProps({
    markdownContent: {
        type: String,
        require: true,
    },
});


</script>
  
  <style>
/* 可以添加自定义样式 */
</style>
  