/*!
 * XinUpload 1.0
 * author : MrXinxi@163.com
 *
 */

(function($){

	"use strict";
	
	var XinUpload = function(element, options){
		this.element = element;
		this.settings = $.extend(true, $.fn.XinUpload.defaults, options || {});
		this.init();
	}
	XinUpload.prototype = {
		init : function(){
			var me = this;
			var selector = me.element.selector;
			var fix = selector.substring(0, 1);
			var tag = me.element[0];
			var files = tag.files;
			me.files = files;

			me._validate();

			if(me.settings.flag){
				me._upload();
			}
		},
		/* 说明：获取文件的个数 */
		length : function(){
			var me = this;
			return me.files.length;
		},
		/* 说明：验证 */
		_validate : function(){
			var me = this;

			//验证对象是否为文件
			if(me.files == undefined && me.settings.callback){
				me.settings.flag = false;
				me.settings.callback('Is not a file');
				return;
			}

			//验证是否选择了文件
			if(me.length() == 0 && me.settings.callback){
				me.settings.flag = false;
				me.settings.callback('No files selected');
				return;
			}

			//验证文件后缀
			if(me.settings.type && me.settings.type != '*' && me.settings.callback){
				for(var i = 0; i < me.length(); i++){
					var file = me.files[i];
					var name = file.name;
					var fix = name.substring(name.lastIndexOf('.'), name.length);
					if(me.settings.type.indexOf(fix) == -1){
						me.settings.flag = false;
						me.settings.callback('The file ' + name + ' type error');
						return;
					}
				}
			}

			//验证单个文件是否超出size
			if(me.settings.size && me.settings.size > 0 && me.settings.callback){
				for(var i = 0; i < me.length(); i++){
					var file = me.files[i];
					var name = file.name;
					var size = file.size;
					if(size > me._mb2byte() && me.settings.callback){
						me.settings.flag = false;
						me.settings.callback('The file ' + name + ' size out of range');
						return;
					}
				}
			}

			//重置flag
			me.settings.flag = true;
		},
		/* 说明：Ajax上传 */
		_upload : function(){
			var me = this;
			try{
				var  xhr = new XMLHttpRequest();
				xhr.open('post', me.settings.url, true);

				//告诉服务器这是一个Ajax请求
				xhr.setRequestHeader('X-Requested-Width', 'XMLHttpRequest');
					
				var data = new FormData();
				for(var i = 0; i < me.length(); i++){
					var file = me.files[i];
					data.append('doc[]', file);
				}
			
				//设置回调函数  
        		xhr.onreadystatechange = function(){
        			//console.log(xhr.readyState + '===' + xhr.status + '===' + xhr.responseText);
        			if(xhr.readyState == 4 && xhr.status == 200 && me.settings.callback){
        				me.settings.callback(xhr.responseText);
						return;
        			}
        		}

        		xhr.onerror = function(){
        			if(me.settings.callback){
						me.settings.callback('File upload error');
						return;
					}
        		}
        		
        		//监听进度
				xhr.upload.addEventListener("progress", function(evt){
					if (evt.lengthComputable) {
		       			me._onProgress(evt.loaded, evt.total);
		   			}
				}, false);
        	
        		//发送给服务器
				xhr.send(data);
			}catch(e){
				if(me.settings.callback){
					me.settings.callback('File upload error');
				}
			}	
		},
		_onProgress : function(value, total){
			var me = this;
			if(me.settings.onProgress){
				me.settings.onProgress(value, total);
			}
		},
		/* 说明：配置的单个文件size转换为byte */
		_mb2byte : function(){
			var me = this;
			if(me.settings.size && me.settings.size > 0){
				return me.settings.size * 1024 * 1024;
			}
		}
	}

	$.fn.XinUpload = function(options){
		var me = $(this);
		return new XinUpload(me, options);
	}
	$.fn.XinUpload.defaults = {
		url : "",
		type : "*",
		size : 0,
		flag : true,
		onProgress : "",
		callback : ""
	}
})(jQuery);