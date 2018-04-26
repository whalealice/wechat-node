'use strict'

exports.reply = function* (next){
	var message = this.weixin
console.log(message)
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
	  // else if(content === '2'){
	  //   reply = {
	  //     type:'image',
	  //     mediaId:'http://tu.23juqing.com/d/file/html/gndy/dyzz/2017-04-09/da9c7a64ab7df196d08b4b327ef248f2.jpg'
	  //   }
	  // }
	  // else if(content === '3'){
	  //   reply = [{
	  //     title:'金刚.骷髅岛',
	  //     description:'南太平洋上的神秘岛屿——骷髅岛。史上最大金刚与邪恶骷髅蜥蜴的较量。',
	  //     picUrl:'http://tu.23juqing.com/d/file/html/gndy/dyzz/2017-04-09/da9c7a64ab7df196d08b4b327ef248f2.jpg',
	  //     url:'http://www.piaohua.com/html/dongzuo/2017/0409/31921.html' //可下载观看喔
	  //   }]
	  // }
	  this.body = reply
	}
	else {
		this.body = '不要老说些无聊的废话！！'
	}
	yield next
}