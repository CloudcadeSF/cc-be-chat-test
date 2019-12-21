const test = require('ava');
const Server = require('../libs/net/server');
const Client = require('../libs/net/client');
const ROUTES = require('../domain/routes');

const connectionHandler = require('../domain/connectionHandler');
const serveHandler = require('../domain/serveHandler');
const clientHandler = require('../domain/clientHandler');
const configs = require('../configs/server.json');
const {wait} = require('../libs/utils');

test('/chat', async t => {
    let serve = new Server(configs.host, configs.port);
    let ok = await serve.startUp(connectionHandler);
    if (ok == false) {
        t.fail();
    }

    let client1 = new Client(configs.host, configs.port);
    let ok1 = await client1.connect(clientHandler);
    if (ok1 == false) {
        t.fail();
    }
    client1.notify(ROUTES.C2S_LOGIN, {name: 'andy1'});
    await wait(1000);

    await wait(100);
    client1.notify(ROUTES.C2S_CHAT, {content:'andy1 send chat1'});
    await wait(100);
    client1.notify(ROUTES.C2S_CHAT, {content:'andy1 send chat2'});

    let client2 = new Client(configs.host, configs.port);
    let ok2 = await client2.connect(clientHandler);
    if (ok2 == false) {
        t.fail();
    }
    client2.notify(ROUTES.C2S_LOGIN, {name: 'andy2'});
    await wait(100);
    client2.notify(ROUTES.C2S_CHAT, {content:'andy2 send chat3'});

    let cmd = '/stats andy1';
    await wait(2000);
    await serveHandler(serve, {cmd});

    t.pass();
});
