var express = require('express');
var router = express.Router();
var md5 = require('md5');
var request = require('request');
var axios = require('axios');
var ressend = require('../common/ressend');
var dbHandler = require('../common/dbhandler');

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

var getCommonApiFn = function (req, res) {
    var reqData = Object.assign({}, req.query || {}, req.body || {})
    var url = reqData.url || '';
    try {
        url = decodeURIComponent(url) || ''
    } catch (err) { }

    if (!url) {
        ressend(req, res, { code: 11, data: '', msg: '缺少其他服务url参数' })
    }

    var headers = {}, params = {};
    try {
        headers = reqData.headers ? JSON.parse(reqData.headers) : {};
        params = reqData.params ? JSON.parse(reqData.params) : {};
    } catch (err) {
        headers = reqData.headers || {};
        params = reqData.params || {};
    }

    var method = (req.method || 'get').toLowerCase()
    var axiosParm = {
        method: method == 'get' ? 'get' : 'psot',
        url: url,
        headers: headers,
    }
    if (method == 'get') {
        axiosParm.params = params
    } else {
        axiosParm.data = params
    }

    axios(axiosParm).then(response => {
        var ret = response.data
        if (typeof ret === 'string') {
            var reg = /^\w+\(({[^()]+})\)$/
            var matches = ret.match(reg)
            if (matches) {
                ret = JSON.parse(matches[1])
            }
        }
        ressend(req, res, ret)
    }).catch(error => {
        ressend(req, res, { code: 11, data: '', msg: '请求外部服务错误' })
    })
}

router.get('/getOtherHost', function (req, res) {
    getCommonApiFn(req, res)
});
router.post('/getOtherHost', function (req, res) {
    getCommonApiFn(req, res)
});

router.get('/downloadFile', function (req, res) {
    var url = req.query.url || '';
    try {
        url = decodeURIComponent(url) || ''
    } catch (err) { }
    if (!url) {
        ressend(req, res, { code: 11, data: '', msg: '缺少资源url参数' })
    }

    var headers = {}, params = {};
    try {
        headers = req.query.headers ? JSON.parse(req.query.headers) : {};
        params = req.query.params ? JSON.parse(req.query.params) : {};
    } catch (err) {
        headers = reqData.headers || {};
        params = reqData.params || {};
    }

    try {
        request.get({
            headers: headers,
            url: url,
            query: params
        }).pipe(res);
    } catch (err) { }
});

const COMMONQUERYDB = function (req, res) {
    try {
        var reqData = Object.assign({}, req.query || {}, req.body || {})
        var mongoArr = req.path.replace(/\/?CQ\/?/, '').split('/')
        var _db_name = reqData.db_name || mongoArr[0] || ''
        var _tabName = reqData.tabName || mongoArr[1] || ''
        if (!_db_name || !_tabName) {
            res.send({ code: 11, data: null, msg: '数据库表名称缺少' })
            return
        }
        // 查询对象
        var query = {};
        var q_k = reqData.q_k || 'id'
        var q_v = reqData.q_v || ''
        if (q_v) {
            query[q_k] = q_v
        }
        // 排序对象 -1倒叙 1正序
        var json = {};
        var s_k = reqData.s_k || 'time';
        var s_v = reqData.s_v || -1;
        json[s_k] = parseInt(s_v);

        var limit = parseInt(reqData.p_s || 10); //页数
        var skip = (parseInt(reqData.p_n || 1) - 1) * limit; //页码

        dbHandler('findList', _tabName, [query, skip, limit, json], _db_name).then(data => {
            if (data.length) {
                ressend(req, res, { code: 0, data: data, msg: '查询信息成功', total: data.length })
            } else {
                ressend(req, res, { code: 0, data: null, msg: '你查询的信息不存在' })
            }
        }).catch((err) => {
            ressend(req, res, { code: 11, data: err, msg: '获取信息错误' })
        });
    } catch (err) {
        ressend(req, res, {
            code: 11,
            data: err,
            msg: '获取信息错误'
        })
    }
}
router.get('/CQ/**', function (req, res) {
    COMMONQUERYDB(req, res)
});
router.post('/CQ/**', function (req, res) {
    COMMONQUERYDB(req, res)
});

module.exports = router;