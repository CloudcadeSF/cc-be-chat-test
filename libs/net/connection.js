const WSSocket = require('./socket');

/**
 * Session会话连接
 * @type {WSConnection}
 */
module.exports = class WSConnection extends WSSocket {
    constructor(serve, socket) {
        super();

        this.serve = serve;
        //登录时间
        this.stamp = Date.now();

        this.init(socket);
    }

    /**
     * 回复消息
     * @param code
     * @param route
     * @param data
     * @returns {*}
     */
    reply(code, route, data = null) {
        return this.send(route, {code, data});
    }
};