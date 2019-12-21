const test = require('ava');
const Shield = require('../libs/net/components/shield');

test('anal', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('analanal');
    t.is(str, '********');
});

test('ass-fucker', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('ass-fucker');
    t.not(str, 'ass-fucker');
});

test('a_s_s', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('a_s_s');
    t.not(str, 'a_s_s');
});

test('bi+ch', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('bi+ch');
    t.not(str, 'bi+ch');
});

test('blow job', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('blow job');
    t.not(str, 'blow job');
});

test('cock-sucker', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('cock-sucker');
    t.not(str, 'cock-sucker');
});

test('f u c k e r', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('f u c k e r');
    t.not(str, 'f u c k e r');
});

test('masterbat*', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('masterbat*');
    t.not(str, 'masterbat*');
});

test('s.o.b.', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('s.o.b.');
    t.not(str, 's.o.b.');
});

test('sh!+', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('sh!+');
    t.not(str, 'sh!+');
});

test('shi+', async t => {
    let component = new Shield();
    await component.init();
    let str = component.filter('shi+');
    t.not(str, 'shi+');
});