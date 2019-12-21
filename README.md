1.目录结构
configs：配置表
domain：业务逻辑
libs：库
test：测试
tools：工具脚本

2.启动
npm install
npm run server
npm run client

3.转换word.txt
npm run tool

4.npm包引用,
"ws": "^7.2.1"：WS库；
"readline": "^1.3.0"：转换word.txt为JSON文件。

5.说明
 i.通用频道框架，使用Channel来区分各个频道聊天；
 ii.NET层可使用TCP、UDP、WS，实现相应Net组件即可；
 iii.使用中间件Receptor来实现协议切换，可支持JSON,protobuf,自定义协议等，实现相应Receptor即可；
 iv.可分布式部署实现不同地图聊天服务；
 v.优化内容：
	a.消息全内存，可使用redis来实现落地；
	b.net目录下Scoket、Receptor更上级抽象；