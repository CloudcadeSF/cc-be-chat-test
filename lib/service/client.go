package service

import (
	"cc-be-chat-test/lib/io"
	"cc-be-chat-test/lib/transport"
	"errors"
	"sync"
	"sync/atomic"
	"time"
)

const (
	exit = 0
	open = 1
)

type writeBuf struct {
	back chan error
	buff []byte
}

//Write 发送消息
func (pointer *Client) Write(msg []byte) error {
	if atomic.LoadUint32(&pointer.exit) > exit {
		atomic.AddInt64(&pointer.writeLen, 1)
		message := &writeBuf{buff: msg, back: make(chan error)}
		pointer.writeBuf <- message
		return <-message.back
	}
	return errors.New("server is exit")
}

//GetIP 获取ip
func (pointer *Client) GetIP() string {
	return pointer.ip
}

//Exit 主动退出
func (pointer *Client) Exit() {
	switch pointer.model {
	case WebSocketModel:
		//webscoket模式
		pointer.webConn.Close()
	}
}

//RegisterErrorCallBackFunc 注册服务出错处理函数
func (pointer *Client) RegisterErrorCallBackFunc(errorCallBackFunc func(error)) {
	pointer.errorCallBackFunc = errorCallBackFunc
}

//RegisterInitClientCallBackFunc 注册客户端初始化处理函数
func (pointer *Client) RegisterInitClientCallBackFunc(initClientCallBackFunc func()) {
	pointer.initClientCallBackFunc = initClientCallBackFunc
}

//RegisterRecvMessageCallBackFunc 注册消息接受函数
func (pointer *Client) RegisterRecvMessageCallBackFunc(recvMessageCallBackFunc func(msg []byte)) {
	pointer.recvMsgCallBackFunc = recvMessageCallBackFunc
}

//RegisterExitCallBackFunc 注册用户退出函数
func (pointer *Client) RegisterExitCallBackFunc(exitCallBackFunc func()) {
	pointer.exitCallBackFunc = exitCallBackFunc
}

//Start 初始化服务
func (pointer *Client) Start() {
	atomic.StoreUint32(&pointer.exit, open)
	go pointer.funcWork()
	if pointer.initClientCallBackFunc != nil {
		pointer.initClientCallBackFunc()
	}
	pointer.funcRead()
	atomic.StoreUint32(&pointer.exit, exit)
	if pointer.exitCallBackFunc != nil {
		pointer.exitCallBackFunc()
	}
	//等待1秒，清空所有的消息
	time.Sleep(1 * time.Second)
	//关闭资源
	close(pointer.writeBuf)
	pointer.waitGroup.Wait()
}

//Client 客户端
type Client struct {
	writeBuf               chan *writeBuf
	writeLen               int64
	timeout                int32
	close                  chan bool
	exit                   uint32
	ip                     string
	webConn                *transport.WsConn
	waitGroup              sync.WaitGroup
	model                  Model
	heartbeat              time.Duration    //心跳时间
	initClientCallBackFunc func()           //初始化逻辑
	recvMsgCallBackFunc    func(msg []byte) //接受消息
	exitCallBackFunc       func()           //退出
	errorCallBackFunc      func(error)      //出错
}

func newWebClient(conn *transport.WsConn, ip string, heartbeat int) *Client {
	return &Client{
		webConn:   conn,
		timeout:   0,
		writeBuf:  make(chan *writeBuf, 1),
		close:     make(chan bool),
		exit:      open,
		ip:        ip,
		writeLen:  0,
		heartbeat: time.Duration(heartbeat) * time.Second,
		model:     WebSocketModel,
	}
}

/*
*启动写
 */
func (pointer *Client) funcRead() {
	pointer.waitGroup.Add(1)
	defer pointer.waitGroup.Done()
	switch pointer.model {
	case WebSocketModel:
		//webscoket模式
		for {
			pointer.webConn.SetReadDeadline(time.Now().Add(pointer.heartbeat))
			message, err := io.WbRead(pointer.webConn)
			if err != nil {
				//关闭读写队列
				if pointer.errorCallBackFunc != nil {
					pointer.errorCallBackFunc(err)
				}
				pointer.webConn.Close()
				return
			}
			if pointer.recvMsgCallBackFunc != nil {
				pointer.recvMsgCallBackFunc(message)
			}

		}
	}
}

/*
*启动业务协程
 */
func (pointer *Client) funcWork() {
	pointer.waitGroup.Add(1)
	defer pointer.waitGroup.Done()
	for msg := range pointer.writeBuf {
		switch pointer.model {
		case WebSocketModel:
			//webscoket模式
			err := io.WbWriteByTime(pointer.webConn, msg.buff, time.Now().Add(pointer.heartbeat))
			if err != nil {
				if pointer.errorCallBackFunc != nil {
					pointer.errorCallBackFunc(err)
				}
				pointer.webConn.Close()
			}
			msg.back <- err
			pointer.webConn.SetReadDeadline(time.Now().Add(pointer.heartbeat))
			atomic.AddInt64(&pointer.writeLen, -1)
		}
	}
}
