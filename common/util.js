/**
 * Created by linfei6 on 2018/4/20.
 */
var getRandom=function (n, m) {
    return Math.floor(Math.random() * (m - n + 1) + n)
}
var shuffle =function (arr) {
    var _arr = arr.slice()
    for (var i = 0; i < _arr.length; i++) {
        var j = getRandom(0, i)
        var Newarr = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = Newarr
    }
    return _arr
}
module.exports = {
    shuffle:shuffle,
    getRandom:getRandom
};