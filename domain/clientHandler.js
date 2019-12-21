const inquirer = require('inquirer');
const ROUTES = require('./routes');
let {d_formats} = require('../libs/utils');

/**
 * 客户端消息处理
 * @param client
 * @param route
 * @param msg
 * @returns {Promise.<*>}
 */
module.exports = async function (client, route, msg) {
    let code = msg.code, data = msg.data;
    switch (route) {
        case ROUTES.S2C_LOGIN: {
            if (code == 101) {
                const answers = await askName();
                return client.notify(ROUTES.C2S_LOGIN, {name: answers.name});
            }
            console.log('user bind name=%s', data.name);
            client.bind(data.name);

            data.caches.forEach((cache) => {
                cache.content = client.shield.filter(cache.content);
                console.log('History message time:%s,name=%s,content:%s', d_formats(cache.stamp), cache.name, cache.content);
            });

            return await switchChat(client);
        }
        case ROUTES.BROADCAST_CHAT: {
            data.content = client.shield.filter(data.content);
            console.log('Receive message time:%s,name=%s,content:%s', d_formats(data.stamp), data.name, data.content);
            break;
        }
    }
};

const askName = async() => {
    const questions = [{
        name: "name",
        type: "input",
        message: "The name already exists, please re-enter:"
    }];
    let answers = await inquirer.prompt(questions);
    if (!!answers.name) {
        return answers;
    }
    return await askName();
};

const askChat = async() => {
    const questions = [{
        name: "content",
        type: "input",
        message: "Please enter chat content:"
    }];
    let answers = await inquirer.prompt(questions);
    if (!!answers.content) {
        return answers;
    }
    return await askChat();
};

const switchChat = async(client) => {
    const answers = await askChat();
    let content = answers.content;
    if (content === '/exit') {
        return client.close();
    }
    client.notify(ROUTES.C2S_CHAT, {content});
    console.log('Send message time:%s,me=%s,content:%s', d_formats(Date.now()), client.name, client.shield.filter(content));


    return switchChat(client);
};