'use strict'

var path = require('path')
var util = require('./libs/util.js')
var wechat_file = path.join(__dirname,'./config/wechat.txt')
var config = {
	wechat:{
		appId:'wx18cead27122e8740',
		appSecret :'42ea519d6e1efffa84471b2139a8b285',
		token:'ploaris20180101',
		getAccessToken:()=>{
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken:(data)=>{
			data = JSON.stringify(data)
			return util.writeFileAsync(wechat_file,data)
		}
	}
}
module.exports = config