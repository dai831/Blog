<template>
    <div class="login">
        <div class="login_center">
            <div class="login_form">
                我是来闹着玩的
                <el-form :model="formData" ref="refFormData" :rules="formRules">
                    <template v-if="isRegister">
                        <el-form-item id="usernameId" :label="$t('login.username')" prop="username">
                        <el-input @keyup.enter="registerBtn" v-model="formData.username" placeholder="账号"></el-input>
                        </el-form-item>
                        <el-form-item id="passwordId" :label="$t('login.password')" prop="password">
                            <el-input type="password" @keyup.enter="registerBtn" placeholder="密码" v-model="formData.password" show-password>
                            </el-input>
                        </el-form-item>
                        <el-form-item id="emailId" :label="$t('login.email')" prop="email">
                            <el-input type="email" @keyup.enter="registerBtn" v-model="formData.email" placeholder="邮箱"></el-input>
                        </el-form-item>
                    </template>
                    <template v-else>
                        <el-form-item id="usernameId" :label="$t('login.username')" prop="username">
                            <el-input @keyup.enter="loginBtn" v-model="formData.username" placeholder="admin"></el-input>
                        </el-form-item>
                        <el-form-item id="passwordId" :label="$t('login.password')" prop="password">
                            <el-input type="password" @keyup.enter="loginBtn" placeholder="123456" v-model="formData.password" show-password>
                            </el-input>
                        </el-form-item>
                    </template>
                    <!-- <el-form-item :label="$t('language')" prop="language">
                        <el-select v-model="formData.language" @change="changeValue" placeholder="请选择语言">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item> -->
                </el-form>
                <el-button 
                    v-if="!isRegister" 
                    @click="loginBtn"
                    class="login_button flex_center" 
                    text 
                    round 
                    :loading="loading"
                    >{{ $t('login.button') }}</el-button>
                <el-button 
                    v-else
                    @click="registerBtn"
                    class="login_button flex_center" 
                    text
                    round 
                    :loading="loading"
                    >{{ $t('login.register') }}</el-button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref, reactive, nextTick } from 'vue';
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import LAN_OPTIONS from "@/constant/language";
import { registerApi, loginApi } from "@/api/login";
import { ElMessage  } from 'element-plus'
const UseUser = useUserStore();
const router = useRouter();
// 国际化
// 可以拿到我们当前设置的默认语言，切换语言更改locale.value的值即可，
// 但要跟你index.js中message设置的值一致！
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

const options = ref(LAN_OPTIONS);
const formData = reactive({
    username: '',
    password: '',
    email: '',
    // language: '',
})

const isRegister = ref(false);
const loading = ref(false)
const formRules = reactive({
    username: [
        {
            required: true,
            trigger: 'blur',
            message: '请输入账号',
        },
        {
            min: 1,
            max: 100,
            message: '请输入字符 1~100',
            trigger: 'blur',
            informType: 'warning',
        },
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
        },
    ],
    email: [
        {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
        },
    ],
    // language: [
    //     {
    //         required: true,
    //         message: '请选择语言',
    //         trigger: 'change',
    //     }
    // ]
})

onMounted(() => {
    // 语言的的存储和现实
    // if (!localStorage.getItem('language')) {
    //     localStorage.setItem('language', 'zh');
    //     formData.language = localStorage.getItem('language');
    // } else {
    //     formData.language = localStorage.getItem('language');
    //     locale.value = localStorage.getItem('language');
    // }

    // 监听动画结束
    document.getElementById('usernameId').addEventListener('animationend', function() {
        usernameId.classList.remove('shake');
    });
    document.getElementById('passwordId').addEventListener('animationend', function() {
        passwordId.classList.remove('shake');
    });
    if(isRegister.value) {
        document.getElementById('emailId').addEventListener('animationend', function() {
            passwordId.classList.remove('shake');
        });
    }
})

const changeValue = (value) => {
    locale.value = value;
    localStorage.setItem('language', value);
}

const refFormData = ref(null);

const loginBtn = () => {
    refFormData.value.validate((valid, fields) => {
        let passwordId = document.getElementById('passwordId');
        let usernameId = document.getElementById('usernameId');
        if (valid) {
            let params = {
                identifier: formData.username,
                password: formData.password,
            }
            loading.value = true;
            loginApi(params).then( res =>{
                if(res.data) {
                    UseUser.userInfo.token = res.data.jwt;
                    UseUser.userInfo.name = res.data.user.username;
                    loading.value = false;
                    router.replace({ path: '/index'});
                }
                passwordId.classList.remove('shake');
                usernameId.classList.remove('shake');
            }).catch( error =>{
                passwordId.classList.add('shake');
                usernameId.classList.add('shake');
                loading.value = false;
            })
        }
    })
}

const registerBtn = () =>{
    refFormData.value.validate((valid, fields) => {
        if(valid) {
            let params = {
                username: formData.username,
                password: formData.password,
                email: formData.email,
            }
            loading.value = true;
            registerApi(params).then(res =>{
                loading.value = false;
                ElMessage({
                    message: '注册成功',
                    type: 'success',
                    duration: 2000,
                })
            }).catch(() =>{
                loading.value = false;
            })
        }
    })
}

</script>
<style scoped lang='scss'>
/* 引入登录页面样式 */
@import url('../style/login.css');
</style>
