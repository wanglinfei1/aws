/**
 * Created by wanglinfei on 2017/9/25.
 */
var dbHandler = require('./../common/dbhandler');
var express = require('express');
var router = express.Router();
var UUID = require('./../common/uuid-v4');
var tabName = 'test'
router.get('/stockApi/stock/:id',(req,res) => {
  var stockId = req.params.id;
  if(stockId){
    dbHandler('find',tabName,{"id":stockId}).then(data =>{
      res.send({code:0,data:data,  msg:'请求成功'})
    }).catch(err => {
      res.send(err)
    });
  }else{
    res.send({code:101,data:'id必填',  msg:'请求成功'})
  }
});
//删除用户
router.get('/stockApi/delete/:id', (req, res) => {
  var stockId = req.params.id;
  dbHandler('delete',tabName,{id:stockId}).then(data =>{
    res.send({code:0,data:data,  msg:'删除成功'})
  });
});
// 添加更新保存
router.get('/stockApi/create',(req,res) => {
  var stock=req.query;
  function savStock(){
    stock.id=UUID();
    stock.time=new Date();
    dbHandler('add',tabName,stock).then((data) => {
      res.send({code:0,data:data,  msg:'添加成功'})
    })
  }
  function updata() {
    stock.time=new Date();
    dbHandler('update',tabName,[{id: stock.id},{$set:stock}]).then((data)=> {
      res.send({code:0,data:data,  msg:'更新成功'})
    });
  }
  dbHandler('find',tabName,{"id":stock.id}).then((data) =>{
    if(data.length){
      updata(data)
    }else{
      savStock();
    }
  });
});
/*分页查询列表*/
router.get('/stockApi/list', (req, res) => {
  var name = req.query.name;
  var queryList;
  if(name){
    queryList={name:name}
  }else{
    queryList={}
  }
  var sort = req.query.sort||1;
  var limit = parseInt(req.query.pageSize); //页数
  var skip = (parseInt(req.query.pageNum)-1) * limit; //页码
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
