import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'element-plus/dist/index.css'
import 'highlight.js/styles/github.css'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import './styles.css'
import './tech-blog.css'
import './extra-pages.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
    { path: '/story', name: 'story', component: HomeView, props: { page: 'story' }, meta: { title: '我们的故事' } },
    { path: '/journal', name: 'journal', component: HomeView, props: { page: 'journal' }, meta: { title: '技术手记' } },
    { path: '/gallery', name: 'gallery', component: HomeView, props: { page: 'gallery' }, meta: { title: '图片欣赏' } },
    { path: '/about', name: 'about', component: HomeView, props: { page: 'about' }, meta: { title: '关于我' } },
    { path: '/playground', name: 'playground', component: () => import('./views/PlaygroundView.vue'), meta: { title: '趣味实验室' } },
    { path: '/article/:id', name: 'article', component: () => import('./views/ArticleView.vue'), meta: { title: '文章详情' } },
    { path: '/admin/articles', name: 'admin-articles', component: () => import('./views/AdminArticlesView.vue'), meta: { title: '文档管理' } },
    { path: '/admin/editor/:id?', name: 'admin-editor', component: () => import('./views/EditorView.vue'), meta: { title: 'Markdown 编辑器' } },
    { path: '/admin/vault', name: 'admin-vault', component: () => import('./views/VaultView.vue'), meta: { title: '常用链接与账号' } },
    { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue'), meta: { title: '页面不存在' } }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '博客'} | Daixiaoming · 生活与代码`
})

createApp(App).use(router).mount('#app')
