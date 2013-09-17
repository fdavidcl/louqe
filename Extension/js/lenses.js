/*** Lens Prototype ***/

/*
	Obligatory parameters: id, url
	Recommended parameters: name, icon, genAns
	Optional parameter: delay, query
												*/
function Lens(id, url, name, icon, genAns, delay, query) {
	this.id = id;
	this.url = url;
	this.name = name ? name : id;
	this.icon = icon ? icon : "search";
	this.delay = delay ? delay : 0;
	if (genAns) this.generateAnswer = genAns;
	
	var targetid = "results_" + this.id;
	this.ans = document.createElement('span');
	this.ans.id = targetid;
	this.ans.className = "instant";
	
	this.lastquery = "";
}

Lens.prototype.load = function() {
	$("#search_results").insertBefore(this.ans, $("#bookmarks"));
};

Lens.prototype.displayResults = function(response) {
	var anshtml = this.generateAnswer(response);
	
	this.ans.innerHTML = anshtml != "" ?
		('<i class="lens-icon icon-' + this.icon + '"></i>' + anshtml) :
		('<i class="no-results lens-icon icon-' + this.icon + '"></i>');
	
	if (search.highlighted == 0) search.HighlightItem(0);
};

Lens.prototype.generateAnswer = function(content) {
	return content;
};

Lens.prototype.query = function(q) {
	var handler = this;
	this.lastquery = q;
	
	if (q != "") {
		this.ans.innerHTML = '<i class="loading-lens lens-icon icon-' + this.icon + '"></i>';
		
		var xmlhttp;
		
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && q == handler.lastquery) {
				handler.displayResults(xmlhttp.responseXML ? xmlhttp.responseXML : xmlhttp.responseText);
			}
		};
		xmlhttp.open("GET", this.url + q, true);
		
		if (handler.delay) {
			setTimeout(function(){
				if (handler.lastquery == q) {
					xmlhttp.send();
				}
			}, handler.delay);
		} else {
			xmlhttp.send();
		}
	} else {
		this.ans.innerHTML = "";
	}
};