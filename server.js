var http = require('http');
var querystring = require('querystring');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
const favicon = require('express-favicon');
var __config = require('./common/config');
var util = require('./common/util') || {};
var app = express();

app.use(favicon(path.resolve(__dirname, '../_nginxroot_/static/image/favicon.ico')));
app.use(cookieParser('sessiontest'));
app.use(session({
    secret: 'sessiontest',
    resave: false,
    saveUninitialized: false
}));

var port = 51314;
var musicApi = require('./apiJS/musicApi');
var stockApi = require('./apiJS/stockApi');
var userApi = require('./apiJS/userApi');
var captureApi = require('./apiJS/captureApi');
var typeComApi = require('./apiJS/typeComApi');
var weiXinSign = require('./wxsign/weiXinSign');
var wechat = require('./wxsign/wechat');
var oauth = require('./wxsign/oauth');
var upload = require('./apiJS/upLoad')
var checkCard = require('./apiJS/checkCard')
var puppeteer = require('./apiJS/puppeteer')
var utilApi = require('./apiJS/utilApi')
var miniApi = require('./mini/index')

app.use(bodyParser.urlencoded({ extended: false, "limit": "30000kb" }));
app.use(bodyParser.json({ "limit": "30000kb" }));
app.use(express.static(path.resolve(__dirname, '../_nginxroot_')));
var originArr = __config.cross_domain || []; //要允许跨域的白名单列表;
app.use('/*', function (req, res, next) {
    var origin = req.headers.origin;
    var replaceOrigin = origin ? origin.replace(/^((http:|https:)?\/\/)|\/$/g, '') : '';
    if (origin && ((origin.indexOf('wzytop.') > -1) || (originArr.indexOf(replaceOrigin) > -1))) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header('Access-Control-Max-Age', 24 * 60 * 60);
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        res.header('Access-Control-Allow-Credentials', true);
    }
    util.reqcookie && util.reqcookie(req, res)
    next();
});
app.use('', musicApi);
app.use('', stockApi);
app.use('', userApi);
app.use('', captureApi);
app.use('', typeComApi);
app.use(weiXinSign);
app.use(wechat);
app.use(oauth);
app.use('', upload);
app.use('', checkCard);
app.use('', puppeteer);
app.use('', utilApi)
app.use('', miniApi)

http.createServer(app).listen(port, function (request, res) {
    console.log('listen: http://localhost:' + port);
});