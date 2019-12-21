const test = require('ava');
const Server = require('../libs/net/server');
const Client = require('../libs/net/client');

const connectionHandler = require('../domain/connectionHandler');
const serveHandler = require('../domain/serveHandler');
const configs = require('../configs/server.json');


test('/popular', async t => {
    t.plan(2);

    let serve = new Server(configs.host, configs.port);
    let ok = await serve.startUp(connectionHandler);
    if (ok == false) {
        t.pass();
    }
    let cmd = '/popular';
    t.is(serve.statistics.calculate(), '');

    await serveHandler(serve, {cmd});

    let stamp = Date.now();
    serve.messages = [];
    serve.statistics.addMessage('good', stamp);
    serve.statistics.addMessage('good', stamp);
    serve.statistics.addMessage('good', stamp);
    serve.statistics.addMessage('good', stamp);

    serve.statistics.addMessage('hello', stamp);
    serve.statistics.addMessage('hello', stamp);
    serve.statistics.addMessage('hello', stamp);
    serve.statistics.addMessage('hello', stamp);

    serve.statistics.addMessage('world', stamp);
    serve.statistics.addMessage('world', stamp);

    serve.statistics.addMessage('test', stamp);

    await serveHandler(serve, {cmd});

    t.is(serve.statistics.calculate(), 'hello,good');
});