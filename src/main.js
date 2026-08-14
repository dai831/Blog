import { createApp } from 'vue'
import './style/base.css';
import App from './App.vue';
import i18n from './i18n/index';
import router from './router';
import VueLazyLoad from 'vue3-lazy'
import errorPath from './assets/404.svg';
import loadingPath from './assets/loading.svg';
import highlightDirective from './directives/highlight'; //引入自定义的指令
import wavestDirective from './directives/waves'; //引入自定义的指令

//预览markdown 样式 
import "vite-plugin-doc-preview/style/style.css"

// 引入vue3 icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 前端ui引入
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// 状态管理器
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'; // 将pinia持久化状态到本地存储中
// pina好处就是不用moudules 去区分模块来写


// vue3 引入图片预览组件
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

let options = {
	defaultOptions: {
		zIndex: 3000,
		inline: false, // 启用内联模式
		button: true, // 在查看器右上角显示按钮
		navbar: true, // 指定导航栏的可见性
		title: true, // 指定标题的可见性和内容
		toolbar: true, // 指定工具栏及其按钮的可见性和布局
		tooltip: true, // 放大或缩小时显示带有图像比率（百分比）的工具提示
		movable: true, // 启用以移动图像
		zoomable: true, // 启用以缩放图像
		rotatable: true, // 启用以旋转图像
		scalable: true, // 启用以缩放图像。
		transition: true, // 为某些特殊元素启用CSS3转换
		fullscreen: true, // 启用以在播放时请求全屏
		keyboard: true, // 启用键盘支持。
		// url: 'src', // 定义获取原始图像URL以供查看的位置 这里不用指定 如果指定 那么必须要有src 属性
	},
}

//注册组件
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(ElementPlus);
app.use(pinia);
app.use(i18n);
app.use(router);
app.use(VueViewer, options)

// 指令
// 图片懒加载 
app.use(VueLazyLoad, {
	loading: loadingPath, // 图片加载时默认图片
	error: errorPath // 图片加载失败时默认图片
})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}

app.directive('highlight', highlightDirective);
app.directive('waves', wavestDirective);

// 挂载
app.mount('#app')


