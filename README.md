# Couple Cool Blog

纯静态 Vue3 + Vite 双人情侣博客，无后端、无数据库，适合直接部署到 Vercel。

## 运行
```bash
npm install
npm run dev
```

## 打包
```bash
npm run build
```

## 改内容
文字、名字、时间线、纪念日、照片配置全部集中在：`src/data/site.js`

照片放到：`public/memories/`

例如：`public/memories/us-01.jpg`，然后在 `site.js` 中写：`/memories/us-01.jpg`

## Vercel 配置
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
