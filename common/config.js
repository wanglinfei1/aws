/**
 * Created by wanglinfei on 2017/11/10.
 */
var pro= {
    host : '118.24.172.195',
    port : 27027,
    username : 'root',
    password : 'wang%401206',
    dbName : 'test',
};
 var dev = {
    host : 'localhost',
    port : 27017,
    username : 'admin',
    password : '123456',
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
    pro:pro,
    dev:dev,
    codeMsg:codeMsg,
    osconfig:osconfig
}
