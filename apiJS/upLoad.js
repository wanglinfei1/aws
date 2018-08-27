const COS = require('cos-nodejs-sdk-v5');
var express = require('express');
var router = express.Router();
const request = require('request');
const formidable = require("formidable");
var config = require('../common/config.js');
const fs = require('fs');
config = config.osconfig;
const cos = new COS({
  SecretId: config.SecretId,
  SecretKey: config.SecretKey,
});
const checkFile = (key, cb) => {
  cos.headObject({
    Bucket: config.Bucket,
    Region: config.Region,
    Key: key //查询key
  }, cb);
};
const osPut = (files,key,res,buffer) =>{
  cos.putObject({
    Bucket: config.Bucket,
    Region: config.Region,
    Key: key,
    'ContentLength':files.file.size,
    Body: buffer,
  }, function(err, data) {
    fs.unlink(files.file.path)
    if (err) {
      res.send(err)
    } else {
      if(data.statusCode === 200){
        data.url = config.osHost +key;
        res.send(data)
      }else{
        res.send(data)
      }
    }
  })
}
var upLoad=function (files,req,res,buffer){
  var path = req.query.path || config.path;
  var replace = req.query.replace || '';
  var key = path+'/'+files.file.name
  if(replace&&replace=='true'){
    osPut(files,key,res,buffer)
  }else{
    checkFile(key,function(err,data){
      if (err) {
        if (err.statusCode == 404) {
          osPut(files,key,res,buffer)
        } else {
          fs.unlink(files.file.path)
          res.send(err)
        }
      } else {
        if(data.statusCode == 200) {
          data.msg = '文件已存在'
          data.url = config.osHost +key;
          fs.unlink(files.file.path)
          res.send(data);
        } else {
          osPut(files,key,res,buffer);
        }
      }
    })
  }

};
router.post('/upload',function (req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = "./dir";
  form.keepExtensions = true;
  form.parse(req, function(err, fields, files) {
    var buffer = fs.createReadStream(files.file.path)
    upLoad(files,req,res,buffer)
  });
});
module.exports = router;
