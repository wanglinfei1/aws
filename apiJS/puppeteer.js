var express = require('express');
var router = express.Router();
var ressend = require('../common/ressend')
var puppeteer = require('puppeteer')
var devices = require('puppeteer/DeviceDescriptors')
var charset = require('superagent-charset'); //解决乱码问题:
var cheerio = require('cheerio'); //可以像jquer一样操作界面
var superagent = require('superagent'); //发起请求
charset(superagent);
var cheerio = require('cheerio');

var sleep = time => {
  new Promise(resolve => {
    //成功执行
    try {
      setTimeout(resolve, time)
    } catch (err) {
      console.log(err)
    }
  })
};

var getPuppeteerData = async function (req, res) {
  var reqQuery = Object.assign({}, req.query || {}, req.body || {})
  var url = reqQuery.url || '';
  try {
    url = decodeURIComponent(url)
  } catch (err) { }

  try {
    if (!url) {
      var resultJSon = { code: 13, data: '缺少必须的url参数', msg: '请求失败' };
      ressend(req, res, resultJSon)
      return
    }
    var launchConfig = {
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], //不是沙箱模式
      dumpio: false,
      headless: true,
      devtools: false
    };

    const browser = await puppeteer.launch(launchConfig);

    const page = await browser.newPage();
    await page.emulate(devices['iPhone 6'])
    await page.goto(url, {
      waitUntil: 'domcontentloaded'
    });
    // await sleep(30)
    // await page.waitForSelector('#h5audio_media')
    const result = await page.evaluate((reqQuery) => {
      var $ = window.$
      var _result = {};

      try {
        var reqQueryFn
        if (reqQuery.fn) {
          reqQueryFn = eval('(' + reqQuery.fn + ')')
        }
        var fndata = (reqQueryFn && reqQueryFn(window, reqQuery)) || null
        if (fndata) {
          _result.fndata = fndata
        }
      } catch (err) { }

      try {
        var select = reqQuery.select;
        var $el = $ && select ? $(select) : '';
        var attrArr = (reqQuery.attr || 'src').split(',');
        if ($el && $el.length && attrArr && attrArr.length) {
          var attrs = {};
          for (var i = 0; i < attrArr.length; i++) {
            var attr = attrArr[i]
            var attr_val = attr == 'html' ? ($el.html() || '') : ($el.attr(attr) || '')
            attrs[attr] = attr_val || '';
          }
          _result.attrs = attrs
        }
      } catch (err) { }

      try {
        var keyArr = reqQuery.key ? (reqQuery.key).split(',') : [];
        if (keyArr && keyArr.length) {
          var pagedata = {};
          for (var i = 0; i < keyArr.length; i++) {
            var key = keyArr[i]
            pagedata[key] = window[key] || null;
          }
          _result.pagedata = pagedata
        }
      } catch (err) { }

      return _result
    }, reqQuery)
    browser.close()
    var resultJSon = { code: 0, data: result, msg: '请求成功' };
    ressend(req, res, resultJSon)
  } catch (err) {
    var resultJSon = { code: 13, data: null, msg: '请求失败' };
    console.log(err)
    ressend(req, res, resultJSon)
  }
};

var getSuperagentData = async function (req, res) {
  var reqQuery = Object.assign({}, req.query || {}, req.body || {})
  var url = reqQuery.url || '';
  try {
    url = decodeURIComponent(url)
  } catch (err) { }

  if (!url) {
    var resultJSon = { code: 13, data: '缺少必须的url参数', msg: '请求失败' };
    ressend(req, res, resultJSon)
    return
  }
  var _charset = reqQuery.encoded || 'utf-8'
  try {
    superagent
      .get(url)
      .charset(_charset) //解决编码问题
      .end(function (err, ssres) {
        if (err) {
          var resultJSon = { code: 13, data: err, msg: '请求失败' };
          ressend(req, res, resultJSon)
        } else {
          var reqResult = (function (reqQuery, ssres) {
            var $ = cheerio.load(ssres.text);
            var _result = {};

            try {
              var reqQueryFn
              if (reqQuery.fn) {
                reqQueryFn = eval('(' + reqQuery.fn + ')')
              }
              var fndata = (reqQueryFn && reqQueryFn($, reqQuery)) || null
              if (fndata) {
                _result.fndata = fndata
              }
            } catch (err) { }

            try {
              var select = reqQuery.select;
              var attrArr = (reqQuery.attr || 'src').split(',');
              var $el = $ && select ? $(select) : '';
              if ($el && $el.length && attrArr && attrArr.length) {
                var attrs = {};
                for (var i = 0; i < attrArr.length; i++) {
                  var attr = attrArr[i]
                  var attr_val = attr == 'html' ? ($el.html() || '') : ($el.attr(attr) || '')
                  attrs[attr] = attr_val || '';
                }
                _result.attrs = attrs
              }
            } catch (err) { }

            return _result
          })(reqQuery, ssres)

          var resultJSon = { code: 0, data: reqResult, msg: '请求成功' };
          ressend(req, res, resultJSon)
        }
      });
  } catch (err) {
    var resultJSon = { code: 13, data: {}, msg: '请求失败' };
    ressend(req, res, resultJSon)
  }
}

router.get('/puppeteer', (req, res) => {
  var reqQuery = Object.assign({}, req.query || {}, req.body || {})
  if (reqQuery.type == 1) {
    getSuperagentData(req, res)
  } else {
    getPuppeteerData(req, res)
  }
});

router.post('/puppeteer', (req, res) => {
  var reqQuery = Object.assign({}, req.query || {}, req.body || {})
  if (reqQuery.type == 1) {
    getSuperagentData(req, res)
  } else {
    getPuppeteerData(req, res)
  }
});

module.exports = router;
