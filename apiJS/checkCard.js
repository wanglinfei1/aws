var express = require('express');
var router = express.Router();
var city_config = require('../common/cityCard') || {};
var _AREAJSON_ = city_config._AREAJSON_;
var _AREAJSON_ARR_ = city_config._AREAJSON_ARR_;
var IDValidator = require('../common/checkCard')

router.get('/checkcard', (req, res) => {
    var id = req.query.id || '';
    var uid = req.query.uid || '';
    var checkCarded = IDValidator(id, _AREAJSON_);
    if (uid != 'linfei6') {
        delete checkCarded['valnum'];
    }
    var resJson = { code: 0, data: checkCarded, msg: '请求成功' };
    if (req.query.callback) {
        var resData = "try{" + callback + "(" + JSON.stringify(resJson) + ");}catch(e){};"
        res.type('text/javascript;charset=utf-8');
        res.send(resData);
    } else {
        res.send(resJson);
    }
});
router.get('/getidcard', (req, res) => {
    var leng = req.query.leng || 18;
    var id = IDValidator('makeID', _AREAJSON_ARR_, leng);
    var checkCarded = IDValidator(id, _AREAJSON_);
    if (checkCarded.validator) {
        delete checkCarded['validator'];
    }
    checkCarded.id = id;
    var resJson = { code: 0, data: checkCarded, msg: '请求成功' };
    if (req.query.callback) {
        var resData = "try{" + callback + "(" + JSON.stringify(resJson) + ");}catch(e){};"
        res.type('text/javascript;charset=utf-8');
        res.send(resData);
    } else {
        res.send(resJson);
    }
});
module.exports = router;