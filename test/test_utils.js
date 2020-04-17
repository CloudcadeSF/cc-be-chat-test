"use strict";
var sinon = require('sinon');
var assert = require('chai').assert;
var Logger = require('logger-ro');
var config = require('config')

let logConfig = config.get("logger");
let redisConfig = config.get("redis");
// add global var
global.__redisConfig = redisConfig;
global.__logConfig = logConfig;

var logger = new Logger(__logConfig);
var api = require('../utils/redis.js');
var tool  = require('../utils/tool.js');
/**
 * @modules server api单元测试用例
 */
describe(" unit tests for utils", function(){
    /**
     * @description  测试组件module
     */
    describe("#test reids", function(){


            /**
         * @static 测试 api方法  test_api()
         */
        it(".getStringKey()", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.getStringKey');
            api.getStringKey('key123456',function(err,data){
                logger.debug(data)
                assert.equal(data,null)
                done()
            })
        })
        /**
         * @static 测试 api方法  setStringKey()
         */
        it(".setStringKey()", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.setStringKey');
            api.setStringKey('testKey1','123',500)
            api.getStringKey('testKey1',function(err,data){
                logger.debug(data)
                assert.equal(data,'123')
                done()
            })
        })
        /**
         * @static 测试 api方法  setStringKey() with out expire time
         */
        it(".setStringKey() expire time <0 ", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.setStringKey');
            api.setStringKey('testKey2','123',-1)
            api.getStringKey('testKey2',function(err,data){
                logger.debug(data)
                assert.equal(data,'123')
                done()
            })
        })

        it(".del() ", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.del()');
            api.setStringKey('testdelkey','123',-1)
            api.delStringKey('testdelkey')
            api.getStringKey('testdelkey',function(err,data){
                logger.debug(data)
                assert.equal(data,null)
                done()
            })

        })
        it(".llen() ", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.llen()');
            api.llen('test_empty_list',function(err,data){
                logger.debug(data)
                assert.equal(data,'0')
                done()
            })
        })

        it(".lpush() ", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.lpush()');
            api.lpush('test_lpush',"a")
            api.llen('test_lpush',function(err,data){
                logger.debug(data)
                assert.notEqual(data,0)
                done()
            })
        })

        it(".lrange() ", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.lrange()');
            api.lpush('test_lpush',"b")
            api.lrange('test_lpush',0,2,function(err,data){
                logger.debug(data)
                assert.notEqual(data,null)
                done()
            })
        })
        it(".rpop() ", function(done) {
            this.timeout(1000);
            logger.trace('start test redis.rpop()');
            api.rpop('test_lpush')
            api.lrange('test_lpush',0,2,function(err,data){
                logger.debug(data)
                assert.notEqual(data,null)
                done()
            })
        })
        it(".expire() ", function() {
            this.timeout(1000);
            logger.trace('start test redis.expire()');
            api.expire('test_lpush',999)
            assert.notEqual([],null)
        })
    })
    describe("#test tool", function(){
         /**
         * @static 测试 tool方法  genUUID()
         */
        it(".genUUID()", function() {
            this.timeout(1000);
            logger.trace('start test tool.genUUID');
            var uuid = tool.genUUID()
            logger.debug(uuid)
            assert.notEqual(uuid,null)
        })
                      /**
         * @static 测试 tool方法  getNowTimeStamp()
         */
        it(".getNowTimeStamp()", function() {
            this.timeout(1000);
            logger.trace('start test tool.getNowTimeStamp');
            var timestamp = tool.getNowTimeStamp()
            logger.debug(timestamp)
            assert.notEqual(timestamp,null)
        })

        /**
         * @static 测试 tool方法  padNum()
         */
        it(".padNum()", function() {
            this.timeout(1000);
            logger.trace('start test tool.padNum');
            for(var i=0;i<10;i++){
                logger.debug(i)
                logger.debug(tool.padNum(i))
            }
            assert.notEqual(i,null)
        })


        it(".getdeltatime()", function() {
            this.timeout(1000);
            logger.trace('start test tool.getdeltatime');
            var timstamp = 1587106363963  //2020-04-17 14:52:43
            var str = tool.getdeltatime(timstamp)
            logger.debug(str)
            assert.notEqual(str,null)
        })


        it(".readFile()", function(done) {
            this.timeout(2000);
            logger.trace('start test tool.readFile');
            var file = 'utils/profanity.txt'
            tool.readFile(file,function(err,data){
                logger.debug(data.length)
                assert.notEqual(data.length,null)
                done()
            })
        })
        it(".getPopularWords()", function() {
            this.timeout(2000);
            logger.trace('start test tool.getPopularWords');
            var words = ["ab","a","a","abc","a","a","a1","a1","abc","abc","a","abc","ab","cd","cd","cd","cd","cd"]
            var result = tool.getPopularWords(words)
            logger.debug(result)
            assert.notEqual(result.length,0)

        })

        it(".convert_to_words()", function() {
            this.timeout(2000);
            logger.trace('start test tool.convert_to_words');
            var string = "In the response, the evidence Profile element contains the sources for the evidence  and is unique to the Watson pipeline for which it was configured. The evidence passage and related information is contained in the evidence section."
            var result = tool.convert_to_words(string)
            logger.debug(result)
            assert.notEqual(result.length,0)

        })
    })
});