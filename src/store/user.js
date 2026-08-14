import { defineStore } from "pinia"; // 必须引入才能进行操作
import { reactive, ref } from "vue"

export const useUserStore = defineStore('user', () =>{
    const userInfo = reactive({
        name: '',
        token: '',
        routeKey: 1
    })
    return {
        userInfo,  //用户的基本信息
    }
}, {
    persist: true
})
