'use strict'

var config = require('./config')
var Wechat = require('./wechat/wechat')
var wechatApi = new Wechat(config.wechat)

exports.reply = function* (next){
	var message = this.weixin
	if(message.MsgType === 'event'){
	  if(message.Event === 'subscribe'){
	    if(message.EventKey) {
	      console.log('扫描二维码关注：'+ message.EventKey +' '+ message.ticket);
	    }
	    this.body = '终于等到你，还好我没放弃';
	  }else if(message.Event === 'unsubscribe'){
	    this.body = '';
	    console.log(message.FromUserName + ' 悄悄地走了...');
	  }else if(message.Event === 'LOCATION'){
	    this.body = '您上报的地理位置是：'+ message.Latitude + ',' + message.Longitude;
	  }else if(message.Event === 'CLICK'){
	    this.body = '您点击了菜单：'+ message.EventKey;
	  }else if(message.Event === 'SCAN'){
	    this.body = '关注后扫描二维码：'+ message.Ticket;
	  }
	}
	else if(message.MsgType === 'text'){

	  var content = message.Content;
	 	
	  var reply = '你说的话：“' + content + '”，我听不懂呀';
	  if(content === '马新宁'){
	    reply = '马新宁？他可能有个小公主！'
	  }
	  else if(content === '图片'){
	    var data = yield wechatApi.uploadMaterial('image',__dirname + '/assect/1.jpg')
			reply = {
	    	type: 'image',
				mediaId: data.media_id
			}
	  }
	  else if(content === '视频'){
			var data = yield wechatApi.uploadMaterial('video',__dirname + '/assect/2.mp4')
			reply = {
				type: 'video',
				title: '奈良的小鹿',
				description: '小鹿舔了一手口水',
				mediaId: data.media_id
			}
	  }
		else if(content === '音乐'){
			var data = yield wechatApi.uploadMaterial('image',__dirname + '/assect/1.jpg')
			reply = {
				type: 'music',
				title: '粉红色的回忆',
				description: '给你一个粉红色的回忆',
				musicUrl: 'http://music.163.com/song/media/outer/url?id=317151.mp3',
				HQMusicUrl: 'http://music.163.com/song/media/outer/url?id=317151.mp3',
				thumbMediaId: data.media_id,
			}
		}
		else if(content === '1'){
			var data = yield wechatApi.uploadMaterial('video',__dirname + '/assect/2.mp4',{
				type: 'video', description: {"title":'奈良的小鹿', "introduction":'小鹿舔了一手口水'}
			})
			reply = {
				type: 'video',
				title: '奈良的小鹿',
				description: '小鹿舔了一手口水',
				mediaId: data.media_id
			}
		}
		else if (content === '2') {
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/assect/1.jpg', {type: 'image'})

			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		}
		else if (content === '3') {
			var picData = yield wechatApi.uploadMaterial('image', __dirname, '/assect/1.jpg', {})

			var media = {
				articles: [{
					title: 'tututu4',
					thumb_media_id: picData.media_id,
					author: 'Scott',
					digest: '没有摘要',
					show_cover_pic: 1,
					content: '没有内容',
					content_source_url: 'https://github.com'
				}, {
					title: 'tututu5',
					thumb_media_id: picData.media_id,
					author: 'Scott',
					digest: '没有摘要',
					show_cover_pic: 1,
					content: '没有内容',
					content_source_url: 'https://github.com'
				}]
			}

			data = yield wechatApi.uploadMaterial('news', media, {})
			data = yield wechatApi.fetchMaterial(data.media_id, 'news', {})

			console.log(data)

			var items = data.news_item
			var news = []

			items.forEach(function(item) {
				news.push({
					title: item.title,
					decription: item.digest,
					picUrl: picData.url,
					url: item.url
				})
			})

			reply = news
		}
		else if (content === '4') {
			// var group = yield wechatApi.createGroup('小仙女')
			// console.log('新分组 小仙女')
			// console.log(group)

			// var groups = yield wechatApi.fetchGroups()
			// console.log('加了分组 小仙女')
			// console.log(groups)

			var group2 = yield wechatApi.checkGroup(message.FromUserName)
			console.log('查看自己的分组')
			console.log(group2)

			var move = yield wechatApi.moveGroup(message.FromUserName,101)
			console.log('移动自己到101')
			console.log(move)

			var group3 = yield wechatApi.checkGroup(message.FromUserName)
			console.log('查看自己移动后的分组')
			console.log(group3)

			reply = 'group done'
		}
		else if (content === '5') {
			var user = yield wechatApi.fetchUsers(message.FromUserName, 'en')

			console.log(user)

			var openIds = [
				{
					openid: message.FromUserName,
					lang: 'en'
				}
			]

			var users = yield wechatApi.fetchUsers(openIds)

			console.log(users)

			reply = JSON.stringify(user)
		}
		else if (content === '6') {
			var userlist = yield wechatApi.listUsers()

			console.log(userlist)

			reply = userlist.total
		}
		
	  this.body = reply
	}
	else {
		this.body = '不要老说些无聊的废话！！'
	}
	yield next
}