const ROUTES = require('./routes');

/**
 * 用户消息处理
 * @param connection
 * @param route
 * @param data
 * @returns {Promise.<{code, route, data}|*>}
 */
module.exports = async function (connection, route, data) {
    let serve = connection.serve, uuid = connection.uuid;

    switch (route) {
        case ROUTES.C2S_LOGIN: {
            if (serve.has(data.name)) {
                return s_reply(ROUTES.S2C_LOGIN, 101);
            }
            //绑定uuid
            serve.bind(connection, data.name);
            //加入默认世界频道
            serve.channel.join(uuid);

            let caches = serve.channel.getCaches();

            return s_reply(ROUTES.S2C_LOGIN, 0, {name: data.name, caches});
        }
        case ROUTES.C2S_CHAT: {
            let stamp = Date.now(), name = connection.name, content = data.content;
            serve.channel.pushMessage(ROUTES.BROADCAST_CHAT, {
                name, content, stamp
            }, uuid);
            //设置消息缓存列表
            serve.channel.setCaches(name, content, stamp);
            //添加单词统计
            serve.statistics.addMessage(content, stamp);

            return s_reply(ROUTES.S2C_CHAT, 0);
        }
    }

    return s_reply(ROUTES.S2C_ERROR_ROUTE, 0);
};


function s_reply(route, code, data = null) {
    return {code, route, data};
}