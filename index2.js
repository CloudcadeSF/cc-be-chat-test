const inquirer = require('inquirer');
const WebSocket = require('ws');
const Logger = require('logger-ro');
const jsyaml = require('js-yaml');
const config = require("config");
const _ = require("lodash")
const logConfig = config.get("logger");
const serverConfig = config.get("server");
const logger = new Logger(logConfig);
const tool = require('./utils/tool.js')

// every client has it's  uuid
let uuid = tool.genUUID()
logger.trace(uuid)
let ws_url = `ws://${serverConfig.host}:${serverConfig.port}/${uuid}`
logger.trace(ws_url)
let ws = new WebSocket(ws_url);

const run = async () => {
  ws.on('open', function () {
    logger.trace(`[CLIENT] uuid=${uuid} open()`);
  });

  // receive msg:
  ws.on('message', function (message) {
    logger.debug(`[CLIENT] Received: ${message}`);
    console.log(message);
  })
  let need_name = true
  let name_string =""
  while(need_name){
        const { name } = await askName();
        if(!_.isEmpty(name)){
            need_name = false
            name_string = name
        }
  }
  ws.send(`@@commond_register_${name_string}`);
  while (true) {
    const answers = await askChat();
    const { message } = answers;
    if(message.trim().length>0){
        console.log(`${name_string}: `, message);
        ws.send(`${message}`);
    }
  }
};

const askChat = () => {
  const questions = [
    {
      name: "message",
      type: "input",
      message: "Enter chat message:"
    }
  ];
  return inquirer.prompt(questions);
};

const askName = () => {
  const questions = [
    {
      name: "name",
      type: "input",
      message: "Enter your name:"
    }
  ];
  return inquirer.prompt(questions);
};

run();
