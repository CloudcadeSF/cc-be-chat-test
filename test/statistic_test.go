package test

import (
	"cc-be-chat-test/chat/service"
	"fmt"
	"testing"
	"time"
)

//Test_Statistic 测试统计
func Test_Statistic(t *testing.T) {
	statistic := service.CreateStatistic()
	go statistic.Run()
	num := 0
	for n := 0; n <= 99; n++ {
		statistic.AddMsg(fmt.Sprintf("%d", n))
		if num/3 == 0 {
			statistic.AddMsg(fmt.Sprintf("%d", 10))
		}
	}
	//此处获取如果为10表示正确
	fmt.Println("流行消息", statistic.GetPopular())
	time.Sleep(time.Second * 7)
	//此处应该为空 因为超过5秒了
	fmt.Println("流行消息", statistic.GetPopular())
	statistic.AddMsg(fmt.Sprintf("%d", 1))
	time.Sleep(time.Second * 1)
	//此处为1 表示正确
	fmt.Println("流行消息", statistic.GetPopular())
}
