package test

import (
	"cc-be-chat-test/lib/inter"
	"cc-be-chat-test/lib/service"
	"fmt"
	"testing"
)

//Test_WsService 测试websocket 服务端
func Test_WsService(t *testing.T) {
	srv := service.CreateService("127.0.0.1", 8000, 10, service.WebSocketModel)
	srv.RegisterAcceptCallBackFunc(WsAccept)
	srv.Run()
}

//WsAccept 建立websocket 链接
func WsAccept(conn inter.ConnInter) {
	player := CreatePlayer(conn)
	player.Run()
}

//Player 玩家
type Player struct {
	conn inter.ConnInter
}

func CreatePlayer(conn inter.ConnInter) *Player {
	player := new(Player)
	player.conn = conn
	player.conn.RegisterRecvMessageCallBackFunc(player.OnMessage)
	player.conn.RegisterErrorCallBackFunc(player.OnError)
	player.conn.RegisterExitCallBackFunc(player.OnExit)
	fmt.Println("创建玩家")
	return player
}

func (pointer *Player) Run() {
	pointer.conn.Start()
}

func (pointer *Player) OnMessage(msg []byte) {
	fmt.Println("收到消息:", string(msg))
}

func (pointer *Player) OnError(err error) {
	fmt.Println("收到错误:", err.Error())
}

func (pointer *Player) OnExit() {
	fmt.Println("收到玩家退出")
}
