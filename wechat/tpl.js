'use strict'

var ejs = require('ejs')
var heredoc = require('heredoc')

var tpl = heredoc(function(){ /*
	<xml>
	<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
	<FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
	<CreateTime><%= creatTime %></CreateTime>

	<MsgType><![CDATA[<%= msgType %>]]></MsgType>
	<% if (msgType ==='text' ) { %>
		<Content><![CDATA[<%= content %>]]></Content>
	<% } else if (msgType === 'image') { %>
		<Image><MediaId><![CDATA[<%= content.mediaId %>]]></MediaId></Image>
	<% } else if (msgType === 'voice') { %>
		<Voice><MediaId><![CDATA[<%= content.mediaId %>]]></MediaId></Voice>
	<% } else if (msgType === 'video') { %>
		<Video>
			<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
			<Title><![CDATA[<%= content.title %>]]></Title>
			<Description><![CDATA[<%= content.description %>]]></Description>
		</Video>
	<% } else if (msgType === 'music') { %>
		<Music>
			<Title><![CDATA[<%= content.title %>]]></Title>
			<Description><![CDATA[<%= content.description %>]]></Description>
			<MusicUrl><![CDATA[<%= content.MusicURL %>]]></MusicUrl>
			<HQMusicUrl><![CDATA[<%= content.HQMusicUrl %>]]></HQMusicUrl>
			<ThumbMediaId><![CDATA[<%= content.ThumbMediaId %>]]></ThumbMediaId>
		</Music>
	<% } else if (msgType === 'news') { %>
		<ArticleCount><% content.length %></ArticleCount>
		<Articles>
			<% content.forEach(function(item){ %>
				<item>
					<Title>< ![CDATA[<%= item.title %>] ]></Title> 
					<Description>< ![CDATA[<%= item.description %>] ]></Description>
					<PicUrl>< ![CDATA[<%= item.PicUrl %>] ]></PicUrl>
					<Url>< ![CDATA[<%= item.Url %>] ]></Url>
				</item>
			<% }) %>
		</Articles>
	<% } %>
	</xml>
*/})

var compiled = ejs.compile(tpl)

exports = module.exports = {
	compiled: compiled
}
