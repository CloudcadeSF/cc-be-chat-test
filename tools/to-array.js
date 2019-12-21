const fs = require('fs');
const readline = require('readline');
const {basepath} = require('../libs/utils');

async function run() {
    let words = [];
    let ok = await new Promise((resolve) => {
        let filename = basepath('../tools/word.txt');
        let fr = fs.createReadStream(filename);
        let rl = readline.createInterface({
            input: fr
        });
        rl.on('line', (word) => {
            words.push(word);
        });
        rl.on('close', () => {
            resolve(true);
        });
    });

    if (ok == false) {
        return console.log('to array failed!');
    }
    let filename = basepath('../configs/words.json');
    fs.writeFileSync(filename, JSON.stringify(words));
    console.log('to array success!');
}

run();