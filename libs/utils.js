const path = require('path');
const letters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function s_callback(cb, data = null) {
    if (!!cb && typeof cb === 'function') {
        return cb(data);
    }
}

function r_number(max, min = 0) {
    return Math.floor(Math.random() * max) + min;
}

function r_str(length) {
    let str = '', max = letters.length;
    for (let i = 0; i < length; i++) {
        str += letters[r_number(max)];
    }
    return str;
}

function basepath(name = '') {
    let base = path.dirname(require.main.filename);
    if (name == '') {
        return base;
    }
    return path.join(base, name);
}

function co(cb) {
    return new Promise((resolve) => {
        cb((code, data) => {
            resolve({code, data});
        });
    });
}

function d_format(stamp = Date.now()) {
    let date = new Date(stamp);
    return date.getFullYear() + '-' + complete(date.getMonth() + 1) + '-' + complete(date.getDate()) + ' ' + complete(date.getHours()) + ':' + complete(date.getMinutes()) + ':' + complete(date.getSeconds());
}
function d_formats(stamp = Date.now()) {
    let date = new Date(stamp);
    return complete(date.getHours()) + ':' + complete(date.getMinutes()) + ':' + complete(date.getSeconds());
}

function complete(value) {
    if (value >= 10) {
        return value;
    }
    return '0' + value;
}

function d_today(mill) {
    let day = ~~(mill / 86400000);
    mill = mill % 86400000;
    let hour = ~~(mill / 3600000);
    mill = mill % 3600000;
    let minute = ~~(mill / 60000);
    mill = mill % 60000;
    let second = ~~(mill / 1000);
    return complete(day) + 'd ' + complete(hour) + 'h ' + complete(minute) + 'm ' + complete(second) + 's';
}

function wait(mill) {
    return new Promise((resolve) => {
        setTimeout(async() => {
            resolve();
        }, mill || 1000);
    });
}

module.exports = {basepath, co, d_format, d_formats, d_today, r_str, r_number, s_callback, wait};