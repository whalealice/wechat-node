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
		else if (content === '2') {
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/assect/1.jpg', {type: 'image'})

			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		}
		// else if(content === '1'){
		// 	var data = yield wechatApi.uploadMaterial('video',__dirname + '/assect/2.mp4',{
		// 		type: 'video', description: {"title":'奈良的小鹿', "introduction":'小鹿舔了一手口水'}
		// 	})
		// 	reply = {
		// 		type: 'video',
		// 		title: '奈良的小鹿',
		// 		description: '小鹿舔了一手口水',
		// 		mediaId: data.media_id
		// 	}
		// }
	  this.body = reply
	}
	else {
		this.body = '不要老说些无聊的废话！！'
	}
	yield next
}