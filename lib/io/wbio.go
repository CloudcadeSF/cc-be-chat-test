package io

import (
	"cc-be-chat-test/lib/transport"
	"time"
)

// WbRead websocket读取数据
func WbRead(conn *transport.WsConn) ([]byte, error) {
	message, err := conn.Read()
	if err != nil {
		return nil, err
	}
	return message, nil
}

// WbReadByTime websocket读取数据超时
func WbReadByTime(conn *transport.WsConn, t time.Time) ([]byte, error) {
	err := conn.SetReadDeadline(t)
	if err != nil {
		return nil, err
	}
	defer conn.SetReadDeadline(time.Time{})
	message, err := conn.Read()
	if err != nil {
		return nil, err
	}
	return message, nil
}

// WbWrite websocket写数据
func WbWrite(conn *transport.WsConn, message []byte) error {
	_, err := conn.Write(message)
	if err != nil {
		return err
	}
	return nil
}

// WbWriteByTime websocket写数据超时
func WbWriteByTime(conn *transport.WsConn, message []byte, t time.Time) error {
	err := conn.SetWriteDeadline(t)
	if err != nil {
		return err
	}
	defer conn.SetWriteDeadline(time.Time{})
	_, err = conn.Write(message)
	if err != nil {
		return err
	}
	return nil
}
