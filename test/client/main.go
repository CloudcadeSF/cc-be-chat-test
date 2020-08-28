package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"golang.org/x/net/websocket"
)

const (
	_WsURL  = "ws://127.0.0.1:8000"
	_Origin = "http://127.0.0.1:8080/"
)

// 测试玩家3
//测试客户端使用官方提供的ws库，这样可以测试自己写的ws服务是否为标准服务
//次方法主要用于测试
//1.链接webscoket 测试命令
func main() {
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

	reader := bufio.NewReader(os.Stdin)
	fmt.Println("请开始输入:")
	for {
		fmt.Print("-> ")
		cmd, _ := reader.ReadString('\n')
		cmd = strings.Replace(cmd, "\n", "", -1)

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
