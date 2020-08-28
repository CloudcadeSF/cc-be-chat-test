package test

import (
	"cc-be-chat-test/chat/service"
	"fmt"
	"testing"
)

//Test_MsgCache 测试缓存
func Test_MsgCache(t *testing.T) {
	msgcache := &service.MsgCache{}
	for n := 0; n <= 100; n++ {
		msgcache.AddMsg(fmt.Sprintf("%d", n))
		// msgcache.RangeMsg(func(msg string) {
		// 	fmt.Println(msg)
		// })
	}
	msgcache.RangeMsg(func(msg string) {
		fmt.Println(msg)
	})
}
