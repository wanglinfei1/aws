/**
 * Created by wanglinfei on 2017/8/28.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
var reqUrl=require('./config.js');
var sign=require('./sign');
var weiXinSign={
    token:function(req,res) {
        var signUrl=req.query.signUrl||req.headers.referer
        var options = {
            url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + reqUrl.appID + '&secret=' + reqUrl.appSecret,
            method: 'get',
            json: true
        };
        /*请求后台*/
        if (reqUrl.weixinTokenTime + reqUrl.expires_in * 1000 > new Date().getTime() && reqUrl.weixinToken) {
            /*console.log('token缓存')*/
            weiXinSign.jsapi_ticket(reqUrl.weixinToken,res,signUrl)
        } else {
            request(options, function(error, response, data){
                weiXinSign.callback(error, response, data,function(data,res){
                    if (data.access_token) {
                        reqUrl.weixinToken = data.access_token
                        reqUrl.expires_in = data.expires_in
                        reqUrl.weixinTokenTime = new Date().getTime()
                        weiXinSign.jsapi_ticket(data.access_token, res,signUrl)
                        if (!reqUrl.callbackip) {weiXinSign.getcallbackip(reqUrl.weixinToken)}
                    }else{
                        res.send(data)
                    }
                },res)
            });
        }

    },
    callback: function (error, response, data,callback,res) {
        try {
            if (data) {
                callback&&callback(data,res)
            } else if(response){
                res.send(response);
            }else{
                res.send(error);
            }
        } catch (e) {
            console.log('\r\n', e, '\r\n', e.stack);
            res.end(e.stack);
        }
    },
    jsapi_ticket:function(ACCESS_TOKEN,res,signUrl){
        var options = {
            url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ACCESS_TOKEN+'&type=jsapi',
            method: 'get',
            json: true
        };
        if(reqUrl.jsapiToken&&reqUrl.jsapiTokenTime+reqUrl.jsapiexpires_in*1000>new Date().getTime()){
            var data={
                errcode:0,
                errmsg:'ok',
                ticket:reqUrl.jsapiToken,
                expires_in:reqUrl.jsapiexpires_in
            };
            /*console.log('jsapi_ticket缓存')*/
            res.send(sign(data.ticket,signUrl))
        }else{
            request(options, function(error, response, data){
                weiXinSign.callback(error, response, data,function(data,res){
                    if(data.errcode==0){
                        reqUrl.jsapiToken=data.ticket
                        reqUrl.jsapiexpires_in=data.expires_in
                        reqUrl.jsapiTokenTime=new Date().getTime()
                        res.send(sign(data.ticket,signUrl))
                    }else{
                        res.send(data)
                    }
                },res)
            });
        }
    },
    getcallbackip:function(access_token){
        request('https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token='+access_token,function(error, response, data){
           /* console.log(data)*/
        });
    }
};
router.get('/weiXinSign',function(req, res){
    weiXinSign.token(req,res)
})
module.exports = router;