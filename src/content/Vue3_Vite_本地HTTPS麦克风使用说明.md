# Vue3 + Vite 本地 HTTPS 麦克风使用说明

## 一、适用场景

在 Vue3 + Vite 本地开发环境中，如果页面需要调用浏览器麦克风：

```js
navigator.mediaDevices.getUserMedia({ audio: true })
```

浏览器通常要求页面运行在**安全上下文（Secure Context）**中。

`localhost` 一般可以直接使用麦克风，但如果使用局域网 IP 访问，例如：

```text
http://192.168.1.76:5173
```

浏览器可能会因为当前页面是 HTTP，而限制麦克风权限。

本地开发时，可以给 Vite 开启 HTTPS，并使用 `@vitejs/plugin-basic-ssl` 自动生成开发用自签名证书。

---

## 二、安装依赖

在 Vue3 + Vite 项目根目录执行：

```bash
npm install -D @vitejs/plugin-basic-ssl
```

如果项目还没有安装 Vue 插件：

```bash
npm install -D @vitejs/plugin-vue
```

---

## 三、配置 vite.config.js

修改项目根目录下的：

```text
vite.config.js
```

配置如下：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    vue(),

    // 开发环境自动生成自签名 HTTPS 证书
    basicSsl()
  ],

  server: {
    // 允许局域网其他设备通过本机 IP 访问
    host: '0.0.0.0',

    // Vite 开发端口
    port: 5173,

    // 开启 HTTPS
    https: true
  }
})
```

---

## 四、启动项目

执行：

```bash
npm run dev
```

启动成功后，终端中一般会看到类似：

```text
Local:   https://localhost:5173/
Network: https://192.168.1.76:5173/
```

---

## 五、本机访问

本机可以访问：

```text
https://localhost:5173
```

也可以使用本机局域网 IP：

```text
https://192.168.1.76:5173
```

> `192.168.1.76` 只是示例，请根据实际电脑 IP 修改。

---

## 六、自签名证书提示

`@vitejs/plugin-basic-ssl` 生成的是**开发环境自签名证书**。

第一次访问：

```text
https://192.168.1.76:5173
```

Chrome / Edge 可能会提示：

```text
您的连接不是私密连接
```

这是因为浏览器默认不信任开发环境自签名证书。

本地开发测试时，可以进入高级选项并继续访问。

如果是正式内网系统，不建议长期使用这种开发证书，应使用公司内网 CA 或受客户端信任的正式证书。

---

## 七、Vue3 调用麦克风

页面中可以直接使用：

```js
async function openMicrophone() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    console.log('麦克风获取成功：', stream)
  } catch (error) {
    console.error('麦克风获取失败：', error)
  }
}
```

---

## 八、完整 Vue3 测试示例

```vue
<template>
  <div>
    <button @click="startMicrophone">
      开启麦克风
    </button>

    <button @click="stopMicrophone">
      关闭麦克风
    </button>

    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

const message = ref('未开启麦克风')

let microphoneStream = null

async function startMicrophone() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      message.value = '当前浏览器不支持麦克风 API'
      return
    }

    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    })

    message.value = '麦克风已开启'

    console.log(
      '麦克风设备：',
      microphoneStream.getAudioTracks()
    )
  } catch (error) {
    console.error(error)

    message.value = `麦克风开启失败：${error.name || error.message}`
  }
}

function stopMicrophone() {
  if (!microphoneStream) {
    return
  }

  microphoneStream.getTracks().forEach(track => {
    track.stop()
  })

  microphoneStream = null

  message.value = '麦克风已关闭'
}

onBeforeUnmount(() => {
  stopMicrophone()
})
</script>
```

---

## 九、检查当前页面是否属于安全环境

可以在 Chrome / Edge 控制台执行：

```js
console.log('当前地址：', location.href)

console.log(
  '是否安全环境：',
  window.isSecureContext
)

console.log(
  'mediaDevices：',
  navigator.mediaDevices
)

console.log(
  'getUserMedia：',
  navigator.mediaDevices?.getUserMedia
)
```

正常情况下应看到：

```text
是否安全环境：true
mediaDevices：MediaDevices
getUserMedia：function
```

---

## 十、如果麦克风仍然不能使用

### 1. 检查浏览器网站权限

Chrome / Edge 地址栏左侧：

```text
网站信息
→ 网站权限
→ 麦克风
→ 允许
```

修改后重新刷新页面。

---

### 2. 检查 Windows 麦克风权限

Windows 设置：

```text
设置
→ 隐私和安全性
→ 麦克风
```

确认：

```text
麦克风访问：开启

允许应用访问麦克风：开启

允许桌面应用访问麦克风：开启
```

---

### 3. 检查是否检测到麦克风

浏览器控制台执行：

```js
navigator.mediaDevices
  .enumerateDevices()
  .then(devices => {
    console.table(devices)
  })
```

查看是否存在：

```text
kind: audioinput
```

如果没有 `audioinput`，需要检查电脑麦克风、驱动或 Windows 权限。

---

### 4. 常见报错

#### NotAllowedError

```text
NotAllowedError
```

通常表示：

- 用户拒绝了麦克风权限；
- 浏览器网站权限禁止麦克风；
- Windows 麦克风权限关闭；
- 页面不满足浏览器安全要求。

---

#### NotFoundError

```text
NotFoundError
```

通常表示：

```text
没有检测到可用麦克风
```

---

#### NotReadableError

```text
NotReadableError
```

通常表示：

- 麦克风被其他程序占用；
- 麦克风设备异常；
- 驱动存在问题。

可以尝试关闭：

```text
腾讯会议
微信
QQ
Teams
录音软件
其他浏览器页面
```

然后重新测试。

---

## 十一、局域网其他电脑访问

因为配置了：

```js
host: '0.0.0.0'
```

所以同一局域网中的其他电脑可以访问：

```text
https://你的开发电脑IP:5173
```

例如：

```text
https://192.168.1.76:5173
```

需要注意：

1. 开发电脑防火墙需要允许 `5173` 端口；
2. 两台电脑需要网络互通；
3. 浏览器需要处理/信任自签名证书；
4. 浏览器网站权限中需要允许麦克风。

---

## 十二、推荐的开发配置

最终建议本地开发使用：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    vue(),
    basicSsl()
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    https: true
  }
})
```

然后使用：

```text
https://localhost:5173
```

或者：

```text
https://192.168.1.76:5173
```

访问项目。

这样本地开发时就可以通过 HTTPS 测试：

```text
麦克风
录音
MediaRecorder
getUserMedia
WebRTC
```

等需要安全上下文的浏览器功能。

---

## 十三、开发环境与正式环境的区别

### 开发环境

可以使用：

```text
@vitejs/plugin-basic-ssl
```

快速生成自签名证书。

### 正式内网环境

不建议使用 Vite 开发服务器直接部署。

推荐：

```text
Vue3
↓
npm run build
↓
dist
↓
Nginx
↓
HTTPS
```

正式环境证书建议由：

```text
企业内网 CA
```

签发，并让所有内网客户端电脑信任该 CA。

---

## 总结

本地 Vue3 + Vite 项目需要通过 IP 使用麦克风时，可以使用：

```text
@vitejs/plugin-basic-ssl
```

给 Vite 开启 HTTPS。

核心配置：

```js
basicSsl()

server: {
  host: '0.0.0.0',
  port: 5173,
  https: true
}
```

访问：

```text
https://192.168.1.76:5173
```

之后 Vue3 可以正常调用：

```js
navigator.mediaDevices.getUserMedia({
  audio: true
})
```

用于麦克风采集和录音功能。
