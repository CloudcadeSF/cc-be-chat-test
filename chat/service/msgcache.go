package service

import (
	"fmt"
	"sync"
)

const (
	//_CacheLen 缓存长度
	_CacheLen = 50
)

//MsgCache 消息缓存
type MsgCache struct {
	msgcache [_CacheLen]string
	pos      int
	lock     sync.RWMutex
}

//AddMsg 添加消息
func (pointer *MsgCache) AddMsg(msg string) {
	pointer.lock.Lock()
	defer pointer.lock.Unlock()
	if pointer.pos < _CacheLen {
		pos := _CacheLen - pointer.pos - 1
		pointer.msgcache[pos] = msg
		pointer.pos++
	} else {
		cache := []string{}
		cache = append(cache, pointer.msgcache[0:_CacheLen-1]...)
		pointer.msgcache[0] = msg
		for i := 1; i < _CacheLen; i++ {
			pointer.msgcache[i] = cache[i-1]
		}
	}
}

//RangeMsg 遍历
func (pointer *MsgCache) RangeMsg(f func(msg string)) {
	pointer.lock.RLock()
	defer pointer.lock.RUnlock()
	cache := pointer.msgcache
	for i := _CacheLen - 1; i >= 0; i-- {
		if cache[i] != "" {
			f(cache[i])
		}
	}
	fmt.Println("完成")
}
