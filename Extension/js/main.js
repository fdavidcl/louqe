var $ = function(q) { return document.querySelector(q); }
var $$ = function(q) { return document.querySelectorAll(q); }

/*** Gestión de localStorage ***/
function _(key, value) {
	if (value) {
		localStorage.removeItem(key);
		localStorage.setItem(key, value);
	}
	
	return localStorage[key];
}

/*** Prototipo para llamada Ajax ***/
function AjaxRequest(url, callback) {
	this.url = url;

	this.Send = function() {
		if (window.XMLHttpRequest) {
			var xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				if (xmlhttp.responseXML) {
					callback(xmlhttp.responseXML);
				} else {
					callback(xmlhttp.responseText);
				}
			}
		};
		xmlhttp.open("GET", this.url, true);
		xmlhttp.send();
	}
}


/*** URL hash management ***/
var gethash = function() {
	var hash = location.hash.replace('#','');
	
	if (hash.length == 0) {
		hash = $(".wrapper").id;
	}
	
	var env = hash;
	var sec;
	
	if (hash.indexOf('/') > -1) {
		env = hash.split('/')[0];
		sec = hash.split('/')[1];
	}
	var curenv = $(".wrapper#" + env);
	
	if (curenv) {
		if ($(".wrapper.displayed")) {
			$(".wrapper.displayed").classList.remove("displayed");
		}
		
		curenv.classList.add("displayed");
		
		var cursec = $(".section#" + sec);
		
		if (sec && cursec) {
			if ($(".section.displayed")) {
				$(".section.displayed").classList.remove("displayed");
				curenv.querySelector(".highlight").classList.remove("highlight");
			}
			
			cursec.classList.add("displayed");
			curenv.querySelector('.options [href="#' + env + '/' + sec).classList.add("highlight");
		}
	}
	
	$('#search_form > input').focus();
};

/*** Activamos funcionalidades ***/
window.onload = function() {
	gethash();
	search.Load();
	//liveinfo.Load();
	start.load();
	wallpaper.load();
	//icons.Load();
	//config.Load();
	bookmarks.Load(); // Actualizamos marcadores silenciosamente
};

window.onhashchange = gethash;
