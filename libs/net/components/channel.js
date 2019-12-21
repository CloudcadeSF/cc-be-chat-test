const {CACHE_SIZE} = require('./../consts');

/**
 * 频道
 * @type {Channel}
 */
module.exports = class Channel {
    constructor(serve) {
        this.serve = serve;
        //频道列表
        this.channles = new Map();  //name=>channel
    }

    /**
     * 加入频道
     * @param uuid
     * @param channel_name
     */
    join(uuid, channel_name = 'world') {
        let channel = this.channles.get(channel_name);
        if (!channel) {
            channel = new ChatChannel(channel_name, CACHE_SIZE);
            this.channles.set(channel_name, channel);
        }
        channel.addMember(uuid);
    }

    /**
     * 离开频道
     * @param uuid
     * @param channel_name
     */
    leave(uuid, channel_name = 'world') {
        let channel = this.channles.get(channel_name);
        if (!!channel) {
            channel.removeMember(uuid);
        }
    }

    /**
     * 推送消息
     * @param route
     * @param data
     * @param uuid
     * @param channel_name
     */
    pushMessage(route, data, uuid = -1, channel_name = 'world') {
        let channel = this.channles.get(channel_name);
        if (!!channel) {
            for (let id of channel.members.values()) {
                let connection = this.serve.getClient(id);
                if (id != uuid && !!connection) {
                    connection.send(route, {code: 0, data});
                }
            }
        }
    }

    /**
     * 获取CHANNEL
     * @param channel_name
     * @returns {V}
     */
    getChannel(channel_name = 'world'){
        return this.channles.get(channel_name);
    }

    /**
     * 设置频道缓存信息
     * @param name
     * @param content
     * @param stamp
     * @param channel_name
     */
    setCaches(name, content, stamp, channel_name = 'world') {
        let channel = this.channles.get(channel_name);
        if (!!channel) {
            channel.setCaches(name, content, stamp);
        }
    }

    /**
     * 获取缓存列表
     * @param channel_name
     * @returns {Array}
     */
    getCaches(channel_name = 'world') {
        let channel = this.channles.get(channel_name);
        if (!!channel) {
            return channel.cash_messages;
        }
        return [];
    }
};

/**
 * 聊天频道
 */
class ChatChannel {
    constructor(name, cash_size) {
        //频道名称
        this.name = name;
        //频道成员
        this.members = new Set();
        //频道消息缓存数量
        this.cash_size = cash_size;
        //消息缓存列表
        this.cash_messages = [];
    }

    /**
     * 用户是否存在
     * @param uuid
     * @returns {boolean}
     */
    has(uuid) {
        return this.members.has(uuid);
    }

    /**
     * 添加用户
     * @param uuid
     */
    addMember(uuid) {
        this.members.add(uuid);
    }

    /**
     * 删除用户
     * @param uuid
     */
    removeMember(uuid) {
        this.members.delete(uuid);
    }

    /**
     * 设置缓存消息
     * @param name
     * @param content
     * @param stamp
     */
    setCaches(name, content, stamp) {
        if (this.cash_messages.length >= this.cash_size) {
            this.cash_messages.splice(0, 1);
        }
        this.cash_messages.push({name, content, stamp});
    }
}