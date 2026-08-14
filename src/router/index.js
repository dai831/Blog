import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from "@/store/user";
const routes = [
	{
		path: '/',
		redirect: '/index', // 这个地方要导航到首页，不然会匹配错误的 FIXME:
	},
	{
		path: '/login',
		name: 'login',
		// route level code-splitting
		// this generates a separate chunk (login.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "login" */ '../views/login.vue'),
		meta: {
			title: '登录',
			isTab: true
		}
	},
	{
		path: '/index',
		name: 'index',
		// route level code-splitting
		// this generates a separate chunk (index.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "index" */ '../views/index.vue'),
		meta: {
			title: '首页',
			key: 1,
			isTab: false
		}
	},
	{
		path: '/index-detail',
		name: 'indexDetail',
		// route level code-splitting
		// this generates a separate chunk (indexDetail.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "indexDetail" */ '../views/indexDetail.vue'),
		meta: {
			title: '文章详情',
			key: 1.5,
			isTab: false
		}
	},
	{
		path: '/library',
		name: 'library',
		// route level code-splitting
		// this generates a separate chunk (library.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "library" */ '../views/library.vue'),
		meta: {
			title: '分类',
			key: 10,
			isTab: false
		}
	},
	{
		path: '/library-detail',
		name: 'libraryDetail',
		// route level code-splitting
		// this generates a separate chunk (libraryDetail.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "libraryDetail" */ '../views/libraryDetail.vue'),
		meta: {
			title: '分类详情',
			key: 10.5,
			isTab: false
		}
	},
	{
		path: '/home',
		name: 'home',
		// route level code-splitting
		// this generates a separate chunk (home.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "home" */ '../views/home.vue'),
		meta: {
			title: '美图',
			key: 2,
			isTab: false
		}
	},
	{
		path: '/home-detail',
		name: 'homeDetail',
		// route level code-splitting
		// this generates a separate chunk (homeDetail.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "homeDetail" */ '../views/homeDetail.vue'),
		meta: {
			title: '美图详情',
			key: 3.5,
			isTab: false
		}
	},
	{
		path: '/my',
		name: 'my',
		// route level code-splitting
		// this generates a separate chunk (my.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		// component: () => import(/* webpackChunkName: "my" */ '../views/css.md'),
		component: () => import(/* webpackChunkName: "my" */ '../views/my.vue'),
		meta: {
			title: '我的',
			key: 3,
			isTab: false
		}
	},
	{
		path: '/404',
		name: '404',
		component: () => import(/* webpackChunkName: "404" */ '../views/404.vue'),
		meta: {
			title: '404',
		}
	},
	{
		path: '/:pathMatch(.*)*', //匹配所有未定义的路径
		name: 'error',
		redirect: '/404'
	}
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

// 全局导航守卫
router.beforeEach(async (to, from, next) => {
	const User = useUserStore();
	const token = User.userInfo.token;
	if(document.title) {
		document.title = `${to.meta.title} | daixm的博客`;
	}
	if (token) {
		try {
			if (to.name === 'login') {
				User.userInfo.routeKey = 1;
				next({ path: '/index' }); // 修改为你需要导航到的页面名称
			} else {
				if(to.meta.key) {
					User.userInfo.routeKey = to.meta.key;
				}
				next();
			}
		} catch (error) {
			if (error.response && error.response.status === 401) {
				User.userInfo.token = '';
				if (to.name !== 'login') {
					next({ path: '/login' });
				} else {
					next();
				}
			} else {
				next();
			}
		}
	} else {
		if (to.name !== 'login') {
			// 如果不是在登录页面就导航到登录页面
			next({ path: '/login' });
		} else {
			next();
		}
	}
});

export default router
