---
如果接入到 vue3 项目中，改良后的webVideoCtrl.js 可以显示和隐藏监控画面 
---



# 接入流程

### 1、官方下载`SDK` 3.3版本的包

- [海康开放平台](https://open.hikvision.com/download/5cda567cf47ae80dd41a54b3?type=10&amp;amp;id=4c945d18fa5f49638ce517ec32e24e24)

### 2、浏览器安装 `HCWebSDKPlugin.exe`

插件包的目录结构：demo ->  `codebase` ->  `HCWebSDKPlugin.exe`

### 3、放入`vue`项目注意事项

- 将demo里面的三个文件放到public目录下，自己可以建一个文件夹放入三个`js`文件

  ```js
  jquery-1.7.1.min.js
  jsVideoPlugin-1.0.0.min.js
  webVideoCtrl.js
  ```

- 在`index.html`首页去引用这个文件 

  ```html
  js文件按照顺序引入
  
  <script src="./webVideoCtrl/jquery-1.7.1.min.js"></script>
  <script src="./webVideoCtrl/webVideoCtrl.js"></script>
  ```

  **重点**：这个地方只需要引用这两个文件，而且需要按照顺序引入，不然会出现🤔的问题

  

### 4、代码实例

此处代码播放模式 ：九宫格模式

- ```vue
  <template>
  	<div id="pluginContainer" class="plugin"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  
  const devices = ref([
  	{ ip: '192.168.0.243', port: '80', username: 'admin', password: 'Hik123456', channel: 1 },
  	{ ip: '192.168.0.241', port: '80', username: 'admin', password: 'Hik123456' }
  ]);
  
  let wndIndex = 0;
  const loggedDeviceIds = ref([]);
  
  const initPlugin = async () => {
  	await WebVideoCtrl.I_InitPlugin({
  		bWndFull: true,
  		iWndowType: 3, // 3x3 共9窗口
  		cbSelWnd: () => { },
  		cbInitPluginComplete: () => {
  			WebVideoCtrl.I_InsertOBJECTPlugin('pluginContainer').then(() => {
  				WebVideoCtrl.I_CheckPluginVersion().then((bFlag) => {
  					if (bFlag) console.log('检测到新版本插件，请升级');
  				});
  			});
  		}
  	});
  
  	setTimeout(loginAllDevices, 1000);
  };
  
  const loginAllDevices = async () => {
  	for (const dev of devices.value) {
  		const identify = `${dev.ip}_${dev.port}`;
  
  		const iRet = WebVideoCtrl.I_Login(dev.ip, 1, dev.port, dev.username, dev.password, {
  			timeout: 3000,
  			success: () => {
  				console.log(`登录成功：${identify}`);
  				loggedDeviceIds.value.push(identify);
  
  				getPortAndThenPlay(identify, dev);
  			},
  			error: (err) => {
  				console.error(`登录失败：${identify}`, err);
  			}
  		});
  
  		if (iRet === -1) {
  			console.log(`设备已登录：${identify}`);
  			loggedDeviceIds.value.push(identify);
  
  			getPortAndThenPlay(identify, dev);
  		}
  	}
  };
  
  const getPortAndThenPlay = async (identify, dev) => {
  	try {
  		const oPort = await window.I_GetDevicePort(identify);
  		console.log(`${identify} 获取端口成功：`, oPort);
  
  		if (dev.channel !== undefined) {
  			// 有传通道号优先播放
  			playChannel(identify, dev.channel, wndIndex++);
  		} else {
  			// 否则尝试自动获取通道并播放
  			getAllChannelTypesAndPlay(identify);
  		}
  	} catch (err) {
  		console.error(`${identify} 获取端口失败`, err);
  	}
  };
  
  const getAllChannelTypesAndPlay = (identify) => {
  	let found = false;
  
  	// 模拟通道
  	WebVideoCtrl.I_GetAnalogChannelInfo(identify, {
  		success(xmlDoc) {
  			const channels = xmlDoc.getElementsByTagName('VideoInputChannel');
  			for (let i = 0; i < channels.length; i++) {
  				const id = channels[i].getElementsByTagName('id')[0].textContent;
  				if (!found) {
  					found = true;
  					playChannel(identify, parseInt(id), wndIndex++);
  					break;
  				}
  			}
  			console.log(`${identify} 获取模拟通道成功`);
  		},
  		error(err) {
  			console.warn(`${identify} 获取模拟通道失败`, err);
  		}
  	});
  
  	// 数字通道
  	WebVideoCtrl.I_GetDigitalChannelInfo(identify, {
  		success(xmlDoc) {
  			const channels = xmlDoc.getElementsByTagName('InputProxyChannelStatus');
  			for (let i = 0; i < channels.length; i++) {
  				const online = channels[i].getElementsByTagName('online')[0].textContent;
  				if (online === 'true') {
  					const id = channels[i].getElementsByTagName('id')[0].textContent;
  					if (!found) {
  						found = true;
  						playChannel(identify, parseInt(id), wndIndex++);
  						break;
  					}
  				}
  			}
  			console.log(`${identify} 获取数字通道成功`);
  		},
  		error(err) {
  			console.warn(`${identify} 获取数字通道失败`, err);
  		}
  	});
  
  	// 零通道
  	WebVideoCtrl.I_GetZeroChannelInfo(identify, {
  		success(xmlDoc) {
  			const channels = xmlDoc.getElementsByTagName('ZeroVideoChannel');
  			for (let i = 0; i < channels.length; i++) {
  				const enabled = channels[i].getElementsByTagName('enabled')[0].textContent;
  				if (enabled === 'true') {
  					const id = channels[i].getElementsByTagName('id')[0].textContent;
  					if (!found) {
  						found = true;
  						playChannel(identify, parseInt(id), wndIndex++, true);
  						break;
  					}
  				}
  			}
  			console.log(`${identify} 获取零通道成功`);
  		},
  		error(err) {
  			console.warn(`${identify} 获取零通道失败`, err);
  		}
  	});
  };
  
  const playChannel = (identify, channelID, iWndIndex, bZeroChannel = false) => {
  	if (iWndIndex >= 9) return;
  
  	WebVideoCtrl.I_StartRealPlay(identify, {
  		iChannelID: channelID,
  		iWndIndex,
  		iStreamType: 1,
  		bZeroChannel,
  		success: () => {
  			console.log(`窗口 ${iWndIndex} 播放 ${identify} 通道 ${channelID} 成功`);
  		},
  		error: () => {
  			console.warn(`窗口 ${iWndIndex} 播放 ${identify} 通道 ${channelID} 失败`);
  		}
  	});
  };
  
  const logoutAndDestroy = () => {
  	for (const identify of loggedDeviceIds.value) {
  		WebVideoCtrl.I_Logout(identify);
  	}
  	WebVideoCtrl.I_DestroyPlugin();
  };
  
  onMounted(() => {
  	setTimeout(initPlugin, 1000);
  });
  
  onBeforeUnmount(() => {
  	logoutAndDestroy();
  });
  </script>
  
  <style scoped>
  .plugin {
  	width: 1000px;
  	height: 700px;
  }
  </style>
  ```



### 5、如果需要在一个页面多处播放视频

**注意**⚠️：需要传入多个 **id**, 并且将 `iWndowType`改为 **1**。



### 6、出现的问题解决清单

出现下面的情况，插件初始化失败，出现了异步情况。

> ```js
> TypeError: Cannot read properties of null (reading 'JS_SubmitHttpRequest')
> ```



### 7、显示和隐藏画面

```js
如何做到的 改源码 搜索 m_pluginOBJECT = new JSVideoPlugin(oParam)
在后面加一行，相当于把	m_pluginOBJECT 抛出去（setShow可以自定义）

this.setShow = m_pluginOBJECT
// 显示
WebVideoCtrl.setShow.JS_ShowWnd();

// 隐藏
WebVideoCtrl.setShow.JS_HideWnd();
```

