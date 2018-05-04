'use strict'
var Promise = require("bluebird")
var request = Promise.promisify(require('request'))
var _ = require('lodash')
var util = require('./util')
var fs = require('fs')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/'
var semanticUrl = 'https://api.weixin.qq.com/semantic/search?'
var api = {
	accessToken: prefix + 'token?grant_type=client_credential',
	temporary: {
		upload: prefix + 'media/upload?',
		fetch: prefix + 'media/get?'
	},
	permanent: {
		upload: prefix + 'material/add_material?', // 新增其他类型永久素材
		fetch: prefix + 'material/get_material?',
		uploadNews: prefix + 'material/add_news?', // 新增永久图文素材
		uploadImg: prefix + 'media/uploadimg?', // 上传图文消息内的图片获取URL
		del: prefix + 'material/del_material?',
		update: prefix + 'material/update_news?',
		count: prefix + 'material/get_materialcount?',
		batch: prefix + 'material/batchget_material?'
	},
	group: {
		create: prefix + 'groups/create?',
		fetch: prefix + 'groups/get?',
		check: prefix + 'groups/getid?',
		update: prefix + 'groups/update?',
		move: prefix + 'groups/members/update?',
		batchupdate: prefix + 'groups/members/batchupdate?',
		del: prefix + 'groups/delete?'
	},
	user: {
		remark: prefix + 'user/info/updateremark?',
		fetch: prefix + 'user/info?',
		batchFetch: prefix + 'user/info/batchget?',
		list: prefix + 'user/get?'
	},
	mass: {
		group: prefix + 'message/mass/sendall?',
		openId: prefix + 'message/mass/send?',
		del: prefix + 'message/mass/delete?',
		preview: prefix + 'message/mass/preview?',
		check: prefix + 'message/mass/get?'
	},
	menu: {
		create: prefix + 'menu/create?',
		get: prefix + 'menu/get?',
		del: prefix + 'menu/delete?',
		current: prefix + 'get_current_selfmenu_info?'
	},
	qrcode: {
		create: prefix + 'qrcode/create?',
		show: mpPrefix + 'showqrcode?'
	},
	shortUrl: {
		create: prefix + 'shorturl?'
	},
	ticket: {
		get: prefix + 'ticket/getticket?'
	}


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
	var appID = this.appID
	var appSecret = this.appSecret
	var url = api.accessToken + '&appId=' + appID + '&secret=' + appSecret
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

			request({
				method: 'POST',
				url: 'https://api.weixin.qq.com/cgi-bin/material/add_material?access_token='+data.access_token+'&type=video',
				json: true,
				body: {
					media: fs.createReadStream(material),
					description: {"title":'奈良的小鹿', "introduction":'小鹿舔了一手口水'},
					type:'video'
				}
			}).then(function(response){
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

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
	var that = this
	var fetchUrl = api.temporary.fetch

	if (permanent) {
		fetchUrl = api.permanent.fetch
	}

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = fetchUrl + 'access_token=' + data.access_token
			var form = {}
			var options = {method: 'POST', url: url, json: true}

			if (permanent) {
				form.media_id = mediaId
				form.access_token = data.access_token
				options.body = form
			}
			else {
				if (type === 'video') {
					url = url.replace('https://', 'http://')
				}

				url += '&media_id=' + mediaId
			}

			if (type === 'news' || type === 'video') {
				request(options).then(function(response) {
					var _data = response.body

					if (_data) {
						resolve(_data)
					}
					else {
						throw new Error('fetch material fails')
					}
				})
				.catch(function(err) {
					reject(err)
				})
			}
			else {
				resolve(url)
			}
		})
	})
}

Wechat.prototype.deleteMaterial = function(mediaId) {
	var that = this
	var form = {
		media_id: mediaId
	}

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Delete material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.updateMaterial = function(mediaId, news) {
	var that = this
	var form = {
		media_id: mediaId
	}

	_.extend(form, news)

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + mediaId

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Delete material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.countMaterial = function() {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.permanent.count + 'access_token=' + data.access_token

			request({method: 'GET', url: url, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Count material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.batchMaterial = function(options) {
	var that = this

	options.type = options.type || 'image'
	options.offset = options.offset || 0
	options.count = options.count || 1

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.permanent.batch + 'access_token=' + data.access_token

			request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('batch material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.createGroup = function(name) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.group.create + 'access_token=' + data.access_token
			var form = {
				group: {
					name: name
				}
			}

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('create group material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.fetchGroups = function(name) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.group.fetch + 'access_token=' + data.access_token

			request({url: url, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Fetch group fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.checkGroup = function(openId) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.group.check + 'access_token=' + data.access_token
			var form = {
				openid: openId
			}

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Check group fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.updateGroup = function(id, name) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.group.update + 'access_token=' + data.access_token
			var form = {
				group: {
					id: id,
					name: name
				}
			}

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Update group fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.moveGroup = function(openIds, to) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url
			var form = {
				to_groupid: to
			}

			if (_.isArray(openIds)) {
				url = api.group.batchupdate + 'access_token=' + data.access_token
				form.openid_list = openIds
			}
			else {
				url = api.group.move + 'access_token=' + data.access_token
				form.openid = openIds
			}

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Move group fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.deleteGroup = function(id) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.group.del + 'access_token=' + data.access_token
			var form = {
				group: {
					id: id
				}
			}

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Delete group fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.remarkUser = function(openId, remark) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.user.remark + 'access_token=' + data.access_token
			var form = {
				openid: openId,
				remark: remark
			}

			request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Remark user fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.fetchUsers = function(openIds, lang) {
	var that = this

	lang = lang || 'zh_CN'

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var options = {
				json: true
			}

			if (_.isArray(openIds)) {
				options.url = api.user.batchFetch + 'access_token=' + data.access_token
				options.body = {
					user_list: openIds
				}
				options.method = 'POST'
			}
			else {
				options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang
			}

			request(options).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Fetch user fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		})
	})
}

Wechat.prototype.listUsers = function(openId) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		.fetchAccessToken()
		.then(function(data) {
			var url = api.user.list + 'access_token=' + data.access_token

			if (openId) {
				url += '&next_openid=' + openId
			}

			request({url: url, json: true}).then(function(response) {
				var _data = response.body

				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('List user fails')
				}
			})
			.catch(function(err) {
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