var express = require('express');
var router = express.Router();
var axios = require('axios');
var config = require('./config')
var aseCode = require('./aseCode')
var WXBizDataCrypt = require('./WXBizDataCrypt')

var getLoginInfo = function (utoken, key) {
  key = key || 'openid'
  var info = JSON.parse(aseCode.aseDecode(utoken)) || {}
  return info[key] || ''
}

router.get('/mini/login', function (req, res) {
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
    console.log(error)
  })
});

router.get('/mini/getLoginInfo', function (req, res) {
  try {
    var utoken = req.query.utoken || ''
    var openid = getLoginInfo(utoken)
    res.json({
      code: 0,
      data: {
        openid: openid
      }
    })
  } catch (err) {
    res.json({
      code: 11,
      data: err,
      msg: '获取信息错误'
    })
  }
});

router.post('/mini/setuserinfo', function (req, res) {
  try {
    var reqBody = Object.assign(req.query || {}, req.body || {})
    var utoken = reqBody.utoken || ''
    var session_key = getLoginInfo(utoken, 'session_key')
    var openid = getLoginInfo(utoken)
    var pc = new WXBizDataCrypt(config.appID, session_key)
    var encryptedData = reqBody.encryptedData || ''
    var iv = reqBody.iv || ''
    var data = pc.decryptData(encryptedData, iv) || {}
    var resData = openid == data.openId ? data : {}
    res.json({
      code: 0,
      data: resData
    })
  } catch (err) {
    res.json({
      code: 11,
      data: err,
      msg: '获取信息错误'
    })
  }
});

module.exports = router;

