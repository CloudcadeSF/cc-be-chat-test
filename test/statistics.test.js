const test = require('ava');
const Statistics = require('../libs/net/components/statistics');
const {WORD_STAMP, WORD_SYMBOLS} = require('../libs/net/consts');
let component = new Statistics(null);

test('good', async t => {
    let stamp = Date.now();
    component.messages = [];
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);

    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);

    component.addMessage('world', stamp);
    component.addMessage('world', stamp);

    component.addMessage('test', stamp);
    let str = component.calculate();
    t.is(str, 'good');
});

test('hello,good', async t => {
    let stamp = Date.now();
    component.messages = [];
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);

    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);

    component.addMessage('world', stamp);
    component.addMessage('world', stamp);

    component.addMessage('test', stamp);
    let str = component.calculate();
    t.is(str, 'hello,good');
});

test('multiple words', async t => {
    let stamp = Date.now();
    component.messages = [];
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);
    component.addMessage('good', stamp);

    component.addMessage('hello world', stamp);
    component.addMessage('hello world', stamp);
    component.addMessage('hello world', stamp);

    component.addMessage('world', stamp);
    component.addMessage('world', stamp);

    component.addMessage('test', stamp);
    let str = component.calculate();
    t.is(str, 'world');
});

test('WORD_SYMBOLS', async t => {
    let stamp = Date.now();
    component.messages = [];
    component.addMessage('!', stamp);
    component.addMessage('!', stamp);
    component.addMessage('!', stamp);
    component.addMessage('!', stamp);

    component.addMessage('hello world', stamp);

    component.addMessage('world', stamp);
    component.addMessage('world', stamp);

    component.addMessage('test', stamp);
    let str = component.calculate();
    t.is(str, 'world');
});

test('expire word', async t => {
    let stamp = Date.now();
    component.messages = [];
    component.addMessage('good', stamp - WORD_STAMP * 2);
    component.addMessage('good', stamp - WORD_STAMP * 2);
    component.addMessage('good', stamp - WORD_STAMP * 2);
    component.addMessage('good', stamp - WORD_STAMP * 2);

    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);
    component.addMessage('hello', stamp);

    component.addMessage('world', stamp);
    component.addMessage('world', stamp);

    component.addMessage('test', stamp);
    let str = component.calculate();
    t.is(str, 'hello');
});