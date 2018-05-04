'use strict'

var path = require('path')
var util = require('./libs/util.js')
var wechat_file = path.join(__dirname,'./config/wechat.txt')
var config = {
	wechat:{
		appID:'wx0c9e8118e705bf33',
		appSecret :'fe6b05a82c4358f1852134e567dfacb5',
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