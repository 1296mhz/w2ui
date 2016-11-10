/***********************************
*
* -- This the jsUtils class
*
***********************************/

var jsUtils = {
	// date/time formats
	format_date: 'mm/dd/yyyy',
	format_time: 'hh:mi pm',

	init: function(sys_path) {
		this.sys_path = sys_path;		
		// -- detect engine can be: IE5, IE7, IE8, IE9, Gecko, WebKit
		if (navigator.appName == 'Microsoft Internet Explorer')	{
			if (document.documentMode) { // IE8 or later
				this.engine = 'IE'+document.documentMode;
			} else { // IE 5-7
				this.engine = 'IE'+5; // Assume quirks mode unless proven otherwise
				if (document.compatMode) if (document.compatMode == "CSS1Compat") {
					this.engine = 'IE'+7; // standards mode
				}
			}
		}
		if (String(navigator.userAgent).indexOf('Gecko/') > 0) {
			this.engine = "Gecko";
		}
		if (String(navigator.userAgent).indexOf('WebKit/') > 0) {
			this.engine = "WebKit";
		}
		// -- initialize
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }
		win.elements = [];
	},
	
	get: function (url, data, callback) {
		// -- process parameters
		var url_add = '';
		for (var key in data) { 
			if (url_add != '') url_add += '&'; 
			url_add += key + '=' + data[key]; 
		}
		
		// -- create element
		var frm = document.createElement('iframe');
		frm.frameBorder    = 0;
		frm.style.cssText += 'position: absolute; left: -10; top: -10 width: 1px; height: 1px;';
		frm.src = url + (url.indexOf('?') > 0 ? '&' : '?') + url_add;
		
		// -- capture call back
		if (typeof(callback) == 'function') frm.callback = callback;
		frm.onload = function () {
			if (typeof(frm.callback) == 'function') { 
				frm.callback(this.contentWindow.document.body.innerHTML); 
			}
		}		
		document.body.appendChild(frm);
	},
	
	post: function (url, data, callback) {
		// ENGINE: doesn't work in IE5-IE7
		var tmp = 'frame_' + (d = new Date()).getTime();
		// -- process parameters
		var form = document.createElement("form");
		form.style.cssText += 'position: absolute; left: -10; top: -10 width: 1px; height: 1px;';
		form.setAttribute("method", "post");
		form.setAttribute("action", url);
		form.setAttribute("target", tmp);
		for (var key in data) { 
			var field = document.createElement("input");
			field.setAttribute("type", "hidden");
			field.setAttribute("name", key);
			field.setAttribute("value", data[key]);
			form.appendChild(field);
		}
		
		// -- create element
		var frm = document.createElement('iframe');
		frm.name		   = tmp;
		frm.frameBorder    = 0;
		frm.style.cssText += 'position: absolute; left: -10; top: -10 width: 1px; height: 1px;';
		
		// -- capture call back
		if (typeof(callback) == 'function') frm.callback = callback;
		frm.onload = function () {
			if (typeof(frm.callback) == 'function') { 
				frm.callback(this.contentWindow.document.body.innerHTML); 
			}
		}		
		document.body.appendChild(frm);
		document.body.appendChild(form);
		form.submit();
	},

	isInt: function (val) {
		if (String(val) == 'undefined') return false;
		var tmpStr = '-0123456789';
		val = String(val);
		for (var ii=0; ii<val.length; ii++){
			if (tmpStr.indexOf(val.substr(ii, 1)) < 0) { return false; }
			if (val.substr(ii, 1) == '-' && ii != 0) { return false; }
		}
		return true;
	},

	isFloat: function (val) {
		if (String(val) == 'undefined') return false;
		var tmpStr = '-.0123456789';
		val = String(val);
		for (var ii=0; ii<val.length; ii++){
			if (tmpStr.indexOf(val.substr(ii, 1)) < 0) { return false; }
			if (val.substr(ii, 1) == '-' && ii != 0) { return false; }
			if (val.indexOf('.') > 0) if (val.indexOf('.', val.indexOf('.')+1) > 0) return false; // one dot per number
		}
		return true;
	},

	isMoney: function (val) {
		if (String(val) == 'undefined') return false;
		var tmpStr = '$€£¥-.,0123456789';
		val = String(val);
		for (var ii=0; ii<val.length; ii++){
			if (tmpStr.indexOf(val.substr(ii, 1)) < 0) { return false; }
			if (val.substr(ii, 1) == '-' && ii != 0) { return false; }
			if (val.indexOf('.') > 0) if (val.indexOf('.', val.indexOf('.')+1) > 0) return false; // one dot per number
		}
		return true;
	},

	isHex: function (val) {
		if (String(val) == 'undefined') return false;
		var tmpStr = '0123456789ABCDEFabcdef';
		val = String(val);
		for (var ii=0; ii<val.length; ii++){
			if (tmpStr.indexOf(val.substr(ii, 1)) < 0) { return false; }
		}
		return true;
	},

	isDate: function (val) {
		if (String(val) == 'undefined') return false;
		if (val.split("/").length != 3) return false; 
		var month	= val.split("/")[0];
		var day		= val.split("/")[1];
		var year	= val.split("/")[2];
		var obj = new Date(year, month-1, day);
		if ((obj.getMonth()+1 != month) || (obj.getDate() != day) || (obj.getFullYear() != year)) return false;
		return true;
	},

	isTime: function (val) {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }

		if (String(val) == 'undefined') return false;
		var max;
		// -- process american foramt
		val = val.toUpperCase();
		if (val.indexOf('PM') >= 0 || val.indexOf('AM') >= 0) max = 12; else max = 23;
		val = win.jsUtils.trim(val.replace('AM', ''));
		val = win.jsUtils.trim(val.replace('PM', ''));
		// ---
		var tmp = val.split(':');
		if (tmp.length != 2) { return false; }
		if (tmp[0] == '' || parseInt(tmp[0]) < 0 || parseInt(tmp[0]) > max || !win.jsUtils.isInt(tmp[0])) { return false; }
		if (tmp[1] == '' || parseInt(tmp[1]) < 0 || parseInt(tmp[1]) > 59 || !win.jsUtils.isInt(tmp[1])) { return false; }
		return true;
	},
	
	formatDate: function(val) {
		// comes in mm/dd/yyyy
		var mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',	'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var tmp = val.split('/');
		var ret = this.format_date;
		// month
		ret = ret.replace('mm', tmp[0]);
		ret = ret.replace('Mon', mon[parseInt(tmp[0])-1]);
		// date
		ret = ret.replace('dd', tmp[1]);
		// year 
		ret = ret.replace('yyyy', tmp[2]);
		ret = ret.replace('yy', tmp[2].substr(2));
		return ret;
	},
	
	formatTime: function(val) {
		// comes in hh24:mi
		var tmp = val.split(':');
		var ret = this.format_time;
		// hours
		ret = ret.replace('hh24', tmp[0]);
		// minutes
		ret = ret.replace('mi', tmp[1]);
		// pm
		if (ret.indexOf('hh') >= 0) {
			if (parseInt(tmp[0]) < 12)  { ret = ret.replace('hh', tmp[0]); tm = 'am'; }
			if (parseInt(tmp[0]) > 12)  { ret = ret.replace('hh', parseInt(tmp[0])-12); tm = 'pm'; }
			if (parseInt(tmp[0]) == 12) { ret = ret.replace('hh', tmp[0]); tm = 'pm'; }
			if (parseInt(tmp[0]) == 24) { ret = ret.replace('hh', parseInt(tmp[0])-12); tm = 'am'; }
			ret = ret.replace('pm', tm);
			ret = ret.replace('am', tm);
		}
		return ret;
	},
	
	isEmail: function (val) {
		var email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
		return email.test(val); 
	},

	serialize: function (obj){
		var res = '';
		for (var key in obj) {
			if (String(obj[key]) == 'undefined') obj[key] = '';
			if (obj[key] != null && typeof(obj[key]) == 'object') {
				res += escape(key) + '^[' + this.serialize(obj[key]) + ']!!';
			} else {
				res += escape(key) + '^' + escape(obj[key]) + '!!';
			}
		}
		return res; 
	},

	base64encode: function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		input = utf8_encode(input);
		
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
		}
		
		function utf8_encode(string) {
			var string = string.replace(/\r\n/g,"\n");
			var utftext = "";
			
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
			}
			return utftext;
		}
		
		return output;
	},
	 
	base64decode: function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {
			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = utf8_decode(output);
		
		function utf8_decode(utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while ( i < utftext.length ) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			
			return string;
		}

		return output;
	},
	 
	trim: function (sstr) {
		while (true) {
			if (sstr.substr(0, 1) == " " || sstr.substr(0, 1) == "\n" || sstr.substr(0, 1) == "\r") {
				sstr = sstr.substr(1, sstr.length - 1);
			} else {
				if (sstr.substr(sstr.length - 1, 1) == " " || sstr.substr(sstr.length - 1, 1) == "\n" || sstr.substr(sstr.length - 1, 1) == "\r") {
					sstr = sstr.substr(0, sstr.length - 1);
				} else {
					break;
				}
			}
		}
		return sstr;
	},
	
	inArray: function (needle, haystack) {
		for(var i = 0; i < haystack.length; i++) {
			if (typeof(haystack[i]) == 'object') {
				if (this.inArray(needle, haystack[i]) == true) return true;
			}
			if (haystack[i] == needle) return true;
		}
		return false;
	},

	stripTags: function (html) {
		html = this.trim(html.replace(/(<([^>]+)>)/ig, ""));
		return html;
	},

	center: function (div, ctype) {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }

		if (String(ctype) == 'undefined') ctype = '';
		ctype = ctype.toLowerCase();
		if (win.innerHeight == undefined) {
			var width  = div.ownerDocument.documentElement.offsetWidth;
			var height = div.ownerDocument.documentElement.offsetHeight;
			if (this.engine == 'IE7') { width += 21; height += 4; }
		} else {
			var width  = win.innerWidth;
			var height = win.innerHeight;
		}
		if (ctype == 'x' || ctype == '') { 
			div.style.left = (width  - parseInt(div.style.width)) / 2 + 'px'; 
		}
		if (ctype == 'y' || ctype == '') { 
			if (div.style.height == '') div.style.height = 150; // needed for IE prior to ver. 9
			div.style.top = (height - parseInt(div.style.height)) / 2 + 'px'; 
			if (parseInt(div.style.top) > 0) div.style.top = parseInt(div.style.top) - parseInt(div.style.top) * 0.15 + 'px'; 
		}
	},
	
	lock: function (opacity, lockOnClick) {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }
		
		// see if opacity is a parameter
		var speed = 20;
		if (String(opacity) != 'undefined' && typeof(opacity) == 'object') {
			if (String(opacity['onUnlock'])  != 'undefined') { lockOnClick 	= opacity['onUnlock']; }
			if (String(opacity['speed'])   	 != 'undefined') { speed		= opacity['speed']; }
			if (String(opacity['opacity'])   != 'undefined') { opacity 		= opacity['opacity']; }
		}
		
		if (win.document.getElementById('screenLock')) { win.document.body.removeChild(win.document.getElementById('screenLock')); }
		if (opacity == undefined || opacity == null) opacity = 0;
		// get width and height
		if (win.innerHeight == undefined) {
			var width  = win.document.documentElement.offsetWidth;
			var height = win.document.documentElement.offsetHeight;
			if (this.engine == 'IE7') { width += 21; height += 4; }
		} else {
			var width  = win.innerWidth;
			var height = win.innerHeight;
		}		
		//lock window
		win.screenLock 	= win.document.createElement('DIV');
		win.screenLock.style.cssText = 'position: '+(this.engine == 'IE5' ? 'absolute' : 'fixed')+'; padding: 0px; margin: 0px;'+
			'zIndex: 1000; left: 0px; top: 0px; background-color: black; width: '+ width +'px; height: '+ height +'px; opacity: 0;';
		win.screenLock.id = 'screenLock';
		win.screenLock.style.filter = 'alpha(opacity=0)';
		if (typeof(lockOnClick) == 'function') { win.screenLock.onclick = lockOnClick; }
		win.document.body.appendChild(win.screenLock);
		// - nice opacity
		win.tmp_opacity  = opacity;
		win.tmp_sopacity = 0;
		if (opacity != 0) {
			win.tmp_opacity_timeout = setInterval(function () {
				var parentWin = win;
				if (parentWin.tmp_sopacity >= parentWin.tmp_opacity || !parentWin.screenLock) { 
					parentWin.tmp_sopacity = parentWin.tmp_opacity; 
					clearInterval(parentWin.tmp_opacity_timeout); 
				} 
				parentWin.tmp_sopacity += 0.05; 
				parentWin.screenLock.style.opacity = parentWin.tmp_sopacity; 
				parentWin.screenLock.style.filter = 'alpha(opacity='+ (parentWin.tmp_sopacity * 100) +')';
			}, speed);
		}
	},

	unlock: function (params) {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }	
		// parse params
		var speed = 20;
		if (String(params) != 'undefined' && typeof(params) == 'object') {
			if (String(params['speed']) != 'undefined') { speed = params['speed']; }
		}
		win.tmp_sopacity = win.tmp_opacity;
		win.tmp_opacity  = 0;
		win.tmp_opacity_timeout = setInterval(function () {
			var parentWin = win;
			parentWin.tmp_sopacity -= 0.05; 
			if (parentWin.tmp_sopacity <= 0 || !parentWin.screenLock) { 
				if (parentWin.screenLock) parentWin.document.body.removeChild(parentWin.screenLock);
				parentWin.screenLock = null;
				parentWin.tmp_sopacity = parentWin.tmp_opacity; 
				clearInterval(parentWin.tmp_opacity_timeout); 
				return; 
			} 
			parentWin.screenLock.style.opacity = parentWin.tmp_sopacity; 
			parentWin.screenLock.style.filter = 'alpha(opacity='+ (parentWin.tmp_sopacity * 100) +')';
		}, speed); 
	},
	
	message: function (msg, width, height) {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }
		// create div for the message
		var box = win.document.createElement('DIV');				
		box.style.cssText 	= 'position: '+(this.engine == 'IE5' ? 'absolute' : 'fixed')+'; z-Index: 1001;';
		box.innerHTML 		= '\n'+msg+'\n';
		// set predefined size if any
		if (String(width)  != 'undefined') box.style.width  = width + 'px';
		if (String(height) != 'undefined') box.style.height = height + 'px';		
		// insert box
		document.body.appendChild(box);		
		// adjust size if not predefined
		if (String(width)  == 'undefined') box.style.width  = parseInt(box.clientWidth) + 'px';
		if (String(height) == 'undefined') box.style.height = parseInt(box.clientHeight) + 'px';
		// center box
		win.screenMessage = box;
		if (this.inArray(this.engine, ['IE5', 'IE7', 'IE8'])) {
			win.setTimeout(function () { 
				var parentWin = win;
				win.jsUtils.center(win.screenMessage)
			}, 10); 
		} else{
			this.center(box);
		}
		return box;
	},
	
	showMsg: function (body, params) {	
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }
		// parse params
		var isTitle   = false;
		var isButtons = false;
		var isModal	  = false;
		var width	  = 400; 
		var height	  = 200;
		var opacity   = 0.3;
		var onhide    = null;
		if (String(params) != 'undefined') {
			if (String(params['title'])   != 'undefined') { isTitle 	= true; }
			if (String(params['buttons']) != 'undefined') { isButtons 	= true; }
			if (String(params['modal'])   != 'undefined') { isModal 	= params['modal']; }
			if (String(params['width'])   != 'undefined') { width   	= params['width']; }
			if (String(params['height'])  != 'undefined') { height  	= params['height']; }
			if (String(params['opacity']) != 'undefined') { opacity 	= params['opacity']; }
			if (String(params['onhide'])  != 'undefined') { onhide 		= params['onhide']; }
		}
		// lock screen
		win.jsUtils.lock(opacity, function() { // unlock if clicked away
			var parentWin = win;
			if (!isModal) { parentWin.jsUtils.hideMsg(); } else { return; }
		});
		// show message
		var msg = '';
		if (isTitle) { msg +='<div class="msg_title">'+ params['title'] +'</div>'; }
		msg +='<div class="msg_body'+ (!isTitle ? ' msg_no-title' : '') + (!isButtons ? ' msg_no-buttons' : '') +'">'+ body +'</div>';
		if (isButtons) { msg += '<div class="msg_buttons">'+ params['buttons'] +'</div>'; }
		// output message
		var box = win.jsUtils.message(msg, width, height);
		box.className = 'w20-message';
		// drop shadow
		//win.jsUtils.dropShadow(box, true);
		win.screenMessage.onhide = onhide;
		return box;
	},

	hideMsg: function () {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) win = top; else win = window; } catch(e) { win = window; }
		// execute onhide event
		if (win.screenMessage && typeof(win.screenMessage.onhide) == 'function') { win.screenMessage.onhide(); }
		// lock screen and remove message
		if (win.screenMessage) win.screenMessage.parentNode.removeChild(win.screenMessage);
		win.screenMessage = null;
		win.jsUtils.unlock({ speed: 1 });
	},
	
	dropShadow: function (shadowel, center) {
		var shleft      = parseInt(shadowel.offsetLeft);
		var shtop       = parseInt(shadowel.offsetTop);
		var shwidth     = parseInt(shadowel.offsetWidth);
		var shheight    = parseInt(shadowel.offsetHeight);
		var addshLeft   = 0;
		var addshTop    = 0;
		var addshWidth  = 0;
		var addshHeight = 0;

		if (shtop <= 0 && shadowel.ownerDocument.defaultView) {
			st = shadowel.ownerDocument.defaultView.getComputedStyle(shadowel, '');
			shleft      = parseInt(st.left);
			shtop       = parseInt(st.top);
			shwidth     = parseInt(st.width);
			shheight    = parseInt(st.height);
			addshLeft   = parseInt(st.marginLeft);
			addshTop    = parseInt(st.marginTop);
			addshWidth  = parseInt(st.paddingLeft) + parseInt(st.paddingRight) + parseInt(st.borderLeftWidth) + parseInt(st.borderRightWidth);
			addshHeight = parseInt(st.paddingTop) + parseInt(st.paddingBottom) + parseInt(st.borderTopWidth) + parseInt(st.borderBottomWidth);
		}
		if (String(Number(shleft)) == 'NaN') { shleft = 0; }
		if (String(Number(shtop))  == 'NaN') { shtop = 0; }
		
		var tmp = shadowel.ownerDocument.createElement('DIV');
		tmp.style.position  = 'absolute';
		tmp.style.left      = (shleft - (center ? 10 : 10) + addshLeft) + 'px';
		tmp.style.top       = (shtop - (center ? 10 : 0) + addshTop) + 'px';
		tmp.style.width     = (shwidth  + (center ? 20 : 20) + addshWidth) + 'px';
		tmp.style.height    = (shheight + (center ? 20 : 10) + addshHeight) + 'px';

		var html = '\n';
		html += '<table cellpadding="0" cellspacing="0" style="width:100%; height:100%; font-size: 2px; font: 2px; table-layout: fixed;">\n'+
				'<tr>\n'+
				'  <td style="width: 10px; height: 10px; -moz-border-radius: 12 0 0 0; border-radius: 12 0 0 0; background-image: url('+ window.jsUtils.sys_path +'/images/shadow1.png)"></td>\n'+
				'  <td style="height: 10px; background-image: url('+ window.jsUtils.sys_path +'/images/shadow2.png)"></td>\n'+
				'  <td style="width: 10px; height: 10px; -moz-border-radius: 0 12 0 0; border-radius: 0 12 0 0; background-image: url('+ window.jsUtils.sys_path +'/images/shadow3.png); background-position: right top"></td>\n'+
				'</tr>\n'+
				'<tr>\n'+
				'  <td style="width: 10px; background-image: url('+ window.jsUtils.sys_path +'/images/shadow8.png)"></td>\n'+
				'  <td style="background-image: url('+ window.jsUtils.sys_path +'/images/shadow0.png); opacity: 0.55; filter: alpha(opacity=12);"></td>\n'+
				'  <td style="width: 10px; background-image: url('+ window.jsUtils.sys_path +'/images/shadow4.png); background-position: right top"></td>\n'+
				'</tr>\n'+
				'<tr>\n'+
				'  <td style="width: 10px; height: 10px; -moz-border-radius: 0 0 0 12; border-radius: 0 0 0 12; background-image: url('+ window.jsUtils.sys_path +'/images/shadow7.png); background-position: left bottom;"></td>\n'+
				'  <td style="height: 10px; background-image: url('+ window.jsUtils.sys_path +'/images/shadow6.png); background-position: right bottom"></td>\n'+
				'  <td style="width: 10px; height: 10px; -moz-border-radius: 0 0 12 0; border-radius: 0 0 12 0; background-image: url('+ window.jsUtils.sys_path +'/images/shadow5.png); background-position: right bottom"></td>\n'+
				'</tr>\n'+
				'</table>\n';
		tmp.innerHTML = html;
		shadowel.parentNode.appendChild(tmp, shadowel);
		if (shadowel.style.zIndex != undefined && shadowel.style.zIndex != null) tmp.style.zIndex = parseInt(shadowel.style.zIndex)-1;
		shadowel.shadow = tmp;
		return tmp;
	},

	clearShadow: function (shadowel) {
		if (shadowel && shadowel.shadow) shadowel.parentNode.removeChild(shadowel.shadow);
		if (shadowel) shadowel.shadow = null;
	},

	slideDown: function (el, onfinish) {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }
		
		try {
			if (el != undefined && el != null) {
				// initiate
				win.tmp_sd_el 		= el;
				el.style.top  		= -1000;
				el.style.display  	= '';
				win.tmp_sd_height 	= parseInt(el.clientHeight);
				win.tmp_sd_top	  	= -parseInt(el.clientHeight);
				win.tmp_sd_timer  	= setInterval(function () { var parentWin = win; win.jsUtils.slideDown() }, 2);
				win.tmp_sd_step   	= win.tmp_sd_height / 15;
				win.tmp_sd_onfinish	= onfinish;
				// show parent element
				el.parentNode.style.width  = parseInt(el.clientWidth) + 5;
				el.parentNode.style.height = parseInt(el.clientHeight) + 5;
				el.parentNode.style.overflow = 'hidden';
				return;
			}	
			win.tmp_sd_top += win.tmp_sd_step;
			if (win.tmp_sd_top > 0) win.tmp_sd_top = 0;
			if (win.tmp_sd_el) {
				win.tmp_sd_el.style.top = win.tmp_sd_top;
				if (win.tmp_sd_top == 0) { 
					if (win.tmp_sd_onfinish) win.tmp_sd_onfinish(win.tmp_sd_el);
					win.tmp_sd_el.parentNode.style.overflow = '';
					// stop role out
					clearInterval(win.tmp_sd_timer); 
					win.tmp_sd_el 	  	= undefined;
					win.tmp_sd_height 	= undefined;
					win.tmp_sd_top	  	= undefined;
					win.tmp_sd_timer  	= undefined;
					win.tmp_sd_step   	= undefined;
					win.tmp_sd_onfinish = undefined;
				}
			}
		} catch (e) {}
	},

	slideUp: function (el, onfinish) {
		var win; // if top is available - do it in top, otherwise window
		try { if (top) { win = top; } else { win = window; } } catch(e) { win = window; }
		
		try {
			if (el != undefined && el != null) {
				// initiate
				win.tmp_sd_el 		= el;
				el.style.display  	= '';
				win.tmp_sd_height 	= parseInt(el.clientHeight);
				win.tmp_sd_top	  	= 0;
				win.tmp_sd_timer  	= setInterval(function () { var parentWin = win; win.jsUtils.slideUp() }, 2);
				win.tmp_sd_step   	= win.tmp_sd_height / 15;
				win.tmp_sd_onfinish	= onfinish;
				// control the parent element
				el.parentNode.style.overflow 	= 'hidden';
				return;
			}
			win.tmp_sd_top -= win.tmp_sd_step;
			if (-win.tmp_sd_top > win.tmp_sd_height) win.tmp_sd_top = -win.tmp_sd_height - 10;
			win.tmp_sd_el.style.top = win.tmp_sd_top;
			if (win.tmp_sd_top == -win.tmp_sd_height - 10) { 
				if (win.tmp_sd_onfinish) win.tmp_sd_onfinish(win.tmp_sd_el);
				// hide parent element
				win.tmp_sd_el.parentNode.style.width  = 0;
				win.tmp_sd_el.parentNode.style.height = 0;
				// stop role out
				clearInterval(win.tmp_sd_timer); 
				win.tmp_sd_el 	  	= undefined;
				win.tmp_sd_height 	= undefined;
				win.tmp_sd_top	  	= undefined;
				win.tmp_sd_timer  	= undefined;
				win.tmp_sd_step   	= undefined;
				win.tmp_sd_onfinish	= undefined;
			}
		} catch (e) {}
	}	
}
// init object
var sys_path;
(function () {
	var els = document.getElementsByTagName('script');
	for (var e in els) {
		if (String(els[e].src).indexOf('jsUtils.js') > -1) {
			sys_path = String(els[e].src).replace(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?/, '').replace(/[^\/]*$/, '');
		}
	}
})();
jsUtils.init(window.sys_path != undefined ? window.sys_path : '');