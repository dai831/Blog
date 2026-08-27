# QGIS 安装 Python 报错处理说明

## 1. 问题现象

安装或启动 QGIS 时，出现类似错误：

```text
Couldn't load SIP module.
Python support will be disabled.

ModuleNotFoundError: No module named 'qgis'
```

或者 Python 路径显示为乱码，例如：

```text
D:/��Ƭ��������/apps/qgis/python
```

## 2. 问题原因

主要原因是：

**QGIS 安装路径中包含中文字符。**

例如安装在：

```text
D:\瓦片数据下载\QGIS
```

部分 QGIS、Python、SIP 等组件对中文路径兼容不好，可能导致 Python 模块无法正确加载。

## 3. 解决方法

### 第一步：卸载原来的 QGIS

先卸载当前安装的 QGIS。

### 第二步：重新安装到纯英文目录

推荐安装到：

```text
D:\QGIS
```

或者：

```text
D:\Software\QGIS
```

也可以使用：

```text
C:\QGIS
```

**不要使用：**

```text
D:\瓦片数据下载\QGIS
D:\软件\QGIS
D:\工具\地图软件\QGIS
```

目录中尽量只使用：

```text
英文字母 + 数字
```

## 4. 安装完成后检查

重新启动 QGIS。

如果不再出现：

```text
Couldn't load SIP module
```

以及：

```text
Python support will be disabled
```

说明问题已经解决。

还可以在 QGIS 中打开：

```text
插件 → Python 控制台
```

如果 Python 控制台能够正常打开，说明 QGIS 的 Python 环境已经恢复正常。

## 5. 推荐安装路径

最简单推荐：

```text
D:\QGIS
```

如果后续还需要保存瓦片数据，可以单独建立：

```text
D:\GIS
├── QGIS
├── Tiles
├── Data
└── Projects
```

建议 **QGIS 软件本身安装目录始终使用英文路径**，可以减少 Python、插件、GDAL 等组件出现路径兼容问题。