var http = require('http');
var querystring = require('querystring');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
const favicon = require('express-favicon');
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

app.use(bodyParser.urlencoded({ extended: false, "limit": "30000kb" }));
app.use(bodyParser.json({ "limit": "30000kb" }));
app.use(express.static(path.resolve(__dirname, '../_nginxroot_')));
var originArr = []; //要允许跨域的白名单列表
app.use('/*', function(req, res, next) {
    var origin = req.headers.origin;
    var replaceOrigin = origin ? origin.replace(/http[s]?:\/\//g, '') : '';
    if (origin && ((origin.indexOf('wzytop.cn') > -1) || (origin.indexOf('wzytop.xyz') > -1) || (origin.indexOf('wzytop.top') > -1) || (originArr.indexOf(replaceOrigin) > -1))) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
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

http.createServer(app).listen(port, function(request, res) {
    console.log('listen: http://localhost:' + port);
});