/**
 * Created by wanglinfei on 2017/11/10.
 */
var products= {
    host : 'mongo.duapp.com',
    port : '8908',
    username : '8ad8cb249b814e799ca510973a9e9272',
    password : '227010ff16ea43b3ba2cc8e2c299dc92',
    dbName : 'zPfebfyHgPUJuydnHSbS',
};
 var dev = {
    host : 'localhost',
    port : 27017,
    username : '',
    password : '',
    dbName : 'test',
};
var codeMsg = {}
var osconfig = {
    SecretId: 'AKIDSijU2L7IuISN3UbeNr67tQ3ScXDejpY2',
    SecretKey: 'OYT9cqqb8RVLwIPHuIRM2UhkY5MN8dtt',
    Bucket: 'wlinfei-1255388564',
    Region: 'ap-chengdu',
    path:'/upload/',
    osHost:'http://ftp.wzytop.top'
};
module.exports ={
    start:dev,
    dev:dev,
    codeMsg:codeMsg,
    osconfig:osconfig
}
