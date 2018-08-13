var express = require('express');
var assert = require('assert');
var router = express.Router();
var request = require('request');
var wxConfig = require('./config.js');
var oauthConfig = require('./oauthConfig.js');
var oauthInfo = require('./oauthInfo.js').items;

/* 微信登陆 */
var AppID = 'wxe97c10d6aa10ccf7'||wxConfig.appID;
var AppSecret = 'a928aea9b10957f9b8c4dcea7880da91'||wxConfig.appSecret;

router.get('/wxoauth*', function(req,res, next){
    var openid=req.query.openid||req.session.openid;
    console.log(openid);
    if(!openid){
        var redirect=oauthConfig.redirect;
        // 第一步：用户同意授权，获取code
        var router = '/get_wx_access_token';
        // 这是编码后的地址
        var return_uri = encodeURIComponent(redirect+router);
        var scope = 'snsapi_userinfo';
        res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect');
    }else{
        next()
    }
});
router.get('/get_wx_access_token', function(req,res, next){
    var sess = req.session;
    var code = req.query.code;
    // 第二步：通过code换取网页授权access_token
    request.get(
        {
            url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+AppID+'&secret='+AppSecret+'&code='+code+'&grant_type=authorization_code',
        },
        function(error, response, body){
            try {
                if(body){
                    var data = JSON.parse(body);
                    var access_token = data.access_token;
                    var openid = data.openid;
                    var refresh_token = data.refresh_token;
                    var OauthUser={};
                    if(!OauthUser.openid){
                        oauthInfo.push({
                            openid: openid,
                            access_token: access_token,
                            refresh_token:refresh_token
                        });
                    }
                    req.session.regenerate(function(err) {
                        if(!err){
                            req.session.openid = openid;
                        }
                    });
                    var redirect=oauthConfig.redirect+'/wxsign?openid='+openid+'access_token='+access_token+'refresh_token='+refresh_token;
                    res.redirect(redirect)
                }else{
                    res.send(error)
                }
            } catch (e) {
                console.log('\r\n', e, '\r\n', e.stack);
                res.end(e.stack);
            }
        }
    );
});
router.get('/get_wx_userinfo', function(req,res, next){
    var OPENID=req.query.openid||req.session.openid;
    req.session.regenerate(function(err) {
        if(!err){
            req.session.openid = OPENID;
        }
    });
    var OauthUser={};
    var ACCESS_TOKEN=req.query.access_token||OauthUser.access_token;
    var refreshToken=OauthUser.refresh_token;
    if(ACCESS_TOKEN){
        valid_tiken(OPENID,ACCESS_TOKEN,refreshToken,req,res)
        /*getUserindo(OPENID,ACCESS_TOKEN,refreshToken,res)*/
    }else{
        res.send({code: 123, msg: 'openId不存在'})
    }
});
var valid_tiken=function(OPENID,ACCESS_TOKEN,refreshToken,req,res){
    request.get(
        {url:'https://api.weixin.qq.com/sns/auth?access_token='+ACCESS_TOKEN+'&openid='+OPENID}
        , function(error, response, body){
            try {
                if(body){
                    var data = JSON.parse(body);
                    if(data.errcode===0){
                        getUserinfo(OPENID,ACCESS_TOKEN,refreshToken,req,res)
                    }else{
                        refresh_token(OPENID,refreshToken,req,res,function(OPENID,ACCESS_TOKEN,refreshToken,req,res){
                            getUserinfo(OPENID,ACCESS_TOKEN,refreshToken,req,res)
                        })
                    }
                }else{
                    res.send(error)
                }
            } catch (e) {
                console.log('\r\n', e, '\r\n', e.stack);
                res.end(e.stack);
            }
        }
    );
}
var getUserinfo=function(OPENID,ACCESS_TOKEN,refreshToken,req,res){
    request.get(
        {url:' https://api.weixin.qq.com/sns/userinfo?access_token='+ACCESS_TOKEN+'&openid='+OPENID+'&lang=zh_CN'}
        , function(error, response, body){
            try {
                if(body){
                    var body = JSON.parse(body);
                    res.send(body)
                }else{
                    res.send(error)
                }
            } catch (e) {
                console.log('\r\n', e, '\r\n', e.stack);
                res.end(e.stack);
            }
        }
    );
}
var refresh_token=function(APPID,REFRESH_TOKEN,req,res,callback){
    request.get(
        {url:' https://api.weixin.qq.com/sns/oauth2/refresh_token?appid='+APPID+'&grant_type=refresh_token&refresh_token='+REFRESH_TOKEN}
        , function(error, response, body){
            try {
                if(body){
                    var data = JSON.parse(body);
                    var access_token = data.access_token;
                    var openid = data.openid;
                    var refresh_token = data.refresh_token;
                    if(openid){
                        callback&&callback(openid,access_token,refresh_token,req,res)
                    }else{
                        res.send(data)
                    }
                }else{
                    res.send(error)
                }
            } catch (e) {
                console.log('\r\n', e, '\r\n', e.stack);
                res.send(e.stack);
            }
        }
    );
}
module.exports = router;
