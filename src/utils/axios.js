import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router/index'; //  方法一
import { useUserStore } from "@/store/user";

//跨域请求，允许保存cookie
axios.defaults.withCredentials = false;

// 设置请求超时
axios.defaults.timeout = 15000;

// 设置request拦截
axios.interceptors.request.use(config => {
    // 在拦截器内使用 Pinia store 否则会报错
    const UseUser = useUserStore();
    // 判断是否需要token //在接口的地方去配置
    if(config.istoken) {
        // 请求头配置
        const token = UseUser.userInfo.token; // 假设 token 存储在 localStorage
        if(token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    } else {
        // 这是不需要 token
    }
    return config
}, error => {
    console.log('请求出问题了');
    Promise.reject(error);
})

// 设置response拦截 
axios.interceptors.response.use(res => {
    if (res.status == 200) {
        return res
    } else {
        ElMessage({
            message: '响应失败',
            type: 'error',
            duration: 3000,
        })
        return Promise.reject(new Error(res));
    }
}, error => {
    if (error?.response?.status == 401) {
        router.push({ path: '/login' });
        ElMessage({ message: '请求失败', type: 'warning', duration: 2000 });
    } else {
        ElMessage({ message: `请求失败 ${error.message}`, type: 'warning', duration: 2000 });
    }
    return Promise.reject(new Error(error));
})

export default axios;