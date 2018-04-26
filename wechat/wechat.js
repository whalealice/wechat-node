'use strict'
var Promise = require("bluebird")
var request = Promise.promisify(require('request'))
var util = require('./util')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
	accessToken : prefix + 'token?grant_type=client_credential'
}
function Wechat(opts) {
  	this.appID = opts.appID
  	this.appSecret = opts.appSecret
  	this.getAccessToken = opts.getAccessToken
  	this.saveAccessToken = opts.saveAccessToken
  	this.getTicket = opts.getTicket
  	this.saveTicket = opts.saveTicket

  	this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken = function() {
  	var that = this

  	return this.getAccessToken()
    	.then(function(data) {
      	try {
        	data = JSON.parse(data)
      	}
      	catch(e) {
    		return that.updateAccessToken()
      	}

      	if (that.isValidAccessToken(data)) {
        	return Promise.resolve(data)
      	}
     	else {
        	return that.updateAccessToken()
      	}
    })
    .then(function(data) {
    	that.access_token = data.access_token
		that.expires_in = data.expires_in
      	return that.saveAccessToken(data)
    })
}
// function Wechat(opts){
// 	var that = this
// 	this.appId = opts.appId
// 	this.appSecret = opts.appSecret
// 	this.getAccessToken = opts.getAccessToken
// 	this.saveAccessToken = opts.saveAccessToken

// 	return this.getAccessToken()
// 		.then(function(data){
// 			// 获取到access_token 转成json
// 			try {
// 				data = JSON.parse(data)
// 			}
// 			catch (e){
// 				//过期 更新access_token
// 				return that.updateAccessToken()
// 			}
// 			//验证合法性
// 			if (that.isValidAccessToken(data)) {
// 				console.log('1')
// 				return Promise.resolve(data)
// 			}
// 			else { 
// 				console.log('2')
// 				return that.updateAccessToken()
// 			}
// 		})
// 		.then(function(data){
// 			console.log('3')
// 			that.access_token = data.access_token
// 			that.expires_in = data.expires_in
// 			console.log(data)
// 			return that.saveAccessToken(data)
// 		})
// }
Wechat.prototype.isValidAccessToken = function(data){
	if(!data || !data.access_token || !data.expires_in){
		return false
	}
	var access_token = data.access_token
	var expires_in = data.expires_in
	var now = (new Date().getTime())
	//判断access_token的过期时间 < 当前时间
	if(now < expires_in) {
		return true
	}
	else {
		return false
	}
}

Wechat.prototype.updateAccessToken = function(){
	var appId = this.appId
	var appSecret = this.appSecret
	var url = api.accessToken + '&appId=' + appId + '&secret=' + appSecret

	return new Promise(function(resolve,reject){
		request({url:url,json:true}).then(function(response){
			var data = response.body
			var now = (new Date().getTime())
			var expires_in = now + (data.expires_in -20) * 1000
			//把新的有效时间赋值
			data.expires_in = expires_in
			resolve(data)
		})
	})
}

Wechat.prototype.reply = function() {
  var content = this.body
  var message = this.weixin
  var xml = util.tpl(content, message)

  this.status = 200
  this.type = 'application/xml'
  this.body = xml
  console.log(xml)
  return
}

module.exports = Wechat