/**
 * Created by wanglinfei on 2018/11/10.
 */

var pro = {
    host: '118.24.172.195',
    port: 27027,
    username: 'root',
    password: 'wang%401206'
};
var dev = {
    host: 'localhost',
    port: 27017,
    username: 'admin',
    password: '123456'
};
var cross_domain = [
    'wlf.sina.com.cn',
    'wlf.sina.com.cn:8080',
    'sports.sina.com.cn',
    'lg-duaeoj4c-1255449337.file.myqcloud.com'
];
var codeMsg = {};

module.exports = {
    pro: pro,
    dev: dev,
    codeMsg: codeMsg,
    cross_domain: cross_domain
}
