"use strict";
var sinon = require('sinon');
var assert = require('chai').assert;
var Logger = require('logger-ro');
var logger = new Logger();
var api = require('../server.js');

/**
 * @modules server api单元测试用例
 */
describe(" unit tests example", function(){
    /**
     * @description  测试组件module
     */
    describe("#test module", function(){
        /**
         * @static 测试 api方法  test_api()
         */
        it(".test_api() ok", function() {
            this.timeout(10000);
            logger.trace('start test  api.test_api OK');
            assert.equal(1,1)
        })
        xit(".test_api() fail", function() {
            this.timeout(10000);
            logger.trace('start test  api.test_api FAILED');
            assert.equal(1,2)
        })
    })
});