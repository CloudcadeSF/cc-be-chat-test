'use strict';

const _ = require('lodash');
const Logger = require('logger-ro');
const logger = new Logger(__logConfig);
const Redis = require('ioredis')
const client =  new Redis(__redisConfig)
//client.auth(123456); //if set password for redis

module.exports = {
    /**
     * getStringKey
     * @param key
     * @param value
     * @param expired  -1 means no expire time
     * @returns
     */
    getStringKey:function(key,callback){
        client.get(key, function (err, data) {
            if(err){
              logger.error(err)
              callback(err)
            }else{
//              logger.debug(data)
              callback(null,data)
            }
        })
    },
    /**
     * setStringKey
     * @param key
     * @param value
     * @param expire <0 means no expire time
     * @returns No
     */
    setStringKey:function(key,value,expire){
        if(expire >0){
            client.set(key, value, 'EX', expire)
        }else{
            client.set(key, value)
        }
    },

    /**
     * delStringKey
     * @param key
     * @returns No
     */
    delStringKey:function(key){
        client.del(key)
    },

    /**
     * llen
     * @param key
     * @returns list length
     */
    llen:function(key,callback){
        client.llen(key,function(err,data){
            if(err){
              logger.error(err)
              callback(err)
            }else{
//              logger.debug(data)
              callback(null,data)
            }
        })
    },

    /**
     * lpush
     * add element to list
     * @param key
     * @returns No
     */
    lpush:function(key,value){
        client.lpush(key,value)
    },

    /**
     * lrange
     * get  element by index
     * @param key
     * @param start_index
     * @param end_index
     * @returns No
     */
    lrange:function(key,start_index,end_index,callback){
        client.lrange(key,start_index,end_index,function(err,data){
            if(err){
              logger.error(err)
              callback(err)
            }else{
//              logger.debug(data)
              callback(null,data)
            }
        })
    },
    /**
     * rpop
     * remove first element from list
     * @param key
     * @returns No
     */
    rpop:function(key){
        client.rpop(key)
    },

    /**
     * expire
     * add expire time for key
     * @param key
     * @param expire expiretime seconds
     * @returns No
     */
    expire:function(key,expire){
        client.expire(key,expire)
    },
}