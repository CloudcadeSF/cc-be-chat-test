const WebSocket = require('ws');
const Logger = require('logger-ro');
const WebSocketServer = WebSocket.Server;
const jsyaml = require('js-yaml');
const config = require("config");
const _= require('lodash')
const async = require('async')
let serverConfig = config.get("server");
let logConfig = config.get("logger");
let redisConfig = config.get("redis");
let msgConfig = config.get('msg')
let profanity = config.get('profanity')

// add global var
global.__redisConfig = redisConfig;
global.__logConfig = logConfig;



const tool = require('./utils/tool.js')
const cache = require('./utils/redis.js')

// use global dict to store profanity query fast than list
tool.readFile(profanity,function(err,data){
    var list_profanity = data.split("\n")
    var profanity_dict = {}
    for(var i=0;i<list_profanity.length;i++){
        if(!_.isEmpty(list_profanity[i])){
            profanity_dict[list_profanity[i]] = 1
        }
    }
    global.__profanity_dict = profanity_dict
})

const logger = new Logger(logConfig);

const wss = new WebSocketServer({
    host: serverConfig.host,
    port: serverConfig.port
});


const bindName = function(uuid,name){
      let bind_key = "bind:"+uuid
      let name_key = "uuid:"+name
      cache.setStringKey(bind_key,name,-1)
      cache.setStringKey(name_key,uuid,-1)
}

const getNameByUUID = function(uuid,callback){
      let bind_key = "bind:"+uuid
      cache.getStringKey(bind_key,function(err,data){
        callback(err,data)
      })
}

const getUUIDByName = function(name,callback){
      let name_key = "uuid:"+name
      cache.getStringKey(name_key,function(err,data){
        callback(err,data)
      })
}
const recordMsg = function(msg,callback){
    let msg_key = "msg_record_list"
    cache.llen(msg_key,function(err,len){
        if(len >=msgConfig.max_history) {
            cache.rpop(msg_key)
        }
        cache.lpush(msg_key,msg)
        callback()
    })
}


const getHistoryMsg = function(callback){
    let msg_key = "msg_record_list"
    let msg_len = msgConfig.show_len
    cache.lrange(msg_key,0,msg_len,function(err,data){
        callback(err,data)
    })
}


const clearClientSession= function(uuid){
    let log_key = "log:"+uuid
    let bind_key = "name:"+uuid
    cache.delStringKey(log_key)
    cache.delStringKey(bind_key)
    getNameByUUID(uuid,function(err,name){
        let name_key = "uuid:"+name
        cache.delStringKey(name_key)
    })
}

const getLoginTime = function(name,callback){
    getUUIDByName(name,function(err, uuid){
        let log_key = "log:"+uuid
        cache.getStringKey(log_key,function(err,timestamp){
            if(_.isNull(timestamp)){
                callback(err,"00d 00h 00m 00s")
            }else{
                var timestr = tool.getdeltatime(timestamp)
                callback(err,timestr)
            }
        })
    })
}


const record_popular_word = function(word){
    let timestamp = tool.getNowTimeStamp()
    let secStamp = Math.floor(timestamp/1000)
    cache.lpush(secStamp,word)
    cache.expire(secStamp,msgConfig.popular_second*2)
}

const get_popular_word = function(callback){
    let timestamp = tool.getNowTimeStamp()
    let secStamp = Math.floor(timestamp/1000)
    let totalWords = []
    let keylist = []
    let count_result = []
    for(let i=0;i<msgConfig.popular_second;i++){
        keylist.push(secStamp-i)
    }
    async.map(keylist,
        function(item, callback) {
            cache.lrange(item,0,-1,function(err,words){
                    totalWords = totalWords.concat(words)
//                  logger.debug(words)
                    callback(null,words);
            })
        }, function(err,results) {
//         logger.trace(totalWords)
           count_result = tool.getPopularWords(totalWords)
//         logger.debug(count_result)
           callback (null,count_result)
    });
}

const filter_message = function(message){
    let words = tool.convert_to_words(message)
    for(let i=0;i<words.length;i++){
        if (__profanity_dict[words[i]] == 1){
            let replacestr = new Array(words[i].length + 1).join('*');
             message = message.replace(new RegExp(words[i],'g'),replacestr)
        }else{
            record_popular_word(words[i])
        }
    }
    return message
}


const messageHandler = function(ws, uuid, message, callback){
    logger.trace (`[messageHandler] Received: ${message}`);
    //get command
    if(message.indexOf("@@commond_register_")===0){
        name = message.split("_")[2]
        logger.trace(name)
        bindName(uuid,name)
        getHistoryMsg(function(err,historyMsgs){
            logger.trace(`historyMsgs:${historyMsgs}`)
            if(!_.isEmpty(historyMsgs)){
                ws.send(`historys:\n${historyMsgs.join('\n')}`)
            }
            callback(null,`user:${name} bind uuid:${uuid} OK`)
        })
    }else if (message == "/popular"){
        get_popular_word(function(err,popular_words){
            ws.send(popular_words.join("\n"))
        })
    }else if (message.indexOf("/stats")===0 ){
        let username = message.split("/stats")[1].trim()
        getLoginTime(username,function(err,data){
             ws.send(data)
        })
    }else {
        // filter Profanity words and record popular words
        message = filter_message(message)
//        logger.debug(message)
        if(!_.isEmpty(message)){
            // record msg
            getNameByUUID(uuid,function(error,name){
                let send_msg = `${name}:${message}`
                recordMsg(send_msg,function(err,resualt){
                    // send message to others (exclude itself)
                    wss.clients.forEach(function each(client) {
                          if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(send_msg);
                          }
                    })
                })
            })
        }
    }
}

const recordLogin = function(uuid,callback){
    let log_key = "log:"+uuid
    cache.getStringKey(log_key,function(err,data){
        if(err){
            callback(err)
        }
        else{
            if(_.isNull(data)){
                cache.setStringKey(log_key,tool.getNowTimeStamp(),-1)
                callback(null,"uuid log at"+tool.getNowTimeStamp())
            }else{
                callback(null,"uuid exists")
            }
        }
    })
}


wss.on('connection', function (ws,req) {
    let url = req.url
    let uuid = url.replace("/","")
    logger.trace(`[SERVER] client id=${uuid}  connection()`);
    recordLogin(uuid,function(error,res){
         // close event
        logger.trace(res)
        ws.on("close", function() {
            logger.info(`client id=${uuid}  close`);
            clearClientSession(uuid)
        });
        // error event
        ws.on("error", function(err) {
            logger.error(`client id=${uuid} err:${err}`);
            clearClientSession(uuid)
        });
        // message event
        ws.on('message', function (message) {
            logger.debug(`[SERVER] Received: ${message}`);
            //only string msg can be handled:
            if(_.isString(message)){
                messageHandler(ws,uuid,message,function(err,result){
                    if(err){
                        logger.error(err)
                    }
                    logger.info(result)
                })
            }
        })
    })

});

