/**
 * 消息缓存数量
 */
const CACHE_SIZE = 50;

/**
 *单词有效时间
 */
const WORD_STAMP = 5000;
/**
 *单词最大缓存数量
 */
const WORD_MAX = 500;
/**
 *标点符号
 */
const WORD_SYMBOLS = [',', '.', ';', '!', ':', '"', '\'', '*', '(', ')', '&', '^', '%', '$', '#', '@', '`', '~', '/', '\\', '[', ']', '{', '}', '|', '>', '<', '?'];

module.exports = {CACHE_SIZE, WORD_STAMP, WORD_SYMBOLS,WORD_MAX};