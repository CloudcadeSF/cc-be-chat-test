package service

/*
*创建tcp或者websocket服务
 */
import (
	"cc-be-chat-test/lib/inter"
	"cc-be-chat-test/lib/recover"
	"cc-be-chat-test/lib/transport"
	"errors"
	"fmt"
	"net"
	"os"
	"os/signal"
	"sync"
	"sync/atomic"
	"syscall"
)

//Model 模式
type Model int

//网络模式
const (
	//websocket模式
	WebSocketModel = iota
)

//Service 服务对象
type Service struct {
	path                string                //websocket 使用
	ip                  string                //监听的IP地址
	port                int                   //监听的端口号
	count               int32                 //在线的链接数
	pid                 int                   //进程pid
	waitGroup           sync.WaitGroup        //协程序数量
	status              bool                  //服务状态
	heartbeat           int                   //心跳时间
	model               Model                 //模式
	errorCallBackFunc   func(error)           //错误处理函数
	connectCallBackFunc func(inter.ConnInter) //链接建立处理函数
	exitCallBackFunc    func()                //退出处理函数
	clients             sync.Map
}

//CreateService 初始化一个服务
func CreateService(ip string, port int, heartbeat int, model Model) *Service {
	i := net.ParseIP(ip)
	if i == nil {
		panic(errors.New("ip is nil"))
	}
	if port <= 0 {
		panic(errors.New("port error"))
	}
	pointer := new(Service)
	pointer.ip = ip
	pointer.port = port
	pointer.pid = os.Getpid()
	pointer.status = false
	pointer.count = 0
	pointer.heartbeat = heartbeat
	pointer.model = model
	return pointer
}

//RegisterErrorCallBackFunc 注册服务出错处理函数
func (pointer *Service) RegisterErrorCallBackFunc(errorCallBackFunc func(error)) {
	pointer.errorCallBackFunc = errorCallBackFunc
}

//RegisterAcceptCallBackFunc 注册服务新建链接处理函数
func (pointer *Service) RegisterAcceptCallBackFunc(acceptCallBackFunc func(inter.ConnInter)) {
	pointer.connectCallBackFunc = acceptCallBackFunc
}

//RegisterExitCallBackFunc 注册服务新建链接处理函数
func (pointer *Service) RegisterExitCallBackFunc(exitCallBackFunc func()) {
	pointer.exitCallBackFunc = exitCallBackFunc
}

//Run 启动一个网络服务
func (pointer *Service) Run() {
	c := make(chan os.Signal)
	//监听指定信号
	signal.Notify(c, syscall.SIGINT, syscall.SIGKILL, syscall.SIGTERM, syscall.SIGQUIT)
	//websocket模式
	if pointer.model == WebSocketModel {
		pointer.status = true
		go pointer._RunWebSocket()
	}
	msg := <-c
	pointer.status = false
	if pointer.exitCallBackFunc != nil {
		pointer.exitCallBackFunc()
	}
	pointer.clients.Range(func(k, v interface{}) bool {
		v.(*Client).Exit()
		return true
	})
	fmt.Println(msg)
}

//_RunWebSocket 启动websocket
func (pointer *Service) _RunWebSocket() {
	defer recover.Recover("_RunWebSocket")
	fmt.Println("websocket service strat ", pointer.port)
	ws := transport.CreateWebSocket(pointer.port, pointer)
	ws.Run()
}

//WsAccept 建立websokcet链接
func (pointer *Service) WsAccept(conn *transport.WsConn) {
	pointer.waitGroup.Add(1)
	defer pointer.waitGroup.Done()
	atomic.AddInt32(&pointer.count, 1)
	client := newWebClient(conn, conn.RemoteAddr().String(), pointer.heartbeat)
	pointer.clients.Store(client.GetIP(), client)
	pointer.connectCallBackFunc(client)
	pointer.clients.Delete(client.GetIP())
	conn.Close()
	atomic.AddInt32(&pointer.count, -1)
	return
}
