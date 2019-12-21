const emitter = require('events').EventEmitter;

/**
 * 消息解析器
 * @type {Receptor}
 */
module.exports = class Receptor extends emitter {
    constructor() {
        super();
    }

    /**
     * 封装消息
     * @param msg
     * @returns {*}
     */
    feed(msg) {
        return JSON.stringify(msg);
    }

    /**
     * 接收消息
     * @param data
     */
    receive(data) {
        this.emit('message', JSON.parse(data));
    }
};