# Two of Us · Vue3 + Vite 静态情侣博客

## 启动
```bash
npm install
npm run dev
```

默认地址：`http://localhost:5173/index`

## 打包
```bash
npm run build
```
生成的 `dist` 目录可直接部署到 Vercel / Netlify / Nginx。

## 修改内容
主要修改：`src/data/site.js`

- `couple`：姓名、开始日期、纪念日、城市、首页介绍
- `timeline`：恋爱时间线
- `moments`：日常卡片
- `gallery`：照片墙文案
- `letters`：写给对方的话
- `wishlist`：愿望清单
- `playlist`：歌单
- `quotes`：随机文案

## 换成真实照片
当前照片区使用 CSS 唯美渐变占位，所以项目开箱即可运行。
后续可将图片放到 `public/images/`，再把 `gallery` 扩展为 `image: '/images/xxx.jpg'` 并在 `App.vue` 中替换对应的 `.gallery-visual` 即可。

## 风格
浅奶油白 / 樱花粉 / 雾紫 / 浅蓝 / 薄荷绿，不使用大面积深色。

## Vercel
项目已附带 `vercel.json`，访问 `/index` 会重写到 SPA 首页。
