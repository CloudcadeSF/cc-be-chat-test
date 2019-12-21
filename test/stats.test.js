const test = require('ava');
const Server = require('../libs/net/server');
const Client = require('../libs/net/client');
const ROUTES = require('../domain/routes');

const connectionHandler = require('../domain/connectionHandler');
const serveHandler = require('../domain/serveHandler');
const clientHandler = require('../domain/clientHandler');
const configs = require('../configs/server.json');
const {wait} = require('../libs/utils');

test('/stats andy', async t => {

    let serve = new Server(configs.host, configs.port);
    let ok1 = await serve.startUp(connectionHandler);
    if (ok1 == false) {
        t.fail();
    }

    let client = new Client(configs.host, configs.port);
    let ok2 = await client.connect(clientHandler);
    if (ok2 == false) {
        t.fail();
    }
    client.notify(ROUTES.C2S_LOGIN, {name: 'andy'});

    let cmd = '/stats andy';
    await wait(5000);
    await serveHandler(serve, {cmd});

    t.pass();
});
