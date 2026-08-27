# 1.`npm`报证书过期

## 解决办法

> ```shell
> // 方法一：
> // 清除缓存
> npm cache clean --force
> //取消ssl验证
> npm config set strict-ssl false
> //然后再 npm install 就可以了
> 
> // 方法二
> 或者更换npm镜像
> npm config set registry https://registry.npmmirror.com
> //然后 `npm install` 就可以了，如果此时还不行的话 再次执行`方法一`
> 
> ```




# 2. `npm ERR!codeERESOLVE` 

## 代码示例

> ```shell
> `npm install --legacy-peer-deps` 执行此命令 下载插
> ```





# 3.出现 `proxy`问题

## 解决办法

> ```shell
> 'proxy' config is set properly.  See: 'npm help config'
> 
> 下载出现这个错误，在代码里删除package-lock.json,重新执行 npm i
> ```
>

