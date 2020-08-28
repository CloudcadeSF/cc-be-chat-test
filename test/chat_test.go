package test

import (
	"cc-be-chat-test/chat/service"
	"fmt"
	"log"
	"testing"
	"time"

	"golang.org/x/net/websocket"
)

const (
	_WsURL  = "ws://127.0.0.1:8000"
	_Origin = "http://127.0.0.1:8080/"
)

//Test_ChatService 测试websocket聊天
func Test_ChatService(t *testing.T) {
	srv := service.CreateChatService(8000, 10)
	srv.Run()
}

//Test_ChatPlayer1 测试玩家1
//测试客户端使用官方提供的ws库，这样可以测试自己写的ws服务是否为标准服务
//次方法主要用于测试
//1.链接webscoket 发送消息给其他玩家
func Test_ChatPlayer1(t *testing.T) {
	ws, err := websocket.Dial(_WsURL, "", _Origin)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	go func() {
		//定时发消息
		tick := time.NewTicker(time.Second)
		//心跳
		hearttick := time.NewTicker(time.Second * 5)
		num := 1
		for {
			select {
			case <-tick.C:
				ws.Write([]byte(fmt.Sprintf("oh my God! hello! I am is player 1 msg num(%d)", num)))
				num++
				//为了测试流行词汇
				if num%2 == 0 {
					ws.Write([]byte(fmt.Sprintf("poplur (%d)", 10)))
				}
			case <-hearttick.C:
				ws.Write([]byte("/ping"))
			}
		}
	}()
	for {
		var msg = make([]byte, 1024)
		m, err := ws.Read(msg)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Receive: %s\n", msg[:m])
	}
}

//Test_ChatPlayer2 测试玩家2
//测试客户端使用官方提供的ws库，这样可以测试自己写的ws服务是否为标准服务
//次方法主要用于测试
//1.链接webscoket 会收到前缓存的消息
func Test_ChatPlayer2(t *testing.T) {
	ws, err := websocket.Dial(_WsURL, "", _Origin)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	go func() {
		//心跳
		hearttick := time.NewTicker(time.Second * 5)
		for {
			select {
			case <-hearttick.C:
				ws.Write([]byte("/ping"))
			}
		}
	}()
	for {
		var msg = make([]byte, 1024)
		m, err := ws.Read(msg)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Receive: %s\n", msg[:m])
	}
}

//Test_ChatPlayer3 测试玩家3
//测试客户端使用官方提供的ws库，这样可以测试自己写的ws服务是否为标准服务
//次方法主要用于测试
//1.链接webscoket 测试命令
func Test_ChatPlayer3(t *testing.T) {
	ws, err := websocket.Dial(_WsURL, "", _Origin)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()
	write := make(chan []byte, 1)
	go func() {
		//心跳
		hearttick := time.NewTicker(time.Second * 5)
		for {
			select {
			case <-hearttick.C:
				ws.Write([]byte("/ping"))
			case buff := <-write:
				ws.Write(buff)
			}
		}
	}()

	go func() {
		for {
			var msg = make([]byte, 1024)
			m, err := ws.Read(msg)
			if err != nil {
				log.Fatal(err)
			}
			fmt.Printf("Receive: %s\n", msg[:m])
		}
	}()

	fmt.Println("请输入一下命令")
	fmt.Println("/popular 查看5秒内热门消息")
	fmt.Println("/stats [username] 查看用户状态")
	for {
		var cmd string
		fmt.Println("请开始输入:")
		if _, err := fmt.Scanln(&cmd); err != nil {
			fmt.Println("错误:", err.Error())
			return
		}
		fmt.Printf("cmd %s\n", cmd)
		if cmd == "/popular" {
			write <- []byte(cmd)
			continue
		}
		if len(cmd) >= len("/stats") && cmd[0:len("/stats")] == "/stats" {
			write <- []byte(cmd)
			continue
		}
		if cmd == "/exit" {
			return
		}
		fmt.Println("没有此命令:", cmd)
	}
}
