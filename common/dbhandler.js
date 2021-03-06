/**
 * Created by wanglinfei on 2017/12/1.
 */
var mongo = require("mongodb"); //@2.2.11
var MongoClient = mongo.MongoClient;
var assert = require('assert');
var __config = require('./config.js');
var envType = process.env.NODE_ENV == 'dev' ? 'dev' : 'pro';
var config = __config[envType];
var db_host = config.host,
    db_port = config.port,
    username = config.username,
    password = config.password,
    Urls;
if (username && password) {
    Urls = "mongodb://" + username + ':' + password + '@' + db_host + ":" + db_port
} else {
    Urls = "mongodb://" + db_host + ":" + db_port
}
//add一条数据
var add = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        collection.insertMany([selector], function(err, result) {
            try { assert.equal(err, null) } catch (e) {
                console.log(e);
                reject(e)
            }
            resolve(result.ops[0]);
            db.close();
        });
    })
};
//delete
var deletes = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        collection.deleteOne(selector, function(err, result) {
            try { assert.equal(err, null) } catch (e) {
                console.log(e);
                reject(e)
            }
            resolve(result);
            db.close();
        });
    })

};
//find
var find = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        collection.find(selector).toArray(function(err, docs) {
            try { assert.equal(err, null); } catch (e) {
                reject(e);
                console.log(e);
                docs = [];
            }
            resolve(docs);
            db.close();
        });
    })
};
//总数查询
var count = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        collection.find(selector).count().then((num) => {
            resolve(num)
        })
    })
};
//find分页
var findList = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        var __count = ''
        count(db, collection, selector[0]).then((num) => {
            __count = num
        })
        collection.find(selector[0]).skip(selector[1]).limit(selector[2]).sort(selector[3]).toArray(function(err, docs) {
            try { assert.equal(err, null); } catch (e) {
                reject(e);
                console.log(e);
                docs = [];
            }
            __count && (docs.count = __count)
            resolve(docs);
            db.close();
        });
    })
};
//update
var updates = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        collection.updateOne(selector[0], selector[1], { upsert: true }, function(err, result) {
            try { assert.equal(err, null) } catch (e) {
                reject(e);
            }
            assert.equal(1, result.result.n);
            resolve(result);
            db.close();
        });
    })
};
var updateMany = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        collection.updateMany(selector[0], selector[1], { upsert: false, multi: true }, function(err, result) {
            try { assert.equal(err, null) } catch (e) {
                reject(e);
            }
            assert.equal(1, result.result.ok);
            resolve(result);
            db.close();
        });
    })
};
var getNumId = function(db, collection, queryInfo) {
    return new Promise((resolve, reject) => {
        collection.findAndModify({ 'name': 'NumId' }, [], {
            $inc: {
                [queryInfo]: 1
            }
        }, { 'new': true }, function(err, data) {
            if (err) throw err;
            if (data.ok == 1 && data.value != null) {
                resolve(data.value[queryInfo]);
                db.close();
            } else {
                collection.insertMany([{ name: 'NumId', [queryInfo]: 1 }], function(err, result) {
                    try { assert.equal(err, null) } catch (e) {
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
// 聚合查询 aggregate
var aggregate = function(db, collection, selector) {
    return new Promise((resolve, reject) => {
        collection.aggregate(selector, {}).toArray(function(err, docs) {
            try { assert.equal(err, null); } catch (e) {
                reject(e);
                docs = [];
            }
            resolve(docs);
            db.close();
        });;
    })
};
//方法都赋值到操作对象上，便于调用
var methodType = {
    count: count,
    add: add,
    update: updates,
    updateMany: updateMany,
    delete: deletes,
    find: find,
    getNumId: getNumId,
    findList: findList,
    aggregate: aggregate
};
//主逻辑
module.exports = function(action, collections, selector, db_name) {
    action = action || 'find';
    var __dbName = (db_name || 'OTHER')
    var __Urls = Urls + '/' + __dbName;
    return new Promise((resolve, reject) => {
        MongoClient.connect(Urls, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
            try {
                assert.equal(null, err);
            } catch (err) { console.log(err) }
            if (db) {
                var collection = db.db(__dbName).collection(collections);
                console.log("Connected success====" + __Urls + '/' + collections);
                methodType[action](db, collection, selector).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                });
            } else {
                console.log("Connected error====" + __Urls);
                reject({ db: null })
            }
        });

    })
};