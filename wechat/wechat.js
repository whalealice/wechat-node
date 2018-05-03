'use strict'
var Promise = require("bluebird")
var request = Promise.promisify(require('request'))
var _ = require('lodash')
var util = require('./util')
var fs = require('fs')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
	accessToken: prefix + 'token?grant_type=client_credential',
	temporary: {
		upload: prefix + 'media/upload?'
	},
	permanent: {
		upload: prefix + 'material/add_material?', // 新增其他类型永久素材
		uploadNews: prefix + 'material/add_news?', // 新增永久图文素材
		uploadImg: prefix + 'media/uploadimg?', // 上传图文消息内的图片获取URL
	}


}
function Wechat(opts) {
	this.appId = opts.appId
	this.appSecret = opts.appSecret
	this.getAccessToken = opts.getAccessToken
	this.saveAccessToken = opts.saveAccessToken
	this.getTicket = opts.getTicket
	this.saveTicket = opts.saveTicket

	this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken = function () {
	var that = this

	return this.getAccessToken()
	.then(function (data) {
		try {
			data = JSON.parse(data)
		}
		catch (e) {
			return that.updateAccessToken()
		}

		if (that.isValidAccessToken(data)) {
			return Promise.resolve(data)
		}
		else {
			return that.updateAccessToken()
		}
	})
	.then(function (data) {
		that.access_token = data.access_token
		that.expires_in = data.expires_in
		that.saveAccessToken(data)
		return Promise.resolve(data)
	})
}
// 验证access_token是否存在或者过期
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
// 更新access_token
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
// 上传临时素材
Wechat.prototype.uploadMaterial = function (type, material, permanent) {
	// type为news,图文  material为数组

	var that = this
	var form = {}
	var uploadUrl = api.temporary.upload // 默认初始为上传临时素材的url

	// 判断传入的第三个参数 如果为永久素材
	if (permanent) {
		uploadUrl = api.permanent.upload
		_.extend(form, permanent)
	}
	// 判断传入的第一个参数 如果是'pic'就是图文消息内的图片获取URL
	if (type === 'pic'){
		uploadUrl = api.permanent.uploadImg
	}
	if (type === 'news'){
		uploadUrl = api.permanent.uploadNews
		form = material
	}
	else {
		form.media = fs.createReadStream(material)
	}

	return new Promise(function (resolve, reject) {
		that
		.fetchAccessToken()
		.then(function (data) {
			var url = uploadUrl + 'access_token=' + data.access_token
			// 判断如果不是永久素材要给url + type
			if (!permanent) {
				url += '&type=' + type
			}
			else {
				form.access_token = data.access_token
			}

			var options = {
				method: 'POST',
				url: url,
				json: true
			}

			if (type === 'news') {
				options.body = form
			}
			else {
				options.formData = form
			}
			console.log(options)
			request(options).then(function(response){
				var _data = response.body
				if (_data) {
					resolve(_data)
				}
				else{
					throw new Error('error')
				}

			})
			.catch(function(err){
				reject(err)
			})
		})
	})
}
// 自动回复
Wechat.prototype.reply = function () {
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