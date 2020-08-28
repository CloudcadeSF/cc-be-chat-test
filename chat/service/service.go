package service

import (
	"cc-be-chat-test/lib/file"
	"cc-be-chat-test/lib/inter"
	base "cc-be-chat-test/lib/service"
	"fmt"
	"strings"
)

//ChatService 聊天服务
type ChatService struct {
	service   *base.Service
	manager   *Manager   //玩家管理
	wordlist  []string   //屏蔽单词列表
	msgCache  *MsgCache  //消息缓存
	statistic *Statistic //统计
}

//CreateChatService 创建一个聊天服务
//port 端口
//heartbeat 心跳(单位:秒)
func CreateChatService(port, heartbeat int) *ChatService {
	srv := new(ChatService)
	srv.manager = CreateManager()
	srv.statistic = CreateStatistic()
	srv.service = base.CreateService("0.0.0.0", port, heartbeat, base.WebSocketModel)
	srv.service.RegisterAcceptCallBackFunc(srv.OnWsAccept)
	srv.service.RegisterExitCallBackFunc(srv.OnExit)
	srv._ReadWordsList()
	srv.msgCache = &MsgCache{}
	go srv.statistic.Run()
	return srv
}

//Run 启动
func (pointer *ChatService) Run() {
	pointer.service.Run()
}

//OnWsAccept 建立websocket 链接
func (pointer *ChatService) OnWsAccept(conn inter.ConnInter) {
	//创建玩家
	player := CreatePlayer(pointer, conn)
	//添加玩家
	pointer.manager.AddPlayer(player)
	//玩家运行
	player.Run()
	//删除玩家
	pointer.manager.DelPlayer(player)
}

//OnExit 退出
func (pointer *ChatService) OnExit() {
	pointer.statistic.Close()
	fmt.Println("服务退出")
}

//ReadWordsList 获取单词列表
func (pointer *ChatService) _ReadWordsList() {
	f, err := file.OpenFile("./list.txt")
	if err != nil {
		//fmt.Println(err.Error())
		return
	}
	defer f.Close()
	for {
		buff, err := f.ReadLine()
		if err != nil {
			break
		}
		str := strings.Replace(string(buff), " ", "", -1)
		pointer.wordlist = append(pointer.wordlist, str)
	}
	//fmt.Println(pointer.wordlist)
}

//MsgCheck 屏蔽字符串检测
func (pointer *ChatService) MsgCheck(msg string) string {
	for _, str := range pointer.wordlist {
		s := ""
		for i := 0; i < len(str); i++ {
			s += "*"
		}
		msg = strings.Replace(msg, str, s, -1)
	}
	return msg
}
