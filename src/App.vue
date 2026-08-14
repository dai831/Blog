<template>
    <router-view v-slot="{ Component }">
        <TopHeader v-if="isHidden"></TopHeader>
        <keep-alive>
            <div class="container">
                <component :is="Component"></component>
            </div>
        </keep-alive>
    </router-view>
</template>

<script setup>
import TopHeader from "./components/TopHeader.vue";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const isHidden = computed(() => {
    return route.meta.isTab == false;
});

</script>
<style lang="scss" scoped>
.container { 
    width: 100%;
    height: 94vh;
}
</style>
