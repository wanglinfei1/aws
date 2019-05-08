var express = require('express');
var router = express.Router();
var city_config = require('../common/cityCard') || {};
var _AREAJSON_ = city_config._AREAJSON_;
var _AREAJSON_ARR_ = city_config._AREAJSON_ARR_;
var IDValidator = require('../common/checkCard')

router.get('/checkcard', (req, res) => {
    var cardid = req.query.id || '';
    var callback = req.query.callback || '';
    var checkCarded = IDValidator(cardid, _AREAJSON_);
    console.log(callback, checkCarded);
    var resJson = { code: 0, data: checkCarded, msg: '请求成功' };
    if (callback) {
        var resData = "try{" + callback + "(" + JSON.stringify(resJson) + ");}catch(e){};"
        res.type('text/javascript;charset=utf-8');
        res.send(resData);
    } else {
        res.send(resJson);
    }
});
router.get('/getidcard', (req, res) => {
    var leng = req.query.leng || 18;
    var callback = req.query.callback || '';
    var checkCarded = IDValidator('makeID', _AREAJSON_ARR_, leng);
    console.log(callback, checkCarded);
    var resJson = { code: 0, data: checkCarded, msg: '请求成功' };
    if (callback) {
        var resData = "try{" + callback + "(" + JSON.stringify(resJson) + ");}catch(e){};"
        res.type('text/javascript;charset=utf-8');
        res.send(resData);
    } else {
        res.send(resJson);
    }
});
module.exports = router;