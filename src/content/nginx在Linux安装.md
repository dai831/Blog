```
cd /usr/local
mkdir nginx-images
// wget https://nginx.org/download/nginx-1.18.0.tar.gz  #下载(有了就不用下载)

tar -zxvf nginx-1.18.0.tar.gz   #解压

cd nginx-1.9.9

//编译
./configure --prefix=/usr/local/nginx
 //安装
make && make install

//更改安装路径
cd nginx-1.18.0
在运行 ./configure 之前，使用 --prefix 选项指定安装路径。例如，如果你想将 Nginx 安装到 /opt/nginx，可以执行以下命令：
./configure --prefix=/usr/local/nginx-images
./configure --prefix=/data/images-nginx
./configure --prefix=/usr/local/nginx-area
./configure --prefix=/usr/local/map-nginx/map-nginx-2


./configure --prefix=/usr/local/main-nginx/daping
./configure --prefix=/usr/local/main-nginx/houtai
make
sudo make install
//验证安装是否成功
./nginx -v

//开放端口
sudo firewall-cmd --add-port=9980/tcp --permanent
//重启防火墙
sudo firewall-cmd --reload
//创建文件名字
mkdir images

//改配置文件
server {
    # 其他 server 配置...

    location /images/ {
    add_header 'Access-Control-Allow-Origin' '*';
    root /usr/local/nginx-images/html/;
    autoindex on;
}

    # 其他 location 配置...
}



	client_max_body_size 50M;
	
		location / {
            root   html;
            index  index.html index.htm;
	    	try_files $uri $uri/ /index.html;
        	}
	 	location /api {
   				rewrite ^/api/(.*)$ /$1 break;
        		proxy_pass http://localhost:80;  
        		proxy_set_header Host $host;
        		proxy_set_header X-Real-IP $remote_addr;
        		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    		}




cat /etc/nginx/nginx.conf | grep user
sudo chown -R nginx:nginx /usr/local/nginx-images/html/images/
sudo chmod -R 755 /usr/local/nginx-images/html/images/
请替换为适合你系统的用户和组名称。


//给文件夹赋权限
sudo chown -R  nobody:nobody /usr/local/map-public/
sudo chmod -R 755 /usr/local/map-public/

sudo chown -R  nobody:nobody /usr/local/nginx-images/html/images/
sudo chmod -R 755 /usr/local/nginx-images/html/images/
//重启nginx
./nginx -s reload
//启动
java -jar SpringBootTest-0.0.1-SNAPSHOT.jar 
//后台启动
nohup java -jar area_service-1.0-SNAPSHOT.jar > springboot.log 2>&1 &

nohup java -jar images-service-1.0-SNAPSHOT.jar > springboot.log 2>&1 &
//脚本启动
//创建脚本
vim start.sh
//脚本内容
# 关闭程序
# fileName为jar包的名称
fileName=images-service-1.0-SNAPSHOT.jar
pid=$(ps -ef | grep $fileName| grep -v "grep" | awk '{print $2}')
kill -9 $pid


fileName=blade-api.jar
pid=$(ps -ef | grep $fileName| grep -v "grep" | awk '{print $2}')
kill -9 $pid
nohup java -jar $fileName > springboot.log 2>&1 &


fileName=area_service-1.0-SNAPSHOT.jar
pid=$(ps -ef | grep $fileName| grep -v "grep" | awk '{print $2}')
kill -9 $pid
# 启动项目
nohup java -jar $fileName > springboot.log 2>&1 &
//启动脚本
sh start.sh



//java 自启
cd /usr/local/images-service
nohup java -jar images-service-1.0-SNAPSHOT.jar > springboot.log 2>&1 &
//设置开机自启脚本
cd/usr/local/nginx-images/sbin
./nginx
//创建开机自启文件
my_services.service
//
cd /etc/systemd/system/
//创建开机自启文件内容
[Unit]
Description=My Services (NGINX and Java App)

[Service]
ExecStart=/usr/local/start/start_my_services.sh
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=JAVA_HOME=/usr/java/jdk1.8.0-x64 

[Install]
WantedBy=multi-user.target

sudo systemctl enable my_services.service
sudo systemctl start my_services.service

sudo systemctl status my_services.service
















//配置作业区前端
//nginx 配置文件
server {
    listen 1180;
    server_name your_domain_or_ip;

    location / {
        root /html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
   		rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://localhost:1111;  
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
//开放端口
sudo firewall-cmd --add-port=1180/tcp --permanent
//重启防火墙
sudo firewall-cmd --reload



```

 

```shell
blade-device:
    image: "${REGISTER}/blade-device:${TAG}"
    environment:
      - TZ=Asia/Shanghai
    privileged: true
    restart: always
    logging:
      driver: none
    networks:
      - blade_net

```

