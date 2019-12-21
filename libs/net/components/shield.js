const fs = require('fs');
const WORDS = require('../../../configs/words.json');

/**
 * 敏感词过滤
 * @type {WordShield}
 */
module.exports = class WordShield {
    constructor() {
        this._words_ = [];
        // this._joins_ = '';
    }

    /**
     * 初始读取敏感词列表
     * @returns {Promise}
     */
    async init() {
        this._words_ = [];
        WORDS.forEach((word) => {
            this._words_.push(this._replace_(word));
        });
    }

    /**
     * 过滤敏感词
     * @param content
     * @returns {*|string|void|XML}
     */
    filter(content) {
        for (let i = 0; i < this._words_.length; i++) {
            let word = this._words_[i];
            content = content.replace(new RegExp(word, 'img'), '*'.repeat(word.length))
        }
        return content;
        //return content.replace(new RegExp(this._joins_, 'img'), '*');
    }

    /**
     * 转义保留词
     * @param word
     * @returns {*}
     * @private
     */
    _replace_(word) {
        return word
            .replace(/\\/ig, "\\\\")
            .replace(/\*/ig, "\\\*")
            .replace(/\+/ig, "\\\+")
            .replace(/\^/ig, "\\\^")
            .replace(/\$/ig, "\\\$")
            .replace(/\//ig, "\\\/")
            .replace(/\?/ig, "\\\?")
            .replace(/\!/ig, "\\\!")
            .replace(/\;/ig, "\\\;")
            .replace(/\(/ig, "\\\(")
            .replace(/\)/ig, "\\\)")
            .replace(/\{/ig, "\\\{")
            .replace(/\}/ig, "\\\}")
            .replace(/\[/ig, "\\\[")
            .replace(/\]/ig, "\\\]");
    }
};