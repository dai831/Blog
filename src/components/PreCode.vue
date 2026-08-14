<template>
    <div v-highlight>
        <!-- 写成一行 不然不靠左-->
        <pre><code>{{ newCode }}</code></pre>
    </div>
</template>
<script setup>
const props = defineProps({
    newCode: {
        type: Object,
        require: true
    }
})

</script>
<style lang="scss" scoped>
pre {
    position: relative;
	font-family: 'KAITI';
    background: #333333;
    border-radius: 0.25rem;
}
.line-number {
    position: absolute;
    left: 0;
    width: 3.5em; /* 调整行号宽度以适应 4 空格 */
    padding-right: 0.5em;
    text-align: right;
    opacity: 0.5;
    user-select: none;
}

.line-content {
    display: inline-block;
    width: calc(100% - 4em); /* 调整代码内容宽度以适应行号的宽度 */
}

pre code.hljs {
    padding: 1em 2em;
    color: #1abed0;
    border-radius: 0 0 0.25rem 0.25rem;
}
</style>