package recover

import (
	"fmt"
	"runtime/debug"
)

//Recover  Recover
func Recover(v ...interface{}) {
	if err := recover(); err != nil {
		if len(v) > 0 {
			s := fmt.Sprintln(v...)
			fmt.Printf("recover err %s : \n", err)
			fmt.Printf("%s\n%s\n", s, string(debug.Stack()))
		} else {
			fmt.Printf("v : %v\n", err)
			fmt.Printf("%s\n", string(debug.Stack()))
		}
	}
}
