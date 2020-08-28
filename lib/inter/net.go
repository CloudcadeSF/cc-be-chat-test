package inter

//ServiceInter 服务接口
type ServiceInter interface {
	//websocket path为监听路径
	Run(path string)

	//注册服务出错处理函数
	RegisterErrorCallBackFunc(errorCallBackFunc func(error))

	//注册服务新建链接处理函数
	RegisterAcceptCallBackFunc(acceptCallBackFunc func(ConnInter))

	//注册服务新建链接处理函数
	RegisterExitCallBackFunc(exitCallBackFunc func())
}

//ConnInter 链接接口
type ConnInter interface {

	//发送消息
	Write(msg []byte) error

	//获取ip
	GetIP() string

	//主动退出
	Exit()

	//注册服务出错处理函数
	RegisterErrorCallBackFunc(errorCallBackFunc func(error))

	//注册客户端初始化处理函数
	RegisterInitClientCallBackFunc(initClientCallBackFunc func())

	//注册消息接受函数
	RegisterRecvMessageCallBackFunc(recvMessageCallBackFunc func(msg []byte))

	//注册用户退出函数
	RegisterExitCallBackFunc(exitCallBackFunc func())

	//启动
	Start()
}

//ClientInter 客户端接口
type ClientInter interface {
	//发送消息
	Write(msg []byte) error

	//获取链接服务地址
	GetURL() string

	//主动退出
	Exit()

	//注册发送心跳回调函数
	RegisterHeartBeatCallBackFunc(heartBeatCallBackFunc func())

	//注册客户端初始化处理函数
	RegisterInitClientCallBackFunc(initClientCallBackFunc func())

	//注册消息接受函数
	RegisterRecvMsgCallBackFunc(recvMsgCallBackFunc func(msg []byte))

	//注册客户端退出函数
	RegisterExitCallBackFunc(exitCallBackFunc func())

	//启动
	Start()
}
