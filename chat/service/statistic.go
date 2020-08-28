package service

import (
	"cc-be-chat-test/lib/recover"
	"sync"
	"time"
)

type msginfo struct {
	updateTime int64
	num        int
}

//Statistic 统计
type Statistic struct {
	exit    chan bool
	msg     chan string
	msglist sync.Map
}

//CreateStatistic 创建统计
func CreateStatistic() *Statistic {
	return &Statistic{
		exit: make(chan bool),
		msg:  make(chan string, 1),
	}
}

//Run 启动统计
func (pointer *Statistic) Run() {
	recover.Recover("Run")
	ticker := time.NewTicker(time.Second * 1)
	defer func() {
		//回收资源
		ticker.Stop()
		close(pointer.exit)
		close(pointer.msg)
	}()
	for {
		select {
		case <-ticker.C:
			//重新清空大于5秒的数据
			now := time.Now().Unix()
			pointer.msglist.Range(func(key, vali interface{}) bool {
				info, ok := vali.(*msginfo)
				if ok {
					if info.updateTime+5 < now {
						pointer.msglist.Delete(key)
					}
				}
				return true
			})
		case msg := <-pointer.msg:
			//添加消息
			if vali, ok := pointer.msglist.Load(msg); ok {
				if old, o := vali.(*msginfo); o {
					info := &msginfo{
						updateTime: time.Now().Unix(),
						num:        old.num + 1,
					}
					pointer.msglist.Store(msg, info)
				}
			} else {
				info := &msginfo{
					updateTime: time.Now().Unix(),
					num:        1,
				}
				pointer.msglist.Store(msg, info)
			}
		case <-pointer.exit:
			//退出
			return
		}
	}
}

//AddMsg 添加消息
func (pointer *Statistic) AddMsg(msg string) {
	pointer.msg <- msg
}

//Close 关闭
func (pointer *Statistic) Close() {
	pointer.exit <- true
}

//GetPopular 找到当前频率最高的词汇
func (pointer *Statistic) GetPopular() string {
	popMsg := ""
	before := 0
	pointer.msglist.Range(func(key, vali interface{}) bool {
		info, ok := vali.(*msginfo)
		if ok {
			if before <= info.num {
				popMsg = key.(string)
				before = info.num
			}
		}
		return true
	})
	return popMsg
}
