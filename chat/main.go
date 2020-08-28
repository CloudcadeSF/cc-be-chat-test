package main

import "cc-be-chat-test/chat/service"

func main() {
	srv := service.CreateChatService(8000, 10)
	srv.Run()
}
