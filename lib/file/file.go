package file

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

//File  文件
type File struct {
	file   *os.File
	writer *bufio.Writer
	read   *bufio.Reader
}

//OpenFile 打开文件
func OpenFile(path string) (file *File, err error) {
	file = new(File)
	file.file, err = os.OpenFile(path, os.O_RDWR|os.O_APPEND|os.O_CREATE, 0600)
	file.writer = bufio.NewWriter(file.file)
	file.read = bufio.NewReader(file.file)
	return
}

//Write 写文件
func (pointer *File) Write(body interface{}) (err error) {
	buff, err := json.Marshal(body)
	//buff, err := json.MarshalIndent(body, "", "    ")
	fmt.Fprintln(pointer.writer, string(buff))
	return
}

//Save 读写
func (pointer *File) Save() (err error) {
	err = pointer.writer.Flush()
	return
}

//ReadJSON 读一行json
func (pointer *File) ReadJSON(body interface{}) (err error) {
	buff, _, err := pointer.read.ReadLine()
	if err != nil {
		return err
	}
	err = json.Unmarshal(buff, body)
	return err
}

//ReadLine 读一行
func (pointer *File) ReadLine() ([]byte, error) {
	buff, _, err := pointer.read.ReadLine()
	if err != nil {
		return nil, err
	}
	return buff, err
}

//Close 关闭
func (pointer *File) Close() {
	pointer.file.Close()
}

//GetDirFileName 获取路径下所有文件名称
func GetDirFileName(dir string) (names []string) {
	files, _ := ioutil.ReadDir(dir)
	for _, file := range files {
		if !file.IsDir() {
			names = append(names, file.Name())
		}
	}
	return
}

//MakeDir 创建文件夹
func MakeDir(path string) error {
	return os.Mkdir(path, os.ModePerm)
}

//DelFile 删除文件
func DelFile(path string) {
	os.Remove(path)
}
