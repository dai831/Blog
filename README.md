# Daixiaoming Markdown Blog

本版本保留原来的 Daixiaoming 首页视觉风格，并接入本地 Markdown 文档能力。

## 首页

- 保留原版 `HELLO WORLD`、Daixiaoming、大图推荐卡片、分类、侧栏个人信息、深浅色切换等视觉风格。
- 首页文章不再写死，优先读取 `src/content/*.md`。
- 点击首页文章直接进入 Markdown 文档详情。

## Markdown 文档

- 代码内置文档：放在 `src/content/`，所有访问者可见。
- 浏览器上传文档：保存在当前浏览器 IndexedDB，不上传服务器。
- 内置文档优先显示，本地上传文档排在后面。
- 后台路由：`#/admin/articles`。
- Markdown 编辑器：`#/admin/editor`。

## 常用链接 / 账号库

- 路由：`#/admin/vault`。
- 支持网址、账号、密码、备注。
- 支持一键复制账号、密码、完整信息。
- 数据仅保存在当前浏览器，并使用浏览器 Web Crypto 加密。
- 不会把真实账号密码写入项目源码。

## 手机端

- 首页使用原版响应式布局。
- 导航、分类、搜索、管理按钮扩大触控区域。
- Markdown 编辑器手机端使用“编辑 / 预览”切换。
- 管理列表、账号库使用适合手机操作的卡片布局。

## 启动

```bash
npm install
npm run dev
```

## 打包

```bash
npm run build
```

生成的 `dist/` 可以部署到静态托管服务。
