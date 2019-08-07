/**
 * Created by wanglinfei on 2018/11/10.
 */
var pro = {
    host: '118.24.172.195',
    port: 27027,
    username: 'root',
    password: 'wang%401206',
    dbName: 'test',
};
var dev = {
    host: 'localhost',
    port: 27017,
    username: 'admin',
    password: '123456',
    dbName: 'test',
};
var cross_domain = [
    'wlf.sina.com.cn',
    'wlf.sina.com.cn:8080',
    'sports.sina.com.cn'
];
var codeMsg = {};
var osconfig = {
    SecretId: 'AKIDSijU2L7IuISN3UbeNr67tQ3ScXDejpY2',
    SecretKey: 'OYT9cqqb8RVLwIPHuIRM2UhkY5MN8dtt',
    Bucket: 'wlinfei-1255388564',
    Region: 'ap-chengdu',
    path: '/upload/',
    osHost: '//ftp.wzytop.cn'
};
var os_dev_config = {
    SecretId: 'AKIDiEVWHoR6rNefQw9G6g04sQikWaQ2BbZI',
    SecretKey: 'd2DArIUQ8bolTvBD0Zt36vUnqdARWLuD',
    Bucket: 'lg-duaeoj4c-1255449337',
    Region: 'ap-shanghai',
    path: '/upload/',
    osHost: '//ftp.wzytop.xyz'
};

module.exports = {
    pro: pro,
    dev: dev,
    codeMsg: codeMsg,
    osconfig: osconfig,
    os_dev_config: os_dev_config,
    cross_domain: cross_domain
}
