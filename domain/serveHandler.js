let {d_today} = require('../libs/utils');

/**
 * Serve命令处理
 * @param serve
 * @param data
 * @returns {Promise.<void>}
 */
module.exports = async function (serve, data) {
    let params = (data.cmd || '').split(' ');
    let cmd = params[0];
    switch (cmd) {
        case '--help': {
            console.log('/popular');
            console.log('/stats `username`');
            break;
        }
        case '/popular': {
            console.log('/popular:%s', serve.statistics.calculate());
            break;
        }
        case '/stats': {
            let args = params.slice(1) || [];
            if (args.length == 0) {
                console.log('please input username!');
                break;
            }
            let name = args[0];
            let connection = serve.getConnection(name);
            if (!connection) {
                console.log('The username not exists!');
                break;
            }
            let mill = Date.now() - connection.stamp;
            console.log('%s online duration %s', name, d_today(mill));
            break;
        }
        default: {
            console.log('command [%s] is error!', cmd)
        }
    }
};