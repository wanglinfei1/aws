var express = require('express');
var router = express.Router();
var ressend = require('../common/ressend')
var puppeteer = require('puppeteer')
var devices = require('puppeteer/DeviceDescriptors')
var charset = require('superagent-charset'); //解决乱码问题:
var superagent = require('superagent'); //发起请求
charset(superagent);
var cheerio = require('cheerio');

var sleep = time => {
    new Promise(resolve => {
        //成功执行
        try {
            setTimeout(resolve, time)
        }
        catch (err) {
            console.log(err)
        }
    })
};

var getPuppeteerData = async function (req, res) {
    var url = req.query.url || '';
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],//不是沙箱模式
            dumpio: false,
            headless: true,
            // devtools: true
        });

        const page = await browser.newPage();
        await page.emulate(devices['iPhone 6'])
        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        });
        // await sleep(30)
        // await page.waitForSelector('#h5audio_media')

        const result = await page.evaluate((reqQuery) => {
            try {
                var $ = window.$
                var _result = {};

                var key = reqQuery.key || 'songlist';
                var select = reqQuery.select || '#h5audio_media';
                var attr = reqQuery.attr || 'src';

                var $el = $(select);
                var topsrc = $el ? $el.attr(attr) || '' : ''
                if (topsrc) {
                    _result[attr] = topsrc
                }

                _result[key] = window[key] || [];
                return _result
            } catch (err) {
                return err
            }
        }, req.query)
        browser.close()
        var resultJSon = { code: 0, data: result, msg: '请求成功' };
        ressend(req, res, resultJSon)
    } catch (err) {
        console.log(err)
        var resultJSon = { code: 13, data: {}, msg: '请求失败' };
        ressend(req, res, resultJSon)
    }
};

var getSuperagentData = async function (req, res) {
    var url = req.query.url || '';
    try {
        superagent
            .get(url)
            .end(function (err, ssres) {
                if (err) {
                    var resultJSon = { code: 0, data: err, msg: '请求成功' };
                } else {
                    // var $ = cheerio.load(ssres.text);
                    var resultJSon = { code: 0, data: ssres, msg: '请求成功' };
                }
                ressend(req, res, resultJSon)
            });
    } catch (err) {
        var resultJSon = { code: 13, data: {}, msg: '请求失败' };
        ressend(req, res, resultJSon)
    }
}

router.get('/puppeteer', (req, res) => {
    if (req.query.type == 1) {
        getSuperagentData(req, res)
    } else {
        getPuppeteerData(req, res)
    }
});

module.exports = router;