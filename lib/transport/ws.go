package transport

import (
	"crypto/sha1"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"strings"
	"time"
)

//WebSocketInter 接口
type WebSocketInter interface {
	//WsAccept 收到wsAccept链接
	WsAccept(conn *WsConn)
}

const (
	//_HeaderBuffLen 建立链接使用的buff长度
	_HeaderBuffLen = 1024
	//_Guid 魔法字符串
	_Guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
)

const (
	//_WsClose 收到客户端端口
	_WsClose = 8
)

//WebSocket ws对象
type WebSocket struct {
	inter  WebSocketInter
	port   int
	header map[string]string
}

//CreateWebSocket 创建一个webscoket 对象
func CreateWebSocket(port int, inter WebSocketInter) *WebSocket {
	return &WebSocket{
		port:  port,
		inter: inter,
	}
}

//Run 启动
func (pointer *WebSocket) Run() error {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", pointer.port))
	if err != nil {
		log.Panic(err)
	}
	for {
		conn, err := ln.Accept()
		if err != nil {
			return err
		}
		if err := pointer.CheckWebConn(conn); err != nil {
			//直接断开链接
			conn.Close()
			continue
		}
	}
}

//CheckWebConn 检测websocket链接
func (pointer *WebSocket) CheckWebConn(conn net.Conn) error {
	content := make([]byte, _HeaderBuffLen)
	_, err := conn.Read(content)
	if err != nil {
		//读取出错 直接返回
		return err
	}
	//首先判断是否为GET请求
	if string(content)[0:3] != "GET" {
		return errors.New("is not get")
	}
	pointer.header = pointer._ParseHandshake(string(content))
	secWebsocketKey := pointer.header["Sec-WebSocket-Key"]
	if pointer.header["Connection"] != "Upgrade" {
		//此处表示不是一个ws链接
		return errors.New("is not ws conn")
	}
	//组装返回
	h := sha1.New()
	io.WriteString(h, secWebsocketKey+_Guid)
	accept := make([]byte, 28)
	base64.StdEncoding.Encode(accept, h.Sum(nil))
	response := "HTTP/1.1 101 Switching Protocols\r\n"
	response = response + "Sec-WebSocket-Accept: " + string(accept) + "\r\n"
	response = response + "Connection: Upgrade\r\n"
	response = response + "Upgrade: websocket\r\n\r\n"
	if _, err := conn.Write([]byte(response)); err != nil {
		return err
	}
	//调用接口

	go pointer.inter.WsAccept(CreateWsConn(conn, pointer))
	return nil
}

//_ParseHandshake 解析客户端建立链接传输过来的内容
func (pointer *WebSocket) _ParseHandshake(content string) map[string]string {
	headers := make(map[string]string, 10)
	lines := strings.Split(content, "\r\n")
	for _, line := range lines {
		if len(line) >= 0 {
			words := strings.Split(line, ":")
			if len(words) == 2 {
				headers[strings.Trim(words[0], " ")] = strings.Trim(words[1], " ")
			}
		}
	}
	return headers
}

//WsConn 建立链接以后的websocket
type WsConn struct {
	MaskingKey []byte
	Conn       net.Conn
	WebSocket  *WebSocket
}

//CreateWsConn 创建一个对象
func CreateWsConn(conn net.Conn, ws *WebSocket) *WsConn {
	return &WsConn{Conn: conn, WebSocket: ws}
}

//Read 读取
func (pointer *WsConn) Read() (buff []byte, err error) {
	opcodeByte := make([]byte, 1)
	if _, err = pointer.Conn.Read(opcodeByte); err != nil {
		return nil, err
	}
	FIN := opcodeByte[0] >> 7
	//展示没有使用自定义数据
	// RSV1 := opcodeByte[0] >> 6 & 1
	// RSV2 := opcodeByte[0] >> 5 & 1
	// RSV3 := opcodeByte[0] >> 4 & 1
	// 查看是否心跳等数据
	OPCODE := opcodeByte[0] & 15
	if OPCODE == _WsClose {
		return nil, errors.New("client close")
	}
	payloadLenByte := make([]byte, 1)
	if _, err = pointer.Conn.Read(payloadLenByte); err != nil {
		return nil, err
	}
	payloadLen := int(payloadLenByte[0] & 0x7F)
	mask := payloadLenByte[0] >> 7
	if mask != 1 {
		//收到客户端消息的时候 mask必须为1
		return nil, errors.New("mask is not 1")
	}
	buffLen := int64(payloadLen)
	//126
	if payloadLen == 126 {
		buffLen = 0
		extendedByte := make([]byte, 2)
		if _, err = pointer.Conn.Read(extendedByte); err != nil {
			return nil, err
		}
		for i := 0; i < 2; i++ {
			b := extendedByte[i]
			buffLen = buffLen*256 + int64(b)
		}
	}
	//127
	if payloadLen == 127 {
		extendedByte := make([]byte, 8)
		if _, err = pointer.Conn.Read(extendedByte); err != nil {
			return nil, err
		}
		for i := 0; i < 2; i++ {
			b := extendedByte[i]
			if i == 0 {
				b &= 0x7f
			}
			buffLen = buffLen*256 + int64(b)
		}
	}
	maskingByte := make([]byte, 4)
	if _, err = pointer.Conn.Read(maskingByte); err != nil {
		return nil, err
	}
	pointer.MaskingKey = maskingByte
	payloadDataByte := make([]byte, buffLen)
	if _, err = pointer.Conn.Read(payloadDataByte); err != nil {
		return nil, err
	}
	dataByte := make([]byte, buffLen)
	for i := int64(0); i < buffLen; i++ {
		dataByte[i] = payloadDataByte[i] ^ maskingByte[i%4]
	}
	if FIN == 1 {
		buff = dataByte
		return buff, nil
	}
	nextData, err := pointer.Read()
	if err != nil {
		return nil, err
	}
	buff = append(buff, nextData...)
	return buff, nil
}

//Write 写入
func (pointer *WsConn) Write(buff []byte) (n int, err error) {
	var header []byte
	length := len(buff)
	payloadLen := 0
	switch {
	case length <= 125:
		payloadLen = length
		break
	case length < 65536:
		payloadLen = 126
		break
	default:
		payloadLen = 127
		break
	}

	maskedData := make([]byte, length)
	for i := 0; i < length; i++ {
		if pointer.MaskingKey != nil {
			maskedData[i] = buff[i] ^ pointer.MaskingKey[i%4]
		} else {
			maskedData[i] = buff[i]
		}
	}
	header = append(header, 0x81)
	var payLenByte byte
	if pointer.MaskingKey != nil && len(pointer.MaskingKey) != 4 {
		payLenByte = byte(0x80) | byte(payloadLen)
		header = append(header, payLenByte)
		header = append(header, pointer.MaskingKey...)
	} else {
		payLenByte = byte(0x00) | byte(payloadLen)
		header = append(header, payLenByte)
	}

	if payloadLen == 126 {
		for i := 0; i < 2; i++ {
			j := uint((2 - i - 1) * 8)
			b := byte((length >> j) & 0xff)
			header = append(header, b)
		}
	}
	if payloadLen == 127 {
		for i := 0; i < 8; i++ {
			j := uint((2 - i - 1) * 8)
			b := byte((length >> j) & 0xff)
			header = append(header, b)
		}
	}
	header = append(header, buff...)
	pointer.Conn.Write(header)
	return 0, nil
}

//Close 关闭
func (pointer *WsConn) Close() error {
	return pointer.Conn.Close()
}

//LocalAddr 地址
func (pointer *WsConn) LocalAddr() net.Addr {
	return pointer.Conn.LocalAddr()
}

//RemoteAddr 地址
func (pointer *WsConn) RemoteAddr() net.Addr {
	return pointer.Conn.RemoteAddr()
}

//SetDeadline 设置读写超时
func (pointer *WsConn) SetDeadline(t time.Time) error {
	return pointer.Conn.SetDeadline(t)
}

//SetReadDeadline 设置读超时
func (pointer *WsConn) SetReadDeadline(t time.Time) error {
	return pointer.Conn.SetReadDeadline(t)
}

//SetWriteDeadline 设置写超时
func (pointer *WsConn) SetWriteDeadline(t time.Time) error {
	return pointer.Conn.SetWriteDeadline(t)
}
