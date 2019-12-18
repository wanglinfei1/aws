var express = require('express');
var router = express.Router();
var md5 = require('md5');
var request = require('request');
var axios = require('axios');
var ressend = require('../common/ressend');
var dbHandler = require('../common/dbhandler');
var aseCode = require('../common/crypto-sing')
var UTIL = require('../common/util')
var UUID = require('../common/uuid-v4');

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

var getCommonApiFn = function(req, res) {
    var reqData = Object.assign({}, req.query || {}, req.body || {})
    var url = reqData.url || '';
    try {
        url = decodeURIComponent(url) || ''
    } catch (err) {}

    if (!url) {
        ressend(req, res, { code: 11, data: '', msg: '缺少其他服务url参数' })
    }

    var headers = {},
        params = {};
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

router.get('/getOtherHost', function(req, res) {
    getCommonApiFn(req, res)
});
router.post('/getOtherHost', function(req, res) {
    getCommonApiFn(req, res)
});

router.get('/downloadFile', function(req, res) {
    var url = req.query.url || '';
    try {
        url = decodeURIComponent(url) || ''
    } catch (err) {}
    if (!url) {
        ressend(req, res, { code: 11, data: '', msg: '缺少资源url参数' })
    }

    var headers = {},
        params = {};
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
    } catch (err) {}
});

var getLoginInfo = function(utoken, k) {
    k = k || 'openid'
    var info = JSON.parse(aseCode.aseDecode(utoken)) || {}
    return info[k] || ''
};

var getReDataAndName = function(req, res) {
    // 获取参数
    var reqData = Object.assign({}, req.query || {}, req.body || {})
    var mongoArr = req.path.split('/')
    var db_name = reqData.db_name || mongoArr[2] || ''
    var tabName = reqData.tabName || mongoArr[3] || ''
    if (!db_name || !tabName) {
        res.send({ code: 11, data: null, msg: '数据库表名称缺少' })
        return
    }
    // 查询对象
    var query = null;
    var q_k = reqData.q_k || 'id'
    var q_v = reqData.q_v || ''
    if (q_v) {
        query = query || {}
        var q_v_arr = q_v.split(',')
        query[q_k] = new RegExp('^(' + q_v_arr.join('|') + ')$', 'g')
    }
    var reqQuery = reqData.query
    if (reqQuery) {
        try {
            reqQuery = JSON.parse(reqQuery)
        } catch (err) {}
        query = Object.assign(query || {}, reqQuery)
    }
    delete reqData['query']
    return {
        reqData: reqData,
        db_name: db_name,
        tabName: tabName,
        query: query
    }
}

const COMMONQUERYDB = function(req, res) {
    try {
        // 获取参数
        var ReDataAndName = getReDataAndName(req, res) || {};
        var reqData = ReDataAndName.reqData;
        var _db_name = ReDataAndName.db_name;
        var _tabName = ReDataAndName.tabName;
        // 查询对象
        var query = ReDataAndName.query || {};
        // 排序对象 -1倒叙 1正序
        var json = {};
        var s_k = reqData.s_k || 'time';
        var s_v = reqData.s_v || -1;
        json[s_k] = parseInt(s_v);

        var limit = parseInt(reqData.p_s || 10); //每页数
        var skip = (parseInt(reqData.p_n || 1) - 1) * limit; //页码

        dbHandler('findList', _tabName, [query, skip, limit, json], _db_name).then(data => {
            var count = data.count || data.length || 0
            if (data.length) {
                delete data['count']
                ressend(req, res, { code: 0, data: data, msg: '查询信息成功', total: count })
            } else {
                ressend(req, res, { code: 0, data: null, msg: '你查询的信息不存在', total: count })
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
router.get('/CQ/**', function(req, res) {
    COMMONQUERYDB(req, res)
});
router.post('/CQ/**', function(req, res) {
    COMMONQUERYDB(req, res)
});


// 添加更新保存
router.post('/CA/**', (req, res) => {
    // 获取参数
    var ReDataAndName = getReDataAndName(req, res) || {};
    var reqData = ReDataAndName.reqData;
    var _db_name = ReDataAndName.db_name;
    var _tabName = ReDataAndName.tabName;
    // 查询对象
    var __query = ReDataAndName.query || null;

    function addData() {
        var _data = {
            id: UUID().replace(/-/g, ''),
            time: parseInt(new Date().getTime() / 1000),
            isdel: '0'
        }
        reqData = Object.assign(_data, reqData, {})
        dbHandler('add', _tabName, reqData, _db_name).then((data) => {
            res.send({ code: 0, data: data, msg: '添加成功' })
        })
    }

    function upData() {
        var _data = {
            time: parseInt(new Date().getTime() / 1000)
        }
        reqData = Object.assign(reqData, _data)
        dbHandler('update', _tabName, [__query, { $set: reqData }], _db_name).then((data) => {
            res.send({ code: 0, data: data.result || {}, msg: '更新成功' })
        });
    }
    if (__query) {
        dbHandler('find', _tabName, __query, _db_name).then((data) => {
            if (data.length) {
                upData(data)
            } else {
                addData();
            }
        });
    } else {
        addData();
    }
});

var COMMONDELDB = function(req, res) {
    // 获取参数
    var ReDataAndName = getReDataAndName(req, res) || {};
    var reqData = ReDataAndName.reqData;
    var _db_name = ReDataAndName.db_name;
    var _tabName = ReDataAndName.tabName;
    // 查询对象
    var __query = ReDataAndName.query || null;
    if (!__query) {
        res.send({ code: 11, data: null, msg: '缺少查询参数' })
        return
    }
    if (reqData.delete) {
        dbHandler('delete', _tabName, __query, _db_name).then(data => {
            res.send({ code: 0, data: data, msg: '删除成功' })
        });
    } else {
        dbHandler('updateMany', _tabName, [__query, { $set: { isdel: '1' } }], _db_name).then(data => {
            res.send({ code: 0, data: data.result || {}, msg: '删除成功' })
        });
    }
};
//删除
router.post('/CD/**', (req, res) => {
    COMMONDELDB(req, res)
});
router.get('/CD/**', (req, res) => {
    COMMONDELDB(req, res)
});

router.get('/aggregate/**', function(req, res) {
    try {
        // 获取参数
        var ReDataAndName = getReDataAndName(req, res) || {};
        var reqData = ReDataAndName.reqData;
        var _db_name = ReDataAndName.db_name;
        var _tabName = ReDataAndName.tabName;
        // 查询对象
        var __query = ReDataAndName.query || {};

        // 排序对象 -1倒叙 1正序
        var _sort = {};
        var s_k = reqData.s_k || 'time';
        var s_v = reqData.s_v || -1;
        _sort[s_k] = parseInt(s_v);

        var limit = parseInt(reqData.p_s || 10); //每页数
        var skip = (parseInt(reqData.p_n || 1) - 1) * limit; //页码

        var _lookup = []
            // 关联表键
        if (reqData.look_k && reqData.look_v) {
            _lookup.push({
                $lookup: {
                    from: reqData.look_k, //关联表
                    localField: reqData.look_v, //主表的字段
                    foreignField: reqData.look_v_1 || reqData.look_v, //关联表的字段
                    as: reqData.look_k //存储的字段
                }
            })
        }
        // 关联表对象
        if (reqData.lookup) {
            var lookup_obj = reqData.lookup
            try {
                lookup_obj = JSON.parse(lookup_obj)
            } catch (err) {}
            lookup_obj.forEach(item => {
                _lookup.push({
                    $lookup: item
                })
            });
        }

        dbHandler('aggregate', _tabName, [
            { $match: __query },
            { $sort: _sort },
            { $limit: limit },
            { $skip: skip }
        ].concat(_lookup), _db_name).then((data) => {
            if (data.length) {
                res.send({ code: 0, data: data, msg: '查询信息成功' })
            } else {
                res.send({ code: 0, data: null, msg: '你的信息不存在' })
            }
        }).catch((err) => {
            res.send({ code: 11, data: err, msg: '获取信息错误' })
        });
    } catch (err) {
        res.json({
            code: 11,
            data: err,
            msg: '获取错误'
        })
    }
});
module.exports = router;