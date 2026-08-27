---
1、我安装软件一般在 /usr/local 这个目录下面，所以 先使用 `cd /usr/local` 去执行下面的命令。
---

# Linux安装node环境

### 安装步骤

##### 1、安装node包

下载node的包，要注意的是，需要把 `16.4.0` -----> 换成比较新的包，我目前使用的是最新版本的，但是后面可能就不是最新版本了。

```shell
wget https://nodejs.org/dist/v16.4.0/node-v16.4.0-linux-x64.tar.xz
```

##### 2、解压 `.xz`的包

把`.xz`的包 -----> 解压成 `.tar`的包

```shell
xz -d node-v16.4.0-linux-x64.tar.xz
```

##### 3、把`.tar`的包 -----> 解压成 文件夹

```shell
tar xf node-v16.4.0-linux-x64.tar
```

##### 4、移动目录到`usr/local` 目录下面

 可选，安装自己安装包的习惯，这里这么做也为了下面的软连接做准备

```shell
cp -r node-v16.4.0-linux-x64 /usr/local/
```

##### 5、配置软连接

1. **配置`node`的软连接**

   ```shell
   ln -s /usr/local/node-v16.4.0-linux-x64/bin/node /usr/local/bin/node
   ```

   

2. **配置`npm`的软连接**

   ```shell
   ln -s /usr/local/node-v16.4.0-linux-x64/bin/npm /usr/local/bin/npm
   ```

   

3. **配置`npx`的软连接**

   ```shell
   ln -s /usr/local/node-v16.4.0-linux-x64/bin/npx /usr/local/bin/npx
   ```

   

##### 6、接下来你使用 `node-v, npm -v`结果 

如果出现版本号，说明安装成功

##### 7、安装 `pm2` 来守护进程

全局安装 `pm2`, 安装好了后， 配置软连接来在命令行中生效

```shell
npm install -g pm2
```

##### 8、配置`pm2`的软连接

```shell
ln -s /usr/local/node-v16.4.0-linux-x64/bin/pm2 /usr/local/bin/pm2
```

##### 9、接下来你使用 `pm2-v`结果 

如果出现版本号，说明安装成功

##### 10、执行命令

- `pm2 list` ：查看进程
- `pm2 start index.js` ：启动某个node服务
- `pm2 stop/reload/restart/delete al`l ：停止/重载/重启/删除 所有进程
- `pm2 stop/reload/restart/delete 0` ：停止/重载/重启/删除` pm2`进程列表中进程为0的进程
- `pm2 logs [--raw]` ：显示所有进程的日志
- `pm2 flush` ：清空所有日志文件



