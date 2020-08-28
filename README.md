# 文档说明

## 简介

主要实现一个聊天功能服务

## 目录介绍

1. chat 主要存放聊天服务的实现
    * service/service.go 服务的实现
    * service/player.go 玩家的实现
    * service/manager.go 玩家管理的实现
    * service/msgcache.go 消息缓存的实现
    * service/statistic.go 流行消息统计实现
    * main.go 服务main函数实现

2. lib 用到的一些基础组建
    * file 文件的读写
    * inter ws基础服务接口
    * io ws消息的读写
    * recover panic崩溃回收
    * service ws服务的基础类
    * transport 自定义websocket服务端的实现

3. test 
    * client  测试命令/stats [username] /popular 命令 test没有办法获取终端输入，所以编译成可执行文件测试
    * chat_test.go 聊天服务测试
    * file_test.go 文件读取测试
    * msgcache_testgo 消息缓存测试
    * service_test.go 基础websocket包测试
    * statistic_test.go 流行词汇测试
    * transport_test.go 自定义websocket 服务端测试