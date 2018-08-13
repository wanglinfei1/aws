/**
 * Created by wanglinfei on 2017/12/1.
 */
var mongo=require("mongodb");//@2.2.11
var MongoClient = mongo.MongoClient;
var assert = require('assert');
var __config = require('./config.js');
var envType = process.env.npm_lifecycle_event=='start'?'start':'dev';
var config = __config[envType];
var db_host = config.host,
    db_port = config.port,
    username = config.username,
    password = config.password,
    db_name  = config.dbName,
    Urls;
if(username&&password){
    Urls ="mongodb://"+username+':'+password+'@'+ db_host +":"+ db_port +"/"+ db_name;
}else{
    Urls ="mongodb://"+ db_host +":"+ db_port +"/"+ db_name
}
//add一条数据
var add = function(db,collections,selector){
    return new Promise((resolve,reject) => {
        var collection = db.collection(collections);
        collection.insertMany([selector],function(err,result){
            try{assert.equal(err,null)}catch(e){
                console.log(e);
                reject(e)
            }
            resolve(result.ops[0]);
            db.close();
        });
    })
};
//delete
var deletes = function(db,collections,selector){
    return new Promise((resolve,reject) =>{
        var collection = db.collection(collections);
        collection.deleteOne(selector,function(err,result){
            try{assert.equal(err,null)}catch(e){
                console.log(e);
                reject(e)
            }
            resolve(result);
            db.close();
        });
    })

};
//find
var find = function(db,collections,selector){
    return new Promise((resolve,reject) => {
        var collection = db.collection(collections);
        collection.find(selector).toArray(function(err,docs){
            try{assert.equal(err,null);}catch(e){
                reject(e);
                console.log(e);
                docs = [];
            }
            resolve(docs);
            db.close();
        });
    })
};
//find分页
var findList = function(db,collections,selector){
    return new Promise((resolve,reject) => {
        var collection = db.collection(collections);
        collection.find(selector[0]).skip(selector[1]).limit(selector[2]).sort(selector[3]).toArray(function(err,docs){
            try{assert.equal(err,null);}catch(e){
                reject(e);
                console.log(e);
                docs = [];
            }
            resolve(docs);
            db.close();
        });
    })
};
//update
var updates = function(db,collections,selector){
    return new Promise((reslove,reject) => {
        var collection = db.collection(collections);
        collection.updateOne(selector[0],selector[1],{ upsert: true },function(err,result){
            try{assert.equal(err,null)}catch(e){
                reject(e);
            }
            assert.equal(1,result.result.n);
            reslove(result);
            db.close();
        });
    })
};
var getNumId= function (db,collections,queryInfo) {
    var collection = db.collection(collections);
    return new Promise((resolve,reject) => {
        collection.findAndModify({'name':'NumId'},[], { $inc: { [queryInfo]: 1 } }, {'new':true}, function (err,data) {
            if (err) throw err;
            if(data.ok==1&&data.value!=null){
                resolve(data.value[queryInfo]);
                db.close();
            }else{
                collection.insertMany([{name: 'NumId', [queryInfo]:1}],function(err,result){
                    try{assert.equal(err,null)}catch(e){
                        console.log(e);
                        reject(e)
                    }
                    resolve(result.ops[0][queryInfo]);
                    db.close();
                });
            }
        });
    })
};
//方法都赋值到操作对象上，便于调用
var methodType = {
    add:add,
    update:updates,
    delete:deletes,
    find:find,
    getNumId:getNumId,
    findList:findList
};
//主逻辑
module.exports = function(action,collections,selector){
    action=action||'find';
    return new Promise((resolve,reject) => {
        MongoClient.connect(Urls, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            methodType[action](db,collections,selector).then(res => {
                resolve(res)
            }).catch(err =>{
                reject(err)
            });
        });
    })
};