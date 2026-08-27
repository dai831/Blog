# Electron 多架构打包策略（Windows / Linux）

本文整理两种常见方案：

- 自动识别架构（一个安装包）
- 指定架构打包（多个安装包）

并给出推荐实践。

---

# 一、自动识别架构（单安装包）

## 适用场景
- 内部使用
- 不想区分下载
- 简化用户操作

---

## 配置方式

### electron-builder.yml

```yaml
win:
  target:
    - target: nsis
      arch:
        - x64
        - ia32
⚠️ 注意：Windows 下通常只建议合并 x64 + ia32
arm64 一般不会合并

package.json
"scripts": {
  "build:win": "npm run build && electron-builder --win"
}
输出结果
xxx-setup.exe
自动识别系统架构

自动安装对应版本

优缺点
优点
用户体验好

下载简单（一个包）

缺点
包体积大（≈ 2~3 倍）

构建时间长

arm64 支持不稳定

二、自定义架构打包（推荐）
适用场景
正式发布

多平台分发

CI/CD 构建

配置方式
electron-builder.yml
win:
  target:
    - target: nsis
❗ 不写 arch

package.json
"scripts": {
  "build": "electron-vite build",

  "build:win:x64": "npm run build && electron-builder --win --x64",
  "build:win:ia32": "npm run build && electron-builder --win --ia32",
  "build:win:arm64": "npm run build && electron-builder --win --arm64",

  "build:win:all": "npm run build:win:x64 && npm run build:win:ia32 && npm run build:win:arm64"
}
输出结果
xxx-x64.exe
xxx-ia32.exe
xxx-arm64.exe
优缺点
优点
每个包更小

更稳定

易于分发

可单独更新

缺点
需要区分用户架构

下载入口稍复杂

三、Linux 打包策略
推荐方式（与 Windows 一致）
electron-builder.yml
linux:
  target:
    - deb
    - AppImage
package.json
"scripts": {
  "build:linux:x64": "npm run build && electron-builder --linux --x64",
  "build:linux:arm64": "npm run build && electron-builder --linux --arm64"
}
输出
xxx_amd64.deb
xxx_arm64.deb

xxx.AppImage
xxx-arm64.AppImage
四、关键原则（必须遵守）
❗ 不要混用架构定义
错误写法
# yml
arch:
  - x64
# 命令
--x64
👉 会冲突

正确原则
方式	控制位置
自动识别	yml
指定架构	scripts
五、推荐方案（总结）
✔ 开发 / 内部使用
👉 自动识别（单安装包）

✔ 正式发布（推荐）
👉 多架构分包

x64 + ia32（必须）
arm64（可选）
六、实际建议
Windows
必选：x64

可选：ia32

不建议强推：arm64

Linux
必选：x64

推荐：arm64

七、一句话总结
自动识别：方便，但重

分架构打包：专业、稳定、可控（推荐）