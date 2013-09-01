
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

/*** Prototipo de Module Handler ***/

function ModuleHandler(module) {
	this.module = module;
	
	var targetid = "results" + module.id;
	var ans = document.createElement('span');
	ans.id = "results" + module.id;
	ans.className = "instant";
	document.querySelector("#results").insertBefore(ans, document.querySelector("#bookmarks"));
	
	this.query = function(q) {
		if (q != "") {
			if (window.XMLHttpRequest) {
				var xmlhttp = new XMLHttpRequest();
			} else {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var anshtml = "";
					
					if (xmlhttp.responseXML) {
						anshtml = module.generateAnswer(xmlhttp.responseXML);
					} else {
						anshtml = module.generateAnswer(xmlhttp.responseText);
					}
					
					ans.innerHTML = anshtml != "" ? ("<h1>" + module.name + "</h1>" + anshtml) : "";
				}
			};
			xmlhttp.open("GET", module.url + q, true);
			xmlhttp.send();
		} else {
			ans.innerHTML = "";
		}
	};
}

/*** Gestión de localStorage ***/
function Store(key, value) {
	if (value) {
		localStorage.removeItem(key);
		localStorage.setItem(key, value);
	}
	
	return localStorage[key];
}

/*** Activamos funcionalidades ***/
window.onload = function() {
	search.Load();
	//liveinfo.Load();
	start.load();
	icons.Load();
	config.Load();
	bookmarks.LoadImport(); // Actualizamos marcadores silenciosamente
};

/*** Iniciamos el modo adecuado (si la URL tiene algún hash) ***/
window.onhashchange = function() {
	config.GetMode();
};
