package test

import (
	"cc-be-chat-test/lib/transport"
	"fmt"
	"testing"
)

//Test_WsService 测试websocket 服务端
func Test_WsTransport(t *testing.T) {
	ws := transport.CreateWebSocket(8000, &TestService{})
	ws.Run()
}

//Service 服务
type TestService struct {
}

//WsAccept 建立websocket 链接
func (pointer *TestService) WsAccept(conn *transport.WsConn) {
	for {
		buff, err := conn.Read()
		if err != nil {
			conn.Close()
			fmt.Println(err.Error())
			return
		}
		fmt.Println("收到", string(buff))
		conn.Write(buff)
	}
}
