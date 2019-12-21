const {WORD_STAMP, WORD_SYMBOLS, WORD_MAX} = require('./../consts');

/**
 * 单词统计
 * @type {WordStatistics}
 */
module.exports = class WordStatistics {
    constructor(serve) {
        this.serve = serve;
        this.messages = [];
        this.last_stamp = Date.now();
        this.max_size = WORD_MAX;
    }

    /**
     * 添加消息
     * @param content
     * @param stamp
     */
    addMessage(content, stamp) {
        let lowers = content.toLowerCase();
        this.messages.push({words: lowers.split(' '), stamp});
        this.last_stamp = Date.now();
        this._clear_();
    }

    /**
     * 统计单词
     * @returns {[*]}
     */
    calculate() {
        let min_stamp = Date.now() - WORD_STAMP, keys = new Map();
        for (let i = this.messages.length - 1; i >= 0; i--) {
            if (this.messages[i].stamp < min_stamp) {
                //直接删除过期消息
                this.messages.splice(0, i);
                break;
            }
            this.messages[i].words.forEach((word) => {
                if (WORD_SYMBOLS.indexOf(word) == -1) {
                    let count = keys.get(word) || 0;
                    keys.set(word, count + 1);
                }
            });
        }

        let max_words = new Set(), max_size = 0;
        for (let [word, total] of keys.entries()) {
            if (total > max_size) {
                max_words.clear();
                max_words.add(word);
                max_size = total;
            } else if (total == max_size) {
                max_words.add(word);
            }
        }

        return [...max_words].join(',');
    }

    /**
     * 清理过期消息
     * @private
     */
    _clear_() {
        let now_stamp = Date.now();
        //最后一条时间超过规定时间2倍或缓存消息长度超过1000进行清理
        let ok = this.last_stamp + 2 * WORD_STAMP < now_stamp || this.messages.length >= this.max_size;
        if (ok == true) {
            for (let i = this.messages.length - 1; i >= 0; i--) {
                if (this.messages[i].stamp + WORD_STAMP <= now_stamp) {
                    this.messages.splice(0, i);
                    //如果未过期消息长度大于限定，则扩大缓存容量
                    this.max_size = i > WORD_MAX ? i + WORD_MAX : WORD_MAX;
                    break;
                }
            }
        }
    }
};