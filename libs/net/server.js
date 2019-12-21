const ws = require('ws');
const emitter = require('events').EventEmitter;
const WSConnection = require('./connection');
const Channel = require('./components/channel');
const Statistics = require('./components/statistics');

/**
 * WS服务
 * @type {WsServer}
 */
module.exports = class WsServer extends emitter {
    constructor(host, port) {
        super();

        this._host_ = host;
        this._port_ = port;
        //会话列表
        this._connections_ = new Map();   //id=>connection
        //用户绑定列表
        this._users_ = new Map();         //name=>id
        this._running_ = false;
        this._serve_ = null;
        this._handler_ = null;

        //频道管理
        this.channel = null;
        //单词统计
        this.statistics = null;
    }

    /**
     * 启动服务
     * @param handler
     * @returns {Promise.<boolean>}
     */
    async startUp(handler) {
        if (this._running_ == true) {
            return true;
        }

        try {
            if (typeof handler !== 'function') {
                throw new Error('handler must be a function!');
            }

            this._serve_ = new ws.Server({
                host: this._host_,
                port: this._port_
            });

            //频道
            this.channel = new Channel(this);
            //单词统计
            this.statistics = new Statistics(this);
            //绑定Handler
            this._handler_ = handler;

        } catch (ex) {
            console.error(ex);
            return false;
        }

        this._running_ = true;

        this._serve_.on('connection', (socket) => {
            this._listener_(socket);
        });

        return true;
    }

    /**
     * 用户名是否存在
     * @param name
     * @returns {boolean}
     */
    has(name) {
        return this._users_.has(name);
    }

    /**
     * 根据唯一标识获取会话
     * @param uuid
     * @returns {V}
     */
    getClient(uuid) {
        return this._connections_.get(uuid);
    }

    /**
     * 根据用户名获取会话
     * @param name
     * @returns {*}
     */
    getConnection(name) {
        let uuid = this._users_.get(name) || null;
        if(!uuid){
            return null;
        }
        return this._connections_.get(uuid);
    }

    /**
     * 绑定会话用户名
     * @param connection
     * @param name
     */
    bind(connection, name) {
        connection.bind(name);
        this._users_.set(name, connection.uuid);
    }

    /**
     * 监听会话
     * @param socket
     * @private
     */
    _listener_(socket) {
        let connection = new WSConnection(this, socket);
        this._connections_.set(connection.uuid, connection);
        console.log(`client id=%s is connect！`, connection.uuid);

        connection.on('close', async() => {
            //销毁资源
            await connection.dispose();

            //清理用户
            let uuid = connection.uuid, name = connection.name;
            this._users_.delete(name);
            this._connections_.delete(uuid);

            //离开频道
            this.channel.leave(uuid);

            console.log(`client id=%s is closed！`, uuid);
        });

        //监听消息
        connection.on('data', async(msg) => {
            let sid = msg.sid;
            //处理消息并回复
            let {code, route, data} = await this._handler_(connection, msg.route, msg.data);
            connection.send(route, {code, data}, sid);
        });
    }
};