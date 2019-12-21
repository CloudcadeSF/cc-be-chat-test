const inquirer = require('inquirer');
const WSC = require('./libs/net/client');
const handler = require('./domain/clientHandler');
const configs = require('./configs/server.json');
const ROUTES = require('./domain/routes');

let client = new WSC(configs.host, configs.port);

const run = async() => {
    let ok = await client.connect(handler);
    if (ok == false) {
        return console.warn('connect server failed.');
    }
    const answers = await askName();
    client.notify(ROUTES.C2S_LOGIN, {name: answers.name});
};

const askName = async () => {
    const questions = [{
        name: "name",
        type: "input",
        message: "Enter your name:"
    }];

    let answers = await inquirer.prompt(questions);
    if (!!answers.name) {
        return answers;
    }
    return await askName();
};

run();

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});