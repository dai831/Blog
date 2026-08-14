import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import MarkedPreview from 'vite-plugin-doc-preview'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			include: [/.vue$/, /.md$/],
	 	}),
	  	MarkedPreview()
	],
	base: './', //打包后静态资源读取
	resolve: {
		//别名配置，引用src路径下的东西可以通过@如：import Layout from '@/layout/index.vue'
		alias: [
			{
				find: '@',
				replacement: resolve(__dirname, 'src'),
			},
		],
	},
	//服务器配置
	server: {
		//配置端口
		//host: '0.0.0.0', //本机地址
		//port:5000,  //通过5000端口号访问

		//配置反向代理
		proxy: {
			//凡是以 /apk 地址开头的请求, 都要做代理操作
			'/apk': {
				//目的地址 => 代理服务器,需要向该地址发起请求
				target: 'http://192.168.0.89:1337/api',
				//是否跨域
				changeOrigin: true,
				//是否重写  将路径中的 /api 重写为''  ,重写的是自己的路径地址
				//向存储数据的服务器发送请求的地址是  target中的地址 + 自己写的路径
				//如果不重写, 则请求地址中会有两个 /api 字符, 这样请求的地址就错了 
				rewrite: (path) => {
					return path.replace(/^\/apk/, '')
				}
			}
		}
	}
});

