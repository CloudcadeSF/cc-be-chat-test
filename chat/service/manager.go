package service

import (
	"fmt"
	"sync"
)

//Manager 管理器
type Manager struct {
	//玩家列表
	playelist sync.Map
}

//CreateManager 创建管理器
func CreateManager() *Manager {
	return &Manager{}
}

//AddPlayer 添加玩家
func (pointer *Manager) AddPlayer(player *Player) bool {
	if _, ok := pointer.playelist.Load(player.conn.GetIP()); !ok {
		pointer.playelist.Store(player.conn.GetIP(), player)
		fmt.Printf("玩家(%s)上线 登录时间(%s)\n", player.conn.GetIP(), player.logintime)
		return true
	}
	return false
}

//DelPlayer 删除玩家
func (pointer *Manager) DelPlayer(player *Player) bool {
	if _, ok := pointer.playelist.Load(player.conn.GetIP()); ok {
		pointer.playelist.Delete(player.conn.GetIP())
		fmt.Printf("玩家(%s)下线\n", player.conn.GetIP())
		return true
	}
	return false
}

//RangePlayer 遍历在线玩家
func (pointer *Manager) RangePlayer(f func(player *Player) bool) {
	pointer.playelist.Range(func(key, vali interface{}) bool {
		player, ok := vali.(*Player)
		if ok {
			return f(player)
		}
		return true
	})
}
