import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'highlight.js/styles/github-dark.css'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ArticleView from './views/ArticleView.vue'
import AdminArticlesView from './views/AdminArticlesView.vue'
import EditorView from './views/EditorView.vue'
import VaultView from './views/VaultView.vue'
import NotFoundView from './views/NotFoundView.vue'
import './styles.css'
import './tech-blog.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '文章' } },
    { path: '/article/:id', name: 'article', component: ArticleView, meta: { title: '文章详情' } },
    { path: '/admin/articles', name: 'admin-articles', component: AdminArticlesView, meta: { title: '文档管理' } },
    { path: '/admin/editor/:id?', name: 'admin-editor', component: EditorView, meta: { title: 'Markdown 编辑器' } },
    { path: '/admin/vault', name: 'admin-vault', component: VaultView, meta: { title: '常用链接与账号' } },
    { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: '页面不存在' } }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '博客'} | Daixiaoming 技术博客`
})

createApp(App).use(router).use(ElementPlus).mount('#app')
