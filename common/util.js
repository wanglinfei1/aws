/**
 * Created by linfei6 on 2018/4/20.
 */
var UUID = require('./uuid-v4');

var getRandom = function (n, m) {
    return Math.floor(Math.random() * (m - n + 1) + n)
}
var shuffle = function (arr) {
    var _arr = arr.slice()
    for (var i = 0; i < _arr.length; i++) {
        var j = getRandom(0, i)
        var Newarr = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = Newarr
    }
    return _arr
}
var reqcookie = function (req, res) {
    if (!req.cookies.__UBP__) {
        var __uuid__ = UUID().replace(/-/g, '')
        var time = new Date().getTime()
        res.cookie("__UBP__", __uuid__ + '__' + time, { domain: '.wzytop.cn', path: '/', maxAge: 1 * 60 * 60 * 1000, httpOnly: true });
    } else {
        var __UBPCOOKIES__ = req.cookies.__UBP__ || ''
        var __UBP__uuid__ = __UBPCOOKIES__.split('__')[0] || ''
        var __UBP__time__ = __UBPCOOKIES__.split('__')[1] || 0
        var time = new Date().getTime()
        if (time - __UBP__time__ > (1 * 60 * 60 * 1000 - 100)) {
            res.cookie("__UBP__", __UBP__uuid__ + '__' + time, { domain: '.wzytop.cn', path: '/', maxAge: 1 * 60 * 60 * 1000, httpOnly: true });
        }
    }
}
module.exports = {
    shuffle: shuffle,
    getRandom: getRandom,
    reqcookie: reqcookie
};