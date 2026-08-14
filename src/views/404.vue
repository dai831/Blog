<template>
    <div class="error-page">
        <el-empty :description="description" />
        <div class="actions">
            <router-link :to="{ path: '/index' }">
                <el-button type="primary">返回首页</el-button>
            </router-link>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive } from "vue";
const description = ref('抱歉，你访问的页面不存在');

</script>
<style lang="scss" scoped>
.error-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
    flex-direction: column;
}
</style>