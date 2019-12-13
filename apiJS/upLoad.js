const COS = require('cos-nodejs-sdk-v5');
var express = require('express');
var router = express.Router();
const formidable = require("formidable");
const fs = require('fs');
var nooe_env = process.env.NODE_ENV == 'dev' ? 'dev' : 'pro';
var UTIL = require('../common/util')
var OSCONFIG = {}
var cos = null

UTIL.getDBConfig('DATA', 'osconfig').then((data) => {
    var config = data[0] || {}
    OSCONFIG = config[nooe_env] || {}
    console.log('OS_CONFIG======' + OSCONFIG.Bucket, OSCONFIG)
})


const checkFile = (key, cb) => {
    if (!cos) {
        return
    }
    cos.headObject({
        Bucket: OSCONFIG.Bucket,
        Region: OSCONFIG.Region,
        Key: key //查询key
    }, cb);
};
const osPut = (files, query, key, res, buffer, resArr) => {
    if (!cos) {
        return
    }
    cos.putObject({
        Bucket: OSCONFIG.Bucket,
        Region: OSCONFIG.Region,
        Key: key,
        'ContentLength': files.size,
        Body: buffer,
    }, function (err, data) {
        fs.unlink(files.path)
        if (err) {
            if (resArr.length < query.lg - 1) {
                resArr.push(err)
            } else {
                resArr.push(err)
                res.send(resArr)
            }
        } else {
            if (data.statusCode === 200) {
                data.url = OSCONFIG.osHost + key;
                if (resArr.length < query.lg - 1) {
                    resArr.push(data)
                } else {
                    resArr.push(data)
                    res.send(resArr)
                }
            } else {
                if (resArr.length < query.lg - 1) {
                    resArr.push(data)
                } else {
                    resArr.push(data)
                    res.send(resArr)
                }
            }
        }
    })
}
var upLoad = function (files, query, res, buffer, resArr) {
    if (!cos) {
        console.log('=======创建云存储OS对象========')
        cos = new COS({
            SecretId: OSCONFIG.SecretId,
            SecretKey: OSCONFIG.SecretKey,
        });
    }
    var path = query.path || OSCONFIG.path;
    if ((path.indexOf('http://') > -1 || path.indexOf('https://') > -1)) {
        path = path.replace(/http[s]?:\/\/ftp\.wzytop\.cn/g, '') || '/'
    }
    var replace = query.replace || '';
    var key = path + files.name
    if (replace && replace == 'true') {
        osPut(files, query, key, res, buffer, resArr)
    } else {
        checkFile(key, function (err, data) {
            if (err) {
                if (err.statusCode == 404) {
                    osPut(files, query, key, res, buffer, resArr)
                } else {
                    fs.unlink(files.path)
                    if (resArr.length < query.lg - 1) {
                        resArr.push(err)
                    } else {
                        resArr.push(err)
                        res.send(resArr)
                    }
                }
            } else {
                if (data.statusCode == 200) {
                    data.msg = '文件已存在'
                    data.url = OSCONFIG.osHost + key;
                    fs.unlink(files.path)
                    if (resArr.length < query.lg - 1) {
                        resArr.push(data)
                    } else {
                        resArr.push(data)
                        res.send(resArr)
                    }
                } else {
                    osPut(files, query, key, res, buffer, resArr);
                }
            }
        })
    }
};
router.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./dir";
    form.keepExtensions = true;
    var resArr = [];
    var filesArr = [];
    var query = req.query;
    form.parse(req, function (err, fields, files) {
        if (!query['lg']) {
            for (var k in files) {
                if (files[k]) {
                    filesArr.push(files[k])
                }
            }
            query['lg'] = filesArr.length;
        }
        for (var k in files) {
            if (files[k]) {
                try {
                    var buffer = fs.createReadStream(files[k].path)
                    upLoad(files[k], query, res, buffer, resArr)
                } catch (err) {
                    console.log(err)
                }
            }
        }
    });
});
module.exports = router;