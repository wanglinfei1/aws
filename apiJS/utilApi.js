var express = require('express');
var router = express.Router();
var ressend = require('../common/ressend')
var md5 = require('md5')

router.get('/cossing', (req, res) => {
    var reqQuery = req.query || {}
    var path = reqQuery.path || ''
    var key = reqQuery.key || 'zhvlrtkfpfc'
    var t = (reqQuery.t || Math.floor(new Date().getTime() / 1000)) + ''
    var sing = md5(key + path + t)
    var resJson = {
        code: 0,
        data: {
            params: '?sign=' + sing + '&t=' + t,
            t: t,
            sign: sing
        },
        msg: '请求成功'
    };
    ressend(req, res, resJson)
});

module.exports = router;