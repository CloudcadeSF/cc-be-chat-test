package service

import (
	"cc-be-chat-test/lib/inter"
	"fmt"
	"time"
)

const (
	//_LoginTimeFormat 登录格式
	_LoginTimeFormat = "%dd %dh %dm %ds"
	//_StatusCmd 查看用户状态命令
	_StatusCmd = "/stats"
	//_PopularCmd 流行词汇命令
	_PopularCmd = "/popular"
	//_PingCmd 心跳
	_PingCmd = "/ping"
)

//Player 玩家
type Player struct {
	conn      inter.ConnInter //链接对象
	chat      *ChatService    //聊天服务
	name      string          //用户名称
	logintime string          //登录时间
}

//CreatePlayer 创建玩家对象
func CreatePlayer(chat *ChatService, conn inter.ConnInter) *Player {
	player := new(Player)
	player.conn = conn
	player.chat = chat
	player.name = conn.GetIP()
	now := time.Now()
	player.logintime = fmt.Sprintf(_LoginTimeFormat, now.Day(), now.Hour(), now.Minute(), now.Second())
	player.conn.RegisterRecvMessageCallBackFunc(player.OnMessage)
	player.conn.RegisterErrorCallBackFunc(player.OnError)
	player.conn.RegisterExitCallBackFunc(player.OnExit)
	player.conn.RegisterInitClientCallBackFunc(player.OnInit)
	player.Broadcast([]byte(fmt.Sprintf("玩家%s上线(%s)", player.name, player.logintime)))
	return player
}

//Run 启动
func (pointer *Player) Run() {
	pointer.conn.Start()
}

//OnInit 初始化回调
func (pointer *Player) OnInit() {
	//推送缓存消息
	pointer.chat.msgCache.RangeMsg(func(msg string) {
		fmt.Println("推送缓存消息", msg)
		pointer.conn.Write([]byte(msg))
	})
}

//OnMessage 收到客户端消息
func (pointer *Player) OnMessage(msg []byte) {
	switch string(msg) {
	case _PingCmd:
		//心跳不处理
		break
	case _PopularCmd:
		//流行词汇
		m := pointer.chat.statistic.GetPopular()
		fmt.Println("当前流行词汇", m)
		pointer.conn.Write([]byte(m))
		break
	default:
		if string(msg)[0:len(_StatusCmd)] == _StatusCmd {
			name := string(msg)[len(_StatusCmd)+1:]
			fmt.Println("查看用户信息命令", name)
			pointer.chat.manager.RangePlayer(func(player *Player) bool {
				if player.name == name {
					//给此玩家发送消息
					pointer.conn.Write([]byte(fmt.Sprintf("%s %s", player.name, player.logintime)))
				}
				return true
			})
			break
		}
		//给除了自己的所有人发消息
		m := pointer.Broadcast(msg)
		//添加缓存
		pointer.chat.msgCache.AddMsg(m)
		//添加统计
		pointer.chat.statistic.AddMsg(m)
	}
}

//OnError 错误消息
func (pointer *Player) OnError(err error) {
	fmt.Println("收到错误:", err.Error())
}

//OnExit 玩家退出消息
func (pointer *Player) OnExit() {
	fmt.Println("收到玩家退出")
	pointer.Broadcast([]byte(fmt.Sprintf("玩家%s下线(%s)", pointer.name, pointer.logintime)))
}

//Broadcast 广播
func (pointer *Player) Broadcast(msg []byte) string {
	tomsg := pointer.chat.MsgCheck(string(msg))
	//fmt.Printf("收到玩家(%s)消息:%s，转发给除自已以外的玩家\n", pointer.conn.GetIP(), tomsg)
	pointer.chat.manager.RangePlayer(func(player *Player) bool {
		if player.conn.GetIP() != pointer.conn.GetIP() {
			player.conn.Write([]byte(tomsg))
		}
		return true
	})
	return tomsg
}
