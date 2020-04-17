### Simple Chat System
 
author:nowindxdw@126.com (xiaodawei)


#### required:
- use ws npm for socket library: npm install --save ws
- basic chat functions:

1.Upon joinng a chat root, the server send back a list of the last 50 messages

2 send messages to all other connected users

3 receve messages from all other connected chat users 

- other:

    Profanity Filter 
    words txt:
    https://github.com/RobertJGabriel/Google-profanity-words/blob/master/list.txt replace word with *
   
    (not use npm package)
    
    chat commands:
    
    /popular  print most popular word been chatted the most only in last 5 second
    
    /stats   print how long the user logged in with string format "00d 00h 00m 00s"

#### useage 
run `node index.js` in terminal to run the chat client
run `node server.js` to run the chat server

#### design

1.use ws as simple websocket package 
2.use redis to record user info and messages
(use db to record user and messages is also OK to bigger chat system) 
3.use re to filter profanity
4.use redis timestamp key to record popular words
5.for just simple chat commands simple {if} can do well (for more commands we need command system)
6.user work flow :

- user open client: send uid to server
- user enter Name: bind name to uuid
- user send message: get message and do something else


#### Scaling concerns

For less than 1000 users, usually we can use pm2 to use more cpus to run sever.js.

For more user one VCS cannot support,bandwidth limit is also another problem,
we can use aliyun or other cloud production such as LBS or nginx to recevive more user requests,
as well we should upgrade redis to cluster . 

#### unittest
install:
npm install -D

usage:
```
npm test
```
result:
```
unit tests for utils

17 passing (59ms)
```


efficiency test:

1.run test with user1 and user2  
- server start OK
- connected to chat room OK
- enter name and send message Ok
- return chat history OK
- enter /stats [username] return OK
- enter /popular return OK
- profanity filter test OK


2.use Jmeter to run load test
- Jmeter test can be used to run load test(todo, not implement)

### list of NPM
- inquirer: chat room basic CLI
- ws :   websocket npm package as pointed
- logger-ro: print easy log to  debug , author : nowindxdw(yes me)
- config: use config file to run code
- js-yaml: js read yaml file to get config file
- ioredis: npm package to operate redis
- uuid: npm package to get unique user id 
- async: npm package to control sync or async process