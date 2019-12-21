const WS = require('ws');
const WSSocket = require('./socket');
const Shield = require('./components/shield');

/**
 * WS客户端
 * @type {WSClient}
 */
module.exports = class WSClient extends WSSocket {
    constructor(host, port) {
        super();

        this._host_ = host;
        this._port_ = port;
        //消息处理Handler
        this._handler_ = null;
        //消息号
        this._sid_ = 0;

        //敏感词过滤器
        this.shield = null;
    }

    /**
     * 连接服务器
     * @param handler
     * @returns {Promise.<*>}
     */
    async connect(handler) {
        if (this._connected_ == true) {
            return true;
        }
        //绑定Handler
        this._handler_ = handler;

        //初始过滤器
        this.shield = new Shield();
        await this.shield.init();

        return new Promise((resolve) => {
            let socket = new WS('ws://' + this._host_ + ':' + this._port_);
            this.init(socket);

            this.on('open', () => {
                resolve(true);
            });
            this.on('error', () => {
                resolve(false);
            });
            this.on('data', (msg) => {
                //处理消息
                this._handler_(this, msg.route, msg.data);
            });
            this.on('close', (data) => {
                //SOCKET断开退出进程
                process.exit();
            });
        });
    }

    /**
     * 发送消息
     * @param route
     * @param data
     */
    notify(route, data) {
        let sid = this._sid_++;
        this.send(route, data, sid);
    }
};