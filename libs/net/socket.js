const emitter = require('events').EventEmitter;
const Receptor = require('./receptor');
let {r_str} = require('../utils');

/**
 * WS-Socket
 * @type {WSSocket}
 */
module.exports = class WSSocket extends emitter {
    constructor() {
        super();
        this._socket_ = null;
        this._connected_ = false;
        //是否关闭
        this._closed_ = false;
        //消息解析器
        this._receptor_ = new Receptor();
        //唯一标识
        this.uuid = r_str(8);
        //用户绑定标识
        this.name = '';
    }

    /**
     * 绑定用户
     * @param name
     */
    bind(name) {
        this.name = name
    }

    /**
     * 初始化
     * @param socket
     */
    init(socket) {
        this._connected_ = true;
        this._closed_ = false;
        this._socket_ = socket;

        //监听原始Socket事件
        this.onSocket('open', () => {
            this.emit('open');
        });
        this.onSocket('message', (data) => {
            this.receive(data);
        });
        this.onSocket('close', (data) => {
            this._connected_ = false;
            this._closed_ = true;
            this.emit('close', data);
        });
        this.onSocket('error', (err) => {
            this.emit('error', err);
        });

        //监听消息解析器消息事件
        this._receptor_.on('message', (data) => {
            this.emit('data', data);
        });
    }

    /**
     * 监听Socket原始事件
     * @param event_name
     * @param fn
     */
    onSocket(event_name, fn) {
        this._socket_.on(event_name, fn);
    }

    /**
     * 发送消息
     * @param route
     * @param data
     * @param sid
     */
    send(route, data, sid = -1) {
        let msg = this._receptor_.feed({sid, route, data});
        this._socket_.send(msg);
    }

    /**
     * 接收到服务器消息
     * @param data
     */
    receive(data) {
        this._receptor_.receive(data);
    }

    /**
     * 关闭链接
     */
    async close() {
        await this.dispose();

        this._socket_.close();
    }

    /**
     * 销毁
     */
    async dispose() {

    }
};