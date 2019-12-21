const inquirer = require('inquirer');
const WSS = require('./libs/net/server');
const connectionHandler = require('./domain/connectionHandler');
const serveHandler = require('./domain/serveHandler');
const configs = require('./configs/server.json');

const run = async() => {
    let serve = new WSS(configs.host, configs.port);
    let ok = await serve.startUp(connectionHandler);
    if (ok == true) {
        console.log('server listen on %d.', configs.port);
        while (true) {
            const answers = await askCommands();
            await serveHandler(serve, answers);
        }
        // process.exit();
    }
};

const askCommands = () => {
    const questions = [{
        name: "cmd",
        type: "input",
        message: "Enter command(--help print command line):"
    }
    ];
    return inquirer.prompt(questions);
};

run();

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});