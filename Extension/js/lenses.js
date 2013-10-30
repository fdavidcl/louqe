
/*** Lens Prototype ***/

/*
	Obligatory parameters: id, url*
	Recommended parameters: name, icon, genAns
	Optional parameter: delay, query
	
	*url is obligatory if using default query
	function
												*/
function Lens(options) {
	var defaultOptions = {
		id: "",
		url: "",
		name: "",
		icon: "search",
		delay: 0,
		generateAnswer: function(content) {
			return content;
		},
		query: function(q) {
			var handler = this;
			this.lastquery = q;
			
			if (q != "") {
				this.ans.innerHTML = '<span class="instant"><i class="loading-lens lens-icon icon-' + this.icon + '"></i></span>';
				
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
		}
	};
	
	for (var op in defaultOptions) {
		this[op] = options[op] ? options[op] : defaultOptions[op];
	}
	
	this.ans = document.createElement('section');
	this.ans.id = this.id;
	this.ans.className = "section search-results";
	
	this.brief = document.createElement('div');
	this.brief.id = this.id + "_brief";
	this.brief.className = "brief";
	
	// <a href="#search/duckduckgo"><i class="icon-comment"></i>Answers</a>
	this.link = document.createElement
	
	this.lastquery = "";
}

Lens.prototype.load = function() {
	//$("#search_results").insertBefore(this.ans, $("#bookmarks"));
	//$("#everything").appendChild(this.ans);
	$("#search").appendChild(this.ans);
	$("#search nav .options").innerHTML += '<a href="#search/' + this.id + '"><i class="icon-' + this.icon + '"></i>' + this.name + '</a>';
	$("#everything").appendChild(this.brief);
};

Lens.prototype.displayResults = function(response) {
	var anslist = this.generateAnswer(response);
	
	var anshtml = "";

	if (!(typeof anslist == "string")) {
		for (var l in anslist) {
			anshtml += '<a href="' + anslist[l].href + '">' + anslist[l].html + '</a>';
		}
	} else {
		anshtml = anslist;
	}

	var finalhtml = anshtml != "" ?
		('<span class="instant"><i class="lens-icon icon-' + this.icon + '"></i>' + anshtml + "</span>") :
		('<span class="instant"><i class="no-results lens-icon icon-' + this.icon + '"></i></span>');
		
	this.ans.innerHTML = finalhtml;
	this.brief.innerHTML = finalhtml;
	
	if (search.highlighted == 0) search.HighlightItem(0);
};