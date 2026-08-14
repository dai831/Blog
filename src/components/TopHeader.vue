<template>
    <el-row class="top_header">
        <el-col :xs="0" :sm="4" :md="4" :lg="4" :xl="4">
            <div class="top_left flex_center">
                <img src="../assets/vite.png" alt="">
                <span>敢敢&运运</span>
            </div>
        </el-col>
        <el-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
            <div class="top_right flex_center">
                <div class="text_overflow"
                    v-for="(item ,index) in topName" 
                    @click="handleTopName(item.path, item.nameKey)"
                    :class="(index + 1) == User.userInfo.routeKey ? 'slecName' : ''"
                    :key="item + '_home'">
                    {{ item.name }}
                </div>
            </div>
        </el-col>
        <el-col :xs="0" :sm="4" :md="4" :lg="4" :xl="4">
            <div class="flex_end text_overflow admin">
                <el-dropdown 
                    @command="handleCommand" 
                    trigger="click"
                    >
                    <div class="user_img flex text_overflow" aria-expanded="false">
                        <img src="../assets/user.png" alt="用户名" />
                        <span>{{ User.userInfo.name }}</span>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="out">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </el-col>
    </el-row>
</template>
<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { useUserStore } from "@/store/user";
import { useRoute, useRouter } from "vue-router"; 

const route = useRoute();
const router = useRouter();
const User = useUserStore();
const topName = ref([
    { nameKey: 1, name: '首页', path: '/index'},
    // { nameKey: 2, name: '分类', path: '/library'},
    { nameKey: 2, name: '美图', path: '/home'},
    { nameKey: 3, name: '我的', path: '/my'},
]);

const handleTopName = (path, key) =>{
    User.userInfo.routeKey = key;
    router.replace({ path: path});
}

const handleCommand = async ( val) =>{
    if(val) {
        User.userInfo.routeKey = null;
        User.userInfo.token = '';
        router.replace({ path: '/login'});
    }
}

</script>
<style scoped lang='scss'>
.top_header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 6vh;
    background-image: linear-gradient(to right, #eea2a2 0%, #bbc1bf 19%, #57c6e1 42%, #b49fda 79%, #7ac5d8 100%);
    position: sticky;
    top: 0%;
    padding:0 2%;
    animation: opacity 3s linear;
    z-index: 100;
    color: #fff;
}
.top_left {
    height: 6vh;
    font-family: "KAITI";
    font-size: 18px;
    font-weight: bolder;
    text-align: center;
    min-width: 6rem;    
    box-sizing: border-box;
    border: 3px solid transparent;
    transition: all 0.5s;
    img{
        height: 3vh;
        margin-right: 0.5rem;
    }
    &:hover{
        color: rgb(31, 140, 148);
        font-size: 20px;
    }
}
.top_right{
    & > div{
        margin: 0 0 0 10px;
        padding: 0 10px;
        height: 3vh;
        line-height: 3vh;
        border-radius: 32px;
        font-family: 'KaiTi';
        font-weight: bolder;
        cursor: pointer;
        &:hover{
            color: rgb(31, 140, 148);
        }
    }
    .slecName{
        background-image: linear-gradient(45deg, #90cf5b, #00afee);
        color: #38800f;
    }
}
.user_img{
    color: #fff;
    font-size: 1rem;
    & > img {
        height: 4vh;
        margin-right: 0.325rem;
        object-fit: cover;
    }
}

.admin{
    cursor: pointer;
}

@keyframes opacity {
    from{
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
