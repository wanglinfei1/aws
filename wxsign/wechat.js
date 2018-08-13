/**
 * Created by wanglinfei on 2017/8/28.
 */
var express = require('express');
var router = express.Router();
var sha1 = require('sha-1');
var reqUrl=require('./config.js');
var url = require("url");
router.get('/wechat',function(req, res){
    //获取请求的qurey排序以后加密
    var query = url.parse(req.url, true).query;
    var signature = query.signature;
    var echostr = query.echostr;
    var timestamp = query['timestamp'];
    var nonce = query.nonce;
    var str = [reqUrl.token,timestamp,nonce].sort().join(''); //按字典排序，拼接字符串
    var sha = sha1(str); //加密
    if (signature == sha) {
        res.end(echostr);
        console.log("Confirm and send echo back");
    } else {
        res.end("false");
        console.log("Failed!");
    }
})
module.exports = router;