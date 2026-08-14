<template>
    <div class="right_contemt flex_column">
        <div class="arvimg">
            <img src="../assets/vite.png" alt="" />
        </div>
        <p class="info1 colorone">Daixaioming</p>
        <p>前端开发</p>
        <p>前端：Vue3+element-plus</p>
        <p>后端：strapi</p>
        <p>工具箱：<a href="https://www.runjs.cool/" target="_blank" rel="noopener noreferrer">各类工具大全</a></p>
        <p>
            <el-icon><Location /></el-icon
            ><span class="colorone"> &nbsp;天府之国 </span>
        </p>
        <textarea 
            class="colorone" 
            v-model="textarea" 
            id="myTextarea" 
            ref="inputRef"
            ></textarea>
        <el-divider>
            <div class="flex_center colorone">
                <el-icon><star-filled /></el-icon> 社交账号
            </div>
        </el-divider>
        <p>
            <a href="https://gitee.com/juan951219520/blog-vue.git" target="_blank" rel="noopener noreferrer">
                <img src="../assets/git.svg" alt="" />
            </a>
        </p>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, watch, nextTick } from "vue";
let timer = ref(null); 
let textarea = ref('');
let inputRef = ref(null);
onMounted(() => {
    init();
});

const init = () => {
    let text = "解决问题的方式，直接面对它！";
    let index = 0;
    let myTextarea = document.getElementById("myTextarea");
    if(myTextarea) {
        function type() {
            if (index < text.length) {
                myTextarea.style.height = 'auto';
                myTextarea.style.height = myTextarea.scrollHeight + 'px';
                textarea.value += text.charAt(index);
                index++;
                timer.value = setTimeout(type, 300); // 设置字符显示的间隔
                myTextarea.focus();
            } else {
                // 动画结束后可以选择光标消失或者其他效果
                timer.value = null;
                myTextarea.blur();
            }
        }
        type();
    }
};

</script>
<style lang="scss" scoped>
.colorone {
    color: #4c9b7d;
}
.right_contemt {
    width: 60%;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #dddd;
    margin-left: 1rem;
    margin-top: 1.5rem;
    color: #837d7d;
    font-size: 0.8rem;
    animation: translateRight 1.2s ease-in-out forwards;
    padding: 3% 2% 2%;
    .arvimg {
        height: 5rem;
        border: 1px solid rgb(17, 134, 138);
        margin-bottom: 0.5rem;
        border-radius: 50%;
        box-shadow: 0 0 15px #3ec079;
        img {
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            transition: all 1.5s;
            &:hover {
                transform: rotate(-360deg);
            }
        }
    }
    p {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .info1 {
        font-weight: bolder;
        font-size: 1rem;
    }
}
textarea{
    width: 100%;
    padding: 10px;
	overflow: hidden; /* 隐藏滚动条 */
	resize: none; /* 禁用手动调整大小 */
	border: none; /* 去除边框 */
	outline: none; /* 去除焦点时的轮廓 */
	box-shadow: none; /* 去除阴影 */
    text-align: center;
}
@keyframes translateRight {
    0% {
        transform: translate(180%, 0);
    }
    55% {
        transform: translate(0, 0);
    }
    60% {
        transform: translate(20%, 0);
    }
    70% {
        transform: translate(0, 0);
    }
    80% {
        transform: translate(10%, 0);
    }
    90% {
        transform: translate(0%, 0);
    }
    95% {
        transform: translate(8%, 0);
    }
    96% {
        transform: translate(0%, 0);
    }
    97% {
        transform: translate(4%, 0);
    }
    98% {
        transform: translate(0%, 0);
    }
    99% {
        transform: translate(1%, 0);
    }
    99.6% {
        transform: translate(0%, 0);
    }
    99% {
        transform: translate(0.5%, 0);
    }
    100% {
        transform: translate(0%, 0);
    }
}

</style>