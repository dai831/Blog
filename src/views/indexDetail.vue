<template>
    <div class="indexDetail">
        <el-row>
            <el-col :span="5"> </el-col>
            <el-col :span="14">
                <div class="main">
                    <div class="header">
                        <div class="title">{{ pageObj.attributes.title }}</div>
                        <div class="subtext flex_center">
                            <el-icon><Timer /></el-icon>
                            <div class="date">
                                {{
                                    formattedDate(pageObj.attributes.createdAt)
                                }}
                            </div>
                        </div>
                    </div>
                    <div class="precontent">
                        <Markdown :markdownContent="pageObj.attributes.richtext" />
                    </div>
                </div>
            </el-col>
            <el-col :span="5">
                <div v-show="scrollShowBtn" class="right flex_center">
                    <div class="right_img" @click="goTop">
                        <img
                            title="去顶部"
                            src="../assets/gotop.svg"
                            alt="去顶部"
                        />
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from "vue";
import { idArticleApi } from "@/api/indexDetail";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import formattedDate from "@/utils/date";
import Markdown from '../components/Markdown.vue';

const route = useRoute();
const pageObj = reactive({
    attributes: {},
});
const scrollY = ref(0);
const scrollShowBtn = ref(false);
const safeContent = ref({});
const User = useUserStore();

onMounted(() => {
    User.userInfo.routeKey = null;
    window.addEventListener("scroll", () => {
        scrollY.value = window.scrollY;
        if (scrollY.value > 0) {
            scrollShowBtn.value = true;
        } else {
            scrollShowBtn.value = false;
        }
    });
});

const fetchArticle = async (id) => {
    const res = await idArticleApi(id);
    pageObj.attributes = res?.data?.data?.attributes;
};

// // 监听路由参数变化
watch(
    () => route.query.id,
    (newId) => {
        if (newId) fetchArticle(newId);
    },
    { deep: true, immediate: true } //这里 deep 可以不要
);

const goTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};
</script>
<style lang="scss" scoped>
.indexDetail {
    width: 100%;
    position: relative;
    min-height: 94vh;
}
.main {
    overflow: auto;
    background: #30797e33;
    background-image: linear-gradient(to right, #ddd 0%, #b9cfce 100%);
    margin-bottom: 1.5rem;
}
.header {
    margin-top: 4rem;
    text-align: center;
    .title {
        font-size: 2rem;
        font-weight: bolder;
        margin-bottom: 1rem;
    }
    .subtext {
        color: #666;
        & > span {
            margin: 0 0.5rem 0 0.2rem;
        }
    }
}

.main_content {
    width: 100%;
}
.right_img {
    position: fixed;
    right: 2rem;
    opacity: 0;
    animation: opacity 1s ease-in-out forwards;
}
@keyframes opacity {
    from {
        bottom: 0;
    }
    to {
        opacity: 1;
        bottom: 2rem;
    }
}
// 这是文章内容部分

.precontent {
    padding: 32px;
    width: 100%;
    box-sizing: border-box;
    overflow: auto;
    color: #444;
    :deep(p) {
        text-indent: 2em;
        margin-bottom: 16px;
    }
    :deep(p mark) {
        background-color: #fffe5b99;
        padding: 0 8px;
    }
    :deep(p code) {
        background-color: #a4b1be;
        padding: 1px 8px;
        border-radius: 4px;
    }
    :deep(li) {
        // white-space: pre;
        // text-wrap: wrap;
        margin-left: 20px;
    }
    :deep(h1) {
        margin: 16px 0;
    }
    :deep(h2) {
        margin: 16px 0;
    }
    :deep(h3) {
        margin: 16px 0;
    }
    :deep(h4) {
        margin: 16px 0;
    }
    :deep(ol li) {
        list-style: decimal;
        // margin: 8px 0;
        padding: 2px 0;
    }
    :deep(blockquote) {
        padding: 8px !important;
        p {
            margin-bottom: 0px;
            font-weight: 400;
        }
    }
    :deep(pre code) {
        margin-bottom: 16px;
    }
    :deep(pre code::-webkit-scrollbar) {
        display: block !important;
    }
    :deep(pre code.hljs) {
        font-size: 0.875rem;
        border-radius: 8px;
        word-wrap: normal;
        hyphens: none;
        line-height: 1.5;
        tab-size: 4;
        white-space: pre;
        word-break: normal;
        word-spacing: normal;
        -webkit-hyphens: none;
        font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace!important;
    }
    :deep(pre code ul li) {
        list-style: inside;
        text-indent: 1em;
        background-color: v-bind("cssBackgroundColor");
        padding: 3px 8px;
        white-space: pre;
        &::marker {
            position: absolute;
            left: 0;
        }
    }
    :deep(ul) {
        margin-bottom: 16px;
    }
    :deep(ul li) {
        list-style: disc;
        padding: 2px 0;
    }
    :deep(ul li ul li) {
        list-style: circle;
        line-height: 0;
        margin-left: 30px;
    }
    :deep(img) {
        width: 100%;
    }
    :deep(p:has(img)) {
        text-indent: 0;
    }
    div {
        font-size: 16px;
    }
    :deep(img){
        width: auto;
        height: auto;
        margin: 0 auto;
        border-radius: 8px;
        margin-bottom: 16px;
    }
}
</style>