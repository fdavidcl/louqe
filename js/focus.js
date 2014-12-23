
/*** Focus Prototype ***/
/* A focus is an action triggered by certain queries
   that give special results
*/

function Focus(options) {
	var defaultOptions = {
		id: "",
		url: "",
		name: "",
		icon: "search",
		trigger: "",
		at_start: true,
		delay: 0,
		generateAnswer: function(content) {
			return content;
		},
		query: function(q) {
			var handler = this;
			this.lastquery = q;
			
			if (q != "") {
				this.ans.innerHTML = '<span class="focus"><i class="loading-lens lens-icon icon-' + this.icon + '"></i></span>';
				
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
}