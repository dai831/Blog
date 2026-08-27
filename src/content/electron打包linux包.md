---
解决办法
---

### 1、解决问题清单

- 还要给node_moduels目录下的 .bin文件鉴权

  ```bash
  chmod +x electron-vite
  ```

  

- 将node-sass换成 sass 兼容性更高 

- [x] ```bash
  # 卸载 node-sass 
  npm uninstall node-sass
  # 安装 sass
  npm install sass -D
  ```
  
- [x] ```bash
  sudo apt-get update
  sudo apt-get install -y dpkg fakeroot rpm build-essential
  ```

- 再给安装包赋权（安装 deb（Ubuntu / Debian））

- [x] ```bash
  # 在dist文件下操作 赋权
  chmod +x pipechina.cr.check.dxm_1.0.0_amd64.deb
  
  # 安装
  sudo dpkg -i pipechina.cr.check.dxm_1.0.0_amd64.deb
  ```
  
- 如果想图标正常显示需要配置（图标最好的512*512的,不然显示过小）

  ```yaml
  appId: pipechina.cr.check.dxm
  productName: 云隼
  # protocols:
  #   - name: 云隼协议
  #     schemes:
  #       - xunjian
  directories:
    buildResources: build
  files:
    - '!**/.vscode/*'
    - '!src/*'
    - '!electron.vite.config.{js,ts,mjs,cjs}'
    - '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}'
    - '!{.env,.env.*,.npmrc,pnpm-lock.yaml}'
  
  asar: true            # ✅ 开启 asar 压缩
  asarUnpack:
    - resources/**
  
  npmRebuild: false     # ✅ 不重新构建原生模块
  compression: maximum  # ✅ 提升压缩比
  
  win:
    executableName: 云隼
  nsis:
    oneClick: false
    allowToChangeInstallationDirectory: true
    artifactName: ${name}-${version}-setup.${ext}
    shortcutName: ${productName}
    uninstallDisplayName: ${productName}
    createDesktopShortcut: always
  mac:
    entitlementsInherit: build/entitlements.mac.plist
    extendInfo:
      - NSCameraUsageDescription: Application requests access to the device's camera.
      - NSMicrophoneUsageDescription: Application requests access to the device's microphone.
      - NSDocumentsFolderUsageDescription: Application requests access to the user's Documents folder.
      - NSDownloadsFolderUsageDescription: Application requests access to the user's Downloads folder.
    notarize: false
  dmg:
    artifactName: ${name}-${version}.${ext}
  linux:
    icon: build  # 这是需要配置的
    target:
      - AppImage
      - snap
      - deb
    maintainer: electronjs.org
    category: Utility
  appImage:
    artifactName: ${name}-${version}.${ext}
  
  publish:
    provider: generic
    url: http://192.168.1.15:9000/dzxj/app
  electronDownload:
    mirror: https://npmmirror.com/mirrors/electron/
  ```

- 在linux系统下修改config.json的位置

  ```bash
  # atm 是用户名字
  # pipechina.cr.check.dxm 包名字
  # 修改后如果进程在跑的话，先杀掉进程在执行就好了
  /home/atm/.config/pipechina.cr.check.dxm/config.json 
  ```

  
