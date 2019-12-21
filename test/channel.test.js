const test = require('ava');
const Channel = require('../libs/net/components/channel');
const {CACHE_SIZE} = require('../libs/net/consts');
let component = new Channel(null);

test('join member', async t => {
    component.join(1);
    component.join(2);
    let channel = component.getChannel();
    t.is(channel.members.size, 2);
});

test('leave member', async t => {
    component.join(1);
    component.join(2);
    component.join(3);
    component.join(4);

    component.leave(2);
    component.leave(4);

    let channel = component.getChannel();
    t.is(channel.members.size, 2);
});

test('set cache', async t => {
    let stamp = Date.now();
    component.setCaches('andy', 'message1', stamp);
    component.setCaches('andy2', 'message2', stamp);
    component.setCaches('andy', 'message3', stamp);
    component.setCaches('andy', 'message4', stamp);
    component.setCaches('andy2', 'message5', stamp);
    component.setCaches('andy3', 'message6', stamp);

    let channel = component.getChannel();
    t.is(channel.cash_messages.length, 6);
});


test('get cache', async t => {
    let stamp = Date.now();
    for (let i = 0; i < CACHE_SIZE + 10; i++) {
        component.setCaches('andy', 'message' + i, stamp);
    }

    let channel = component.getChannel();
    t.is(channel.cash_messages.length, 6);
});