'use strict'
var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var config = require('./config')
var weixin = require('./weixin')
var wechat_file = path.join(__dirname,'./config/wechat.txt')

var app = new Koa()

app.use(wechat(config.wechat,weixin.reply)) //此处传入两个参数，第二个参数为whchat的handler

app.listen(3100)  //监听端口
console.log('listin 3100')