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
var showSection = function(sectionId) {
	var selectedSection = $("#" + sectionId);
	
	if (selectedSection) {
		var selectedEnv = selectedSection.parentNode;
		
		if ($(".wrapper.displayed")) {
			$(".wrapper.displayed").classList.remove("displayed");
		}
		if ($("section.displayed")) {
			$("section.displayed").classList.remove("displayed");
		}
		
		selectedSection.classList.add("displayed");
		selectedEnv.classList.add("displayed");
		
		if (selectedEnv.querySelector("nav .highlight")) {
			selectedEnv.querySelector("nav .highlight").classList.remove("highlight");
		}
		
		var newHighlight = selectedEnv.querySelector("nav a[href='#" + selectedEnv.id + "/" + sectionId + "']");
		if (newHighlight) {
			newHighlight.classList.add("highlight");
		}
	}	
};

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
	
	if (!sec) {
		sec = $(".wrapper#" + env + " section").id;
	}
	
	location.hash = env + "/" + sec;
	
	showSection(sec);
	
	if (env == "search" && sec != "start") $("body").classList.add("search_mode");
	
	$('#search_form > input').focus(); // Only focuses the search input when it's displayed
};

/*** Activamos funcionalidades ***/
window.onload = function() {
	search.Load();
	//liveinfo.Load();
	start.load();
	wallpaper.load();
	//icons.Load();
	//config.Load();
	bookmarks.Load(); // Actualizamos marcadores silenciosamente
	gethash();
};

window.onhashchange = gethash;
