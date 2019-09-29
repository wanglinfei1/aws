/**
 * Created by wanglinfei on 2017/9/25.
 */
var express = require('express');
var apiRouter = express.Router();
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
apiRouter.post('/CgiGetVkey', function (req, res) {
  var url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  console.log(req.body.data)
  axios({
    method: "post",
    url: url,
    headers: {
      "authority": " u.y.qq.com",
      "origin": "http://y.qq.com",
      "referer": "http://y.qq.com"
    },
    data: req.body.data
  }).then(response => {
    res.json(response.data)
  }).catch(error => {
    console.log(error)
  })
});
apiRouter.get('/CgiGetVkey', function (req, res) {
  var url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  console.log(req.body.data)
  axios({
    method: "post",
    url: url,
    headers: {
      "authority": " u.y.qq.com",
      "origin": "http://y.qq.com",
      "referer": "http://y.qq.com"
    },
    data: req.query.data
  }).then(response => {
    res.json(response.data)
  }).catch(error => {
    console.log(error)
  })
});
apiRouter.get('/getCommonApi', function (req, res) {
  var url = req.query.url;
  var header = req.query.header;
  var urlData = req.query.urlData;
  if (urlData) {
    url += ('?' + urlData.replace(/\$/g, '&'))
  }
  axios.get(url, {
    headers: {
      "origin": header && header.origin ? header.origin : "https://m.qq.com",
      "referer": header && header.referer ? header.referer : "https://m.qq.com/"
    },
    params: req.query.data
  }).then(response => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch(error => {
    console.log('error==============================================================' + error)
  })
});
apiRouter.get('/getOtherHost', function (req, res) {
  var url = req.query.url || '';
  if (!url) {
    ressend(req, res, { code: 11, data: '', msg: '缺少其他服务url参数' })
  }
  var headers = JSON.parse(req.query.headers) || {};
  var params = JSON.parse(req.query.params) || {};
 
  axios.get(url, {
    headers: headers,
    params: params
  }).then(response => {
    ressend(req, res, response.data)
  }).catch(error => {
    ressend(req, res, error)
  })
});
module.exports = apiRouter;

