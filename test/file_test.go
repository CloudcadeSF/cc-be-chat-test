package test

import (
	"cc-be-chat-test/lib/file"
	"fmt"
	"testing"
)

func Test_Read(t *testing.T) {
	f, _ := file.OpenFile("./list.txt")
	defer f.Close()
	for {
		buff, err := f.ReadLine()
		if err != nil {
			return
		}
		fmt.Println(string(buff))
	}
}
