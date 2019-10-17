/**
 * Created by wanglinfei on 2017/9/25.
 */
var express = require('express');
var apiRouter = express.Router();
var request = require('request');
var ressend = require('../common/ressend')
var axios = require('axios');

apiRouter.get('/getList', function (req, res) {
  var url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  axios.get(url, {
    headers: {
      "origin": "https://m.y.qq.com",
      "referer": "https://m.y.qq.com/"
    },
    params: req.query
  }).then(response => {
    res.json(response.data)
  }).catch(error => {
    console.log(error)
  })
});
apiRouter.get('/getPlaylist', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    headers: {
      "origin": "http://y.qq.com",
      "referer": "https://y.qq.com/portal/playlist.html"
    },
    params: req.query
  }).then(response => {
    res.json(response.data)
  }).catch(error => {
    console.log(error)
  })
});
apiRouter.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  var query = req.query
  var refererUrl = "https://y.qq.com/n/yqq/playlist/" + query.disstid + ".html"
  axios.get(url, {
    headers: {
      "origin": "http://y.qq.com",
      "referer": refererUrl
    },
    params: query
  }).then(response => {
    res.json(response.data)
  }).catch(error => {
    console.log(error)
  })
});
apiRouter.get('/getRankList', function (req, res) {
  var url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'
  axios.get(url, {
    headers: {
      "origin": "https://y.qq.com",
      "referer": "https://m.y.qq.com/",
    },
    params: req.query
  }).then(response => {
    var ret = response.data
    res.json(ret)
  }).catch(error => {
    console.log(error)
  })
});
apiRouter.get('/getLyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  axios.get(url, {
    headers: {
      "origin": "https://m.y.qq.com",
      "referer": "https://m.y.qq.com/"
    },
    params: req.query
  }).then(response => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
        res.json(ret)
      }
    } else {
      res.json(response.data)
    }
  }).catch(error => {
    console.log(error)
  })
});
apiRouter.get('/getTingapi', function (req, res) {
  var url = 'http://tingapi.ting.baidu.com/v1/restserver/ting'
  axios.get(url, {
    headers: {
      "origin": "http://tingapi.ting.baidu.com",
      "referer": "http://tingapi.ting.baidu.com"
    },
    params: req.query
  }).then(response => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
        res.json(ret)
      }
    } else {
      res.json(response.data)
    }
  }).catch(error => {
    console.log(error)
  })
});

var CgiGetVkeyFn = function (req, res) {
  var reqData = Object.assign({}, req.query || {}, req.body || {})
  var url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  // console.log(reqData.data)
  axios({
    method: "post",
    url: url,
    headers: {
      "authority": "u.y.qq.com",
      "origin": "http://y.qq.com",
      "referer": "http://y.qq.com"
    },
    data: reqData.data
  }).then(response => {
    res.json(response.data)
  }).catch(error => {
    console.log(error)
  })
}

apiRouter.post('/CgiGetVkey', function (req, res) {
  CgiGetVkeyFn(req, res)
});
apiRouter.get('/CgiGetVkey', function (req, res) {
  CgiGetVkeyFn(req, res)
});

var getCommonApiFn = function (req, res) {
  var reqData = Object.assign({}, req.query || {}, req.body || {})
  var url = reqData.url || '';
  try {
    url = decodeURIComponent(url) || ''
  } catch (err) {}

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

apiRouter.get('/getOtherHost', function (req, res) {
  getCommonApiFn(req, res)
});
apiRouter.post('/getOtherHost', function (req, res) {
  getCommonApiFn(req, res)
});

apiRouter.get('/downloadFile', function (req, res) {
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
  } catch (err) {}
});

module.exports = apiRouter;

