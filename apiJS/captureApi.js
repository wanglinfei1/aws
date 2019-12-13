/**
 * Created by linfei6 on 2018/4/19.
 */
var cheerio = require('cheerio'); //可以像jquer一样操作界面
var charset = require('superagent-charset'); //解决乱码问题:
var superagent = require('superagent'); //发起请求
charset(superagent);
var async = require('async'); //异步抓取
var express = require('express');
var eventproxy = require('eventproxy');  //流程控制
var ep = eventproxy();
var router = express.Router();
var utilFn = require('./../common/util');

var baseUrl = 'http://www.dytt8.net';  //迅雷首页链接
var newMovieLinkArr = []; //存放新电影的url
var errLength = [];     //统计出错的链接数
var highScoreMovieArr = [] //高评分电影

router.get('/captureApi', function (req, res, next) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    // 命令 ep 重复监听 emit事件(get_topic_html)，当get_topic_html爬取完毕之后执行
    ep.after('get_topic_html', 1, function (eps) {
        var concurrencyCount = 0;
        var num = -4; //因为是5个并发，所以需要减4

        // 利用callback函数将结果返回去，然后在结果中取出整个结果数组。
        var fetchUrl = function (item, callback) {
            var fetchStart = new Date().getTime();
            var myurl = item.url;
            concurrencyCount++;
            num += 1;
            superagent
                .get(myurl)
                .charset('gb2312') //解决编码问题
                .end(function (err, ssres) {
                    if (err) {
                        callback(err, myurl + ' error happened!');
                        errLength.push(myurl);
                        return next(err);
                    }
                    if (ssres) {
                        var time = new Date().getTime() - fetchStart;
                        concurrencyCount--;
                        var $ = cheerio.load(ssres.text);
                        // 对获取的结果进行处理函数
                        getDownloadLink($, function (obj) {
                            obj.url = myurl;
                            addMongo(obj);
                            res.write('<br/>');
                            res.write(num + '、电影名称-->  ' + item.movieName);
                            res.write('<br/>');
                            res.write('迅雷下载链接-->  ' + obj.downLink);
                            res.write('<br/>');
                            res.write('详情链接-->  <a href=' + myurl + ' target="_blank">' + myurl + '<a/>');
                            res.write('<br/>');
                            res.write('图片链接-->  <a href=' + obj.img + ' target="_blank">' + obj.img + '<a/>');
                            res.write('<br/>');
                            res.write('简介-->' + obj.text);
                            res.write('<br/>');
                            res.write('<br/>');
                        });
                        var result = {
                            movieLink: myurl
                        };
                        callback(null, result);
                    }
                });
        };

        // 控制最大并发数为5，在结果中取出callback返回来的整个结果数组。
        async.mapLimit(newMovieLinkArr, 3, function (item, callback) {
            fetchUrl(item, callback);
        }, function (err, result) {
            try {
                // 爬虫结束后的回调，可以做一些统计结果
                console.log('抓包结束，一共抓取了-->' + newMovieLinkArr.length + '条数据');
                console.log('出错-->' + errLength.length + '条数据');
                console.log('高评分电影：==》' + highScoreMovieArr.length + '部');
            } catch (err) {
                next(err)
            }
            return false;
        });

    });
    var num = req.query.num || 1;
    var size = req.query.size || 25;
    //先抓取迅雷首页
    (function (page, num, size) {
        var pageUrl = 'http://www.dytt8.net/html/gndy/dyzz/list_23_' + num + '.html';
        superagent
            .get(pageUrl)
            .charset('gb2312')
            .end(function (err, sres) {
                try {
                    if (sres) {
                        var $ = cheerio.load(sres.text);
                        getAllMovieLink($, num, size);
                        ep.emit('get_topic_html', 'get ' + pageUrl + ' successful');
                    }
                } catch (err) {
                    console.log('抓取' + page + '这条信息的时候出错了')
                    return next(err);
                }
            });
    })(baseUrl, num, size);
});
// 获取首页中左侧栏的所有链接
function getAllMovieLink($, num, size) {
    var linkElem = $('.co_content8 ul table');
    var linkArr = [];
    for (var i = 0; i < size; i++) {
        var href = linkElem.eq(i).find('a').attr('href');
        var movieName = linkElem.eq(i).find('a').text();
        var text = linkElem.eq(i).find('tr').eq(3).text();
        var url = 'http://www.dytt8.net' + href;
        var itemJson = {};
        // 注意去重
        if (href && linkArr.indexOf(url) == -1) {
            itemJson.url = url;
            itemJson.movieName = movieName;
            itemJson.text = text;
            linkArr.push(itemJson);
        };
    }
    newMovieLinkArr = (utilFn.shuffle(linkArr));
}

// 获取下载链接
function getDownloadLink($, callback) {
    var downLink = $('#Zoom table').eq(0).find('a').text();
    var movieName = $('.title_all h1 font').text();
    var img = downLink && movieName ? $('#Zoom span img').eq(0).attr('src') : '';
    var text = downLink && movieName ? $('#Zoom span').text() : '';
    var obj = {
        'downLink': downLink,
        'movieName': movieName,
        'img': img,
        'text': text
    };
    if (!downLink) {
        obj.downLink = '该电影暂无链接';
    }
    callback(obj);
}
// 添加更新保存
var dbHandler = require('./../common/dbhandler');
var UUID = require('./../common/uuid-v4');
const tabName = 'movie';
const dbName = 'OTHER'
function addMongo(obj) {
    function savStock() {
        obj.id = UUID();
        obj.time = new Date();
        dbHandler('add', tabName, obj, dbName).then((data) => {
            console.log(obj.movieName + '   添加成功')
        })
    }
    function updata() {
        obj.time = new Date();
        dbHandler('update', tabName, [{ movieName: obj.movieName }, { $set: obj }], dbName).then((data) => {
            console.log(obj.movieName + '   更新成功')
        });
    }
    dbHandler('find', tabName, { "movieName": obj.movieName }, dbName).then((data) => {
        if (data.length) {
            updata(data)
        } else {
            savStock();
        }
    });
}
module.exports = router;