---
安装的时候出现的问题(安装在win10,win11目前没有发现这个问题，只有在windows server2019出现过这个问题)
---

### 1、目前已经找到了解决办法（针对于windows server2019）

- 1、主要的点就是在c盘下自动创建`config.json`文件
- 2、清除`config.json`下保存自带的字符，导致不是一个真正 的josn,需要做一个特别的处理

```js
import { app, shell, BrowserWindow, ipcMain, Menu, Notification, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import iconWin from '../../resources/logo.png?asset';
import fs from 'fs';

// 禁用 GPU、禁用跨域
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-web-security');

// 当前窗口引用
let mainWindow = null;

// 禁用菜单栏
Menu.setApplicationMenu(null);

/* ==========================================================
   🧩 用户配置路径（自动随 productName = 巡检工作台）
   ========================================================== */
let userConfigDir = app.getPath('userData');
let userConfigPath = join(userConfigDir, 'config.json'); // 强制创建 config.json 文件

// 默认配置（resources 内）
const defaultConfigPath = is.dev
	? join(__dirname, '../../resources/config.json')
	: join(process.resourcesPath, 'app.asar.unpacked/resources/config.json');

/* ==========================================================
   📁 初始化配置文件（目录 + 默认文件）
   ========================================================== */
function initConfig() {
	try {
		console.log("【调试】userData 路径：", userConfigDir);
		console.log("【调试】config.json 路径：", userConfigPath);  // 打印路径

		// 创建目录
		if (!fs.existsSync(userConfigDir)) {
			fs.mkdirSync(userConfigDir, { recursive: true });
		}

		// 检查 config.json 是否存在
		if (!fs.existsSync(userConfigPath)) {
			// 使用 fs.openSync 创建 config.json 文件
			fs.writeFileSync(userConfigPath, ''); // 如果文件不存在，则创建一个空文件

			// 复制默认配置文件
			fs.copyFileSync(defaultConfigPath, userConfigPath);
			console.log("【调试】初次复制默认配置 →", userConfigPath);
		} else {
			console.log("【调试】配置文件已存在，跳过创建！");
		}
	} catch (err) {
		dialog.showErrorBox('初始化配置失败', err.message);
		console.error("初始化配置失败：", err);
	}
}

/* ==========================================================
   📖 读取配置（增加 JSON 校验 + 错误提示）
   ========================================================== */
function readConfig() {
	try {
		initConfig();
		let raw = fs.readFileSync(userConfigPath, 'utf-8');

		// 去除 BOM（Windows Server 最常见问题）
		raw = raw.replace(/^\uFEFF/, '');

		// 自动去除不可见控制字符（解决 WIN Server 编辑器写入异常）
		raw = raw.replace(/[\u0000-\u0019]+/g, '');

		console.log("【调试】最终读取的 config.json：\n", raw);

		return JSON.parse(raw);

	} catch (err) {
		dialog.showErrorBox('读取配置失败', err.message);
		console.error("读取配置失败：", err);
		return {};
	}
}


/* ==========================================================
   💾 保存配置（带权限检查 + JSON 校验）
   ========================================================== */
function saveConfig(data) {

	// 1. JSON 格式检查
	try {
		JSON.stringify(data);
	} catch (err) {
		dialog.showErrorBox('保存失败', '写入的数据不是有效 JSON 格式！');
		return false;
	}

	try {
		initConfig();
		fs.writeFileSync(userConfigPath, JSON.stringify(data, null, 4), 'utf-8');

		dialog.showMessageBox({
			type: 'info',
			message: `配置保存成功！\n路径：${userConfigPath}`
		});

		return true;

	} catch (err) {
		dialog.showErrorBox(
			'保存配置失败',
			`可能是 Windows 权限问题或文件被占用。\n系统错误：${err.message}`
		);
		console.error("保存配置失败：", err);
		return false;
	}
}

// 当前配置缓存
let config = readConfig();
let apiList = config.apiList || [];

/* ==========================================================
   🔄 监听文件变化（增强可靠性）
   ========================================================== */

if (fs.existsSync(userConfigPath)) {
	fs.watch(userConfigPath, { persistent: true }, (eventType) => {
		if (eventType === 'change') {
			console.log("【调试】检测到配置文件变更，重新加载...");
			setTimeout(() => {
				config = readConfig();
				apiList = config.apiList || [];

				if (mainWindow) {
					mainWindow.webContents.send('config-updated', apiList);
				}
			}, 200);
		}
	});
}

/* ==========================================================
   🪟 创建主窗口
   ========================================================== */
function createWindow() {

	mainWindow = new BrowserWindow({
		icon: iconWin,
		width: 1200,
		height: 800,
		minWidth: 1200,
		minHeight: 800,
		show: false,
		titleBarStyle: 'hidden',
		frame: false,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false,
			nodeIntegration: true,
			webSecurity: true,
			contextIsolation: true
		}
	});

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents.send('set-baseurl', apiList);
	});

	mainWindow.webContents.on('render-process-gone', () => {
		mainWindow.reload();
	});

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: 'deny' };
	});

	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
	}

	mainWindow.webContents.openDevTools();
}

/* ==========================================================
   🔐 单例锁
   ========================================================== */
if (!app.requestSingleInstanceLock()) {
	app.quit();
} else {

	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
			mainWindow.webContents.send('set-baseurl', apiList);
		}
	});

	// ==== 渲染层 IPC ====
	ipcMain.handle('get-api-base-url', () => {
		config = readConfig();
		apiList = config.apiList || [];
		return apiList;
	});

	ipcMain.handle('reload-config', () => {
		config = readConfig();
		apiList = config.apiList || [];
		if (mainWindow) {
			mainWindow.webContents.send('set-baseurl', apiList);
		}
		return { success: true, apiList };
	});

	// 监听保存配置请求
	ipcMain.handle('save-config', (event, data) => {
		const success = saveConfig(data);
		if (success) {
			// 如果保存成功，更新当前配置
			config = data;
			apiList = config.apiList || [];
			mainWindow.webContents.send('config-updated', apiList);
		}
		return { success };
	});

	ipcMain.on('window-control', (_, action) => {
		if (!mainWindow) return;
		if (action === 'minimize') mainWindow.minimize();
		else if (action === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
		else if (action === 'close') mainWindow.close();
	});

	ipcMain.on('show-notification', (_, message) => {
		new Notification({ title: '巡检工作台', body: message }).show();
	});

	app.whenReady().then(() => {
		electronApp.setAppUserModelId('ws.cr.checkwork.dxm');

		app.on('browser-window-created', (_, window) => {
			optimizer.watchWindowShortcuts(window);
		});

		createWindow();

		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});
	});
}

// 当所有窗口关闭时，退出应用（除了 macOS）
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit(); // 在 Windows/Linux 系统中，所有窗口关闭时退出应用
	}
});

```



### 2、针对于win10、win11的文件

```js
import { app, shell, BrowserWindow, ipcMain, Menu, Notification, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import iconWin from '../../resources/logo.png?asset';
import fs from 'fs';

// 禁止GPU加速
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-web-security');

let mainWindow = null; //存储唯一的窗口引用

Menu.setApplicationMenu(null) //禁止打开菜单栏

// 获取配置文件路径
const configPath = is.dev ? join(__dirname, '../../resources/config.json') // 开发环境
						: join(process.resourcesPath, 'app.asar.unpacked/resources/config.json'); // 生产环境

// 读取配置文件的函数
function readConfigFile() {
	try {
		const data = fs.readFileSync(configPath, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		dialog.showErrorBox(
			"读取文件失败",
			JSON.stringify(error, null, 2) // 美化 JSON
		);
		return {};
	}
}

// 初始化配置
let config = readConfigFile();
let apiList = config.apiList || {};

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		icon: iconWin,
		width: 1200,
		height: 800,
		minWidth: 1200,
		minHeight: 800,
		show: false, // 初始隐藏，避免白屏
		titleBarStyle: 'hidden', // 隐藏标题栏
		frame: false, //移除原生边框，方便自定义标题栏
		autoHideMenuBar: true,
		...(process.platform === 'linux' ? { iconWin } : { iconWin }),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false,
			nodeIntegration: true,  // 如果需要 Node.js 集成
			webSecurity: true, // 允许跨域
			contextIsolation: true, //必须配置为true
		}
	});

	// 当窗口准备好才开始展示
	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.on('closed', () => {
		mainWindow = null; // 清除窗口引用
	});

	// 主进程通过 IPC 发送 baseUrl 给渲染进程
	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents.send('set-baseurl', apiList);
	});

	// 检测到白屏了重启
	mainWindow.webContents.on('render-process-gone', (event, details) => {
		mainWindow.reload()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url); // 阻止新窗口打开，改为在默认浏览器中打开链接
		return { action: 'deny' };
	});

	// 根据开发或生产环境加载 URL
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']); // 开发环境下加载开发服务器
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html')); // 生产环境下加载本地文件
	}

	// 打开开发者工具 (DevTools)
	// mainWindow.webContents.openDevTools();
}

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit(); // 如果获取锁失败，说明已有实例在运行，退出应用
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// 当用户尝试启动第二个实例时，将现有的窗口恢复并聚焦
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
			// 向现有窗口发送最新配置
			if (mainWindow.webContents) {
				mainWindow.webContents.send('set-baseurl', apiList);
			}
		}
	});

	// 在主进程中监听渲染进程的同步请求 - 每次请求都重新读取配置
	ipcMain.handle('get-api-base-url', () => {
		// 重新读取配置以获取最新值
		config = readConfigFile();
		apiList = config.apiList || {};
		return apiList;
	});

	// IPC 处理代码
	ipcMain.on('window-control', (event, action) => {
		if (mainWindow) {
			if (action === 'minimize') {
				mainWindow.minimize();
			} else if (action === 'maximize') {
				if (mainWindow.isMaximized()) {
					mainWindow.unmaximize();
				} else {
					mainWindow.maximize();
				}
			} else if (action === 'close') {
				mainWindow.close();
			}
		}
	});

	// 发送消息通知
	ipcMain.on('show-notification', (event, message) => {
		const notification = new Notification({
			title: '巡检工作台',
			body: message
		})
		notification.show()
	})

	// 在应用初始化完成时创建窗口和设置一些特定功能
	app.whenReady().then(() => {
		// 设置 Windows 系统的应用模型 ID
		electronApp.setAppUserModelId('ws.cr.checkwork.dxm');

		app.on('browser-window-created', (_, window) => {
			// 监视快捷键，如 F12 打开开发者工具等
			optimizer.watchWindowShortcuts(window);
		});

		// 创建应用窗口
		createWindow();

		app.on('activate', function () {
			// macOS 特有：在所有窗口关闭后，点击 Dock 图标时重新创建窗口
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});

	});
}

// 当所有窗口关闭时，退出应用（除了 macOS）
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit(); // 在 Windows/Linux 系统中，所有窗口关闭时退出应用
	}
});
```

