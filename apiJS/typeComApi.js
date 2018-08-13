/**
 * Created by wanglinfei on 2017/9/25.
 */
var dbHandler = require('./../common/dbhandler');
var express = require('express');
var router = express.Router();
var UUID = require('./../common/uuid-v4');

router.get('/typeComApi/get/:id',(req,res) => {
  var tabName = req.query.tabName;
  if(!tabName){
    res.send({code:-1,data:'tabName必填',  msg:'请求成功'});
    return;
  }
  var id = req.params.id;
  if(id){
    dbHandler('find',tabName,{"id":id}).then(data =>{
      res.send({code:0,data:data,  msg:'请求成功'})
    }).catch(err => {
      res.send(err)
    });
  }else{
    res.send({code:101,data:'id必填',  msg:'请求成功'})
  }
});
//删除用户
router.get('/typeComApi/delete/:id', (req, res) => {
  var tabName = req.query.tabName;
  if(!tabName){
    res.send({code:-1,data:'tabName必填',  msg:'请求成功'});
    return;
  }
  var id = req.params.id;
  dbHandler('delete',tabName,{id:id}).then(data =>{
    res.send({code:0,data:data,  msg:'删除成功'})
  });
});
// 添加更新保存
router.get('/typeComApi/create',(req,res) => {
  var reqData=req.query;
  var tabName = reqData.tabName;
  if(!tabName){
    res.send({code:-1,data:'tabName必填',  msg:'请求成功'});
    return;
  }
  function savStock(){
    reqData.id=UUID();
    reqData.time=new Date();
    dbHandler('add',tabName,reqData).then((data) => {
      res.send({code:0,data:data,  msg:'添加成功'})
    })
  }
  function updata() {
    reqData.time=new Date();
    dbHandler('update',tabName,[{id: reqData.id},{$set:reqData}]).then((data)=> {
      res.send({code:0,data:data,  msg:'更新成功'})
    });
  }
  dbHandler('find',tabName,{"id":reqData.id}).then((data) =>{
    if(data.length){
      updata(data)
    }else{
      savStock();
    }
  });
});
/*分页查询列表*/
router.get('/typeComApi/list', (req, res) => {
  var name = req.query.name;
  var listName = req.query.listName;
  var tabName = req.query.tabName;
  if(!tabName){
    res.send({code:-1,data:'tabName必填',  msg:'请求成功'});
    return;
  }
  var queryList={};
  if(listName&&name){
    queryList[listName]=name
  }
  var sort = req.query.sort||1;
  var limit = parseInt(req.query.pageSize||10); //页数
  var skip = (parseInt(req.query.pageNum||1)-1) * limit; //页码
  var json = {};
  if(sort){
    json['time'] = sort;
  }
  var total
  dbHandler('find',tabName,queryList).then(data => {
    total = data.length;
    dbHandler('findList',tabName,[queryList,skip,limit,json]).then(data => {
      res.send({code:0,data:data,  msg:'请求成功',total:total})
    })
  });
});

module.exports = router;
