# Daixiaoming · 生活与代码

基于 Vue 3 与 Vite 的浅色多页个人博客，包含技术文章、家庭纪念日期、图片欣赏、个人介绍和小游戏。手机与电脑都可以操作。

## 页面与交互

- 暖白底色，搭配珊瑚粉、淡紫、天蓝和浅绿的拼贴式视觉。
- 滚动入场、卡片悬浮、图片缩放、阅读进度与平滑锚点导航；支持减少动态效果的系统偏好。
- 技术文章分类、全文关键词搜索（Ctrl / ⌘ + K）、加载更多与独立阅读页。
- 图片墙沿用 `src/services/wallpaper.js` 内原项目的壁纸接口，支持图片放大和作者展示。
- 响应式手机导航与键盘可操作的搜索、图片弹窗。
- 独立页面：`#/` 首页、`#/story` 家庭故事、`#/journal` 技术手记、`#/gallery` 图片欣赏、`#/about` 个人介绍、`#/playground` 趣味实验室。
- 趣味实验室包含记忆翻牌、彩色贪吃蛇、反应力测试和灵感签。贪吃蛇支持方向键、WASD 和手机触屏方向按钮，切换游戏、隐藏页面或打开搜索会自动暂停。
- 游戏最佳成绩仅保存在当前设备浏览器中，无需登录。
- 旧版闲置页面、旧路由与对应的遗留模块已清理。

## 纪念日期

日期配置位于 `src/views/HomeView.vue`：

- 结婚日期：2022 年 9 月 30 日，每年 9 月 30 日为纪念日。
- 宝宝出生：2024 年 9 月 26 日，每年 9 月 26 日为生日。
- 页面按访问者设备的日历日期自动显示周年、年龄、累计天数和下一次纪念日倒计时，每分钟刷新。
- 日期计算集中在 `src/utils/milestones.js`，按日历日计算，避免夏令时带来的小时偏差。

## 内容管理

- 内置文章来自 `src/content/*.md`，所有访问者可见。
- `#/admin/articles`：文档管理。
- `#/admin/editor`：Markdown 编辑器。
- 浏览器内上传与编辑的文档保存在当前浏览器 IndexedDB。
- `#/admin/vault`：使用浏览器 Web Crypto 加密的本地链接与账号库。

## 启动与打包

```bash
npm install
npm run dev
npm run build
```

`dist/` 为静态部署产物。文章阅读页和管理页按需加载，代码高亮仅加载博客使用的语言。

## 设计参考

- [Kaven Kim：杂志式个人博客的设计思路](https://kavenkim.com/blog/building-this-site)
- [Jono Yeong：通过首页大标题表达个人特色](https://buttondown.com/jonoyeong/archive/behind-the-scenes-personal-site-redesign-mockups/)

参考了内容层级与排版思路，页面视觉和组件为本项目重新实现。
