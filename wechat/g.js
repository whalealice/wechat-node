'use strict'
var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

//接入微信 第一步
module.exports = function(opts,handler){
	var wechat = new Wechat(opts)
	return function* (next){
		// var that = this
		var token = opts.token
		var signature = this.query.signature
		var timestamp = this.query.timestamp
		var nonce = this.query.nonce
		var echostr = this.query.echostr
		var str = [token,timestamp,nonce].sort().join('')
		var sha = sha1(str)
		//验证是都是微信过来的get请求
		if (this.method === 'GET') {
			if (sha == signature) {
				this.body = echostr+''
			}
			else {
				this.body = 'wrong'
			}	
		}
		else if (this.method === 'POST') {
			if (sha !== signature) {
				this.body = 'wrong'
				return false
			}
			var data = yield getRawBody(this.req,{
				length: this.length,
				limit: '1mb',
				encoding: this.charset
			})	
	
			//工具 - 解析XML
			var content = yield util.parseXMLAsync(data)
			//工具 - 格式化代码为key - value
			var message = util.formatMessage(content.xml)
			this.weixin = message

			yield handler.call(this,next)
			wechat.reply.call(this)
			
			// if (message.MsgType === 'text') {
			// 	// console.log('111')
			// 	var now = new Date().getTime()
			// 	this.status = 200
			// 	this.type = 'application/xml'
			// 	this.body = '<xml><ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName><FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName><CreateTime>'+now+'</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[亲爱的，欢迎关注美少女加油站！]]></Content></xml>'
			
			// 	// console.log(message.FromUserName,this.body)
			// 	return 
			// }
			
		}
		
	}
}

