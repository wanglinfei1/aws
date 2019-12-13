var express = require('express');
var router = express.Router();
var ressend = require('../common/ressend')
var md5 = require('md5')
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
router.get('/CQ/**', function (req, res) {
    try {
        var mongoArr = req.path.replace(/\/?CQ\/?/, '').split('/')
        var _db_name = req.query.db_name || mongoArr[0] || ''
        var _tabName = req.query.tabName || mongoArr[1] || ''
        if (!_db_name || !_tabName) {
            res.send({ code: 11, data: null, msg: '数据库表名称缺少' })
            return
        }
        // 查询对象
        var query = {};
        var q_k = req.query.q_k || ''
        var q_v = req.query.q_v || ''
        if (q_k && q_v) {
            query[q_k] = q_v
        }
        // 排序对象 -1倒叙 1正序
        var json = {};
        var s_k = req.query.s_k || 'time';
        var s_v = req.query.s_v || -1;
        json[s_k] = parseInt(s_v);

        var limit = parseInt(req.query.p_s || 10); //页数
        var skip = (parseInt(req.query.p_n || 1) - 1) * limit; //页码

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
});
module.exports = router;