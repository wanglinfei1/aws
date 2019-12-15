var express = require('express');
var router = express.Router();
var axios = require('axios');
var aseCode = require('../common/crypto-sing')
var WXBizDataCrypt = require('./WXBizDataCrypt')
var dbHandler = require('./../common/dbhandler');
var UUID = require('./../common/uuid-v4');
var tabName = 'user';
var UTIL = require('../common/util')
var config = {}
var db_name = 'MINI'

UTIL.getDBConfig(db_name, 'config').then((data) => {
  config = data[0] || {}
  console.log('MINI_CONFIG======', config)
})

var getLoginInfo = function(utoken, k) {
  k = k || 'openid'
  var info = JSON.parse(aseCode.aseDecode(utoken)) || {}
  return info[k] || ''
}

router.get('/mini/login', function(req, res) {
  var url = 'https://api.weixin.qq.com/sns/jscode2session'
  const JSCODE = req.query.code || ''
  axios.get(url, {
    params: {
      appid: config.appID || '',
      secret: config.appSecret || '',
      js_code: JSCODE,
      grant_type: 'authorization_code'
    }
  }).then(response => {
    var reqData = response.data || {}
    var str = aseCode.aseEncode(JSON.stringify(reqData)) || ''
    res.json({
      code: 0,
      data: {
        utoken: str
      }
    })
  }).catch(error => {
    res.send({ code: 11, data: null, msg: '登陆校验失败' })
  })
});

router.get('/mini/getLoginInfo', function(req, res) {
  try {
    var utoken = req.query.utoken || ''
    var openid = req.query.openid || getLoginInfo(utoken)
    var _tabName = req.query.tabName || tabName
    var _db_name = req.query.db_name || db_name
    console.log(openid)
    dbHandler('find', _tabName, { openId: openid }, _db_name).then((data) => {
      if (data.length) {
        dbHandler('count', 'like', { openid: openid, isdel: '0' }, _db_name).then((num) => {
          data[0].reply = num || 0
          res.send({ code: 0, data: data[0], msg: '查询信息成功' })
        }).catch(() => {
          res.send({ code: 0, data: data[0], msg: '查询信息成功' })
        })
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

router.post('/mini/setuserinfo', function(req, res) {
  try {
    var reqBody = Object.assign(req.query || {}, req.body || {})
    var utoken = reqBody.utoken || ''
    var session_key = getLoginInfo(utoken, 'session_key')
    var openid = getLoginInfo(utoken)
    var encryptedData = reqBody.encryptedData || ''
    var iv = reqBody.iv || ''
    var __WXBizDataCrypt = new WXBizDataCrypt(config.appID, session_key)
    var data = __WXBizDataCrypt.decryptData(encryptedData, iv) || {}
    var resData = openid == data.openId && data.watermark && config.appID == data.watermark.appid ? data : {}
    if (!resData.openId) {
      res.send({ code: 0, data: null, msg: '请校验小程序是否正确' })
      return;
    }
    var newAccount = JSON.parse(JSON.stringify(resData));
    newAccount.id = UUID().replace(/-/g, '')
    newAccount.time = new Date()
    delete newAccount["watermark"]

    function savAccount() {
      dbHandler('add', tabName, newAccount, db_name).then((data) => {
        res.send({ code: 0, data: data, msg: '信息注册成功' })
      })
    }

    function updata() {
      dbHandler('update', tabName, [{ openId: openid }, { $set: newAccount }], db_name).then((data) => {
        res.send({ code: 0, data: newAccount, msg: '信息更新成功' })
      });
    }
    dbHandler('find', tabName, { openId: openid }, db_name).then((data) => {
      if (data.length) {
        updata()
      } else {
        savAccount()
      }
    });
  } catch (err) {
    res.json({
      code: 11,
      data: err,
      msg: '获取信息错误'
    })
  }
});

module.exports = router;
