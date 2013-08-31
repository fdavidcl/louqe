/*
 * Este archivo se encarga de gestionar el filtro de marcadores
 * y las respuestas instantáneas en la búsqueda
 */
 
/*
 * BUGS
	La búsqueda se rompe con el símbolo +
 * TODO
	
 */

var search = {
	engines: [
		{
			name: "Google",
			favicon: "http://www.google.es/favicon.ico",
			url: {
				left: "http://www.google.es/search?q=",
				right: ""
			}
		},
		{
			name: "DuckDuckGo",
			favicon: "http://www.duckduckgo.com/favicon.ico",
			url: {
				left: "http://www.duckduckgo.com/",
				right: ""
			}
		},
		{
			name: "Bing",
			favicon: "http://www.bing.com/favicon.ico",
			url: {
				left: "http://www.bing.com/search?q=",
				right: ""
			}
		},
		{
			name: "Youtube",
			favicon: "http://www.youtube.com/favicon.ico",
			url: {
				left: "http://www.youtube.com/results?search_query=",
				right: ""
			}
		},
		{
			name: "WolframAlpha",
			favicon: "http://www.wolframalpha.com/favicon.ico",
			url: {
				left: "http://www.wolframalpha.com/input/?i=",
				right: ""
			}
		}
	],
	answers: {},
	highlighted: -1,
	last_query: "",
	Display: function() {
		
	},
	Instant: function() {
		var orig_query = document.querySelector('#search_form > input').value;
		
		if (orig_query != search.last_query) {
			var sections = 1, links = 1, href = 1, name = 0;
			
			var regex = /^(http[s]?:\/\/|ftp:\/\/)?(localhost|([0-9A-Za-z-\.@:%_\+~#=])+((\.[A-Za-z][A-Za-z]+))+)([0-9A-Za-z-\.?&*@:%_\+~#=\/])*$/;
			var re = new RegExp(regex);
			if (orig_query.match(re)) {
				var link = orig_query;
				
				if (orig_query.indexOf('http://') != 0 && orig_query.indexOf('https://') != 0 && orig_query.indexOf('ftp://') != 0) {
					link = "http://" + orig_query;
				}
				
				document.querySelector('#go_o').innerHTML = "<a href=\"" + link + "\" style=\"background-image: url(chrome://favicon/" + link + ");\">Ir<span class=\"url\">" + link + "</span></a>";
			} else {
				document.querySelector('#go_o').innerHTML = "";
			}

			search.last_query = orig_query;
			var query = document.querySelector('#search_form > input').value.toLowerCase().replace(/\)/g, '\\)').replace(/\(/g, '\\(');
			
			for (var e in search.handlers) {
				search.handlers[e].query(orig_query);
			}
			
			search.best = [];
			var min_relev = -1;
			
			var removed_list = "";
			var no_coincidences = true;
			
			for (var i = 0; i < icons.towers.length; i++) {
				var this_tower = icons.towers[i];
				var any_link_in_tower = false;
				
				for (var j = 0; j < this_tower[sections].length; j++) {
					var this_section = this_tower[sections][j];
					var any_link_in_section = false;
					
					for (var k = 0; k < this_section[links].length; k++) {
						var l_name = this_section[links][k][name];
						var l_url = this_section[links][k][href].replace('http','').replace('s://','').replace('://','');
						
						if (document.querySelector('#l'+i+'_'+j+'_'+k)) {
							var relevancia = -1;
							var words = query.split(' ');
							
							/* Buscamos cada palabra de búsqueda en los nombres y enlaces,
							   confeccionando una medida de la relevancia de cada uno a
							   partir del lugar de aparición de lo buscado                 */
							
							var rel_name = -1;
							var rel_url = -1;
							var todas_coinciden = true;
							
							for (var l = 0; l < words.length && todas_coinciden; l++) {
								var this_word = words[l];
								
								if (this_word != "") {
									var n_r = l_name.toLowerCase().search(this_word);
									var l_r = l_url.search(this_word);
									todas_coinciden = n_r > -1 || l_r > -1;
									
									if (n_r > -1) {
										if (rel_name == -1)
											rel_name = 0;
										
										rel_name = rel_name + n_r;
									}
									if (l_r > -1) {
										if (rel_url == -1)
											rel_url = 0;
										
										rel_url = rel_url + l_r;
									}
								}
							}
							
							if (todas_coinciden) {
								any_link_in_tower = true;
								any_link_in_section = true;
								
								var relevancia = 0;
								var penalizacion = 8;
								
								if (rel_url == -1) {
									relevancia += penalizacion;
								} else {
									relevancia += rel_url;
								}
								
								if (rel_name == -1) {
									relevancia += penalizacion;
								} else {
									relevancia += rel_name;
								}
							
								//document.querySelector('#l'+i+'_'+j+'_'+k).style.display = 'block';
								
								var obj_encontrado = {
									name: l_name,
									href: l_url,
									from: this_tower[name]
								};
								
								// Por terminar aún...
								if (relevancia < min_relev) {
									search.best.unshift(obj_encontrado);
									
									if (search.best.length > 3) {
										search.best.pop();
									}
								} else if (search.best.length < 3) {
									search.best.push(obj_encontrado);
									
									min_relev = relevancia < min_relev || min_relev == -1 ? relevancia : min_relev;
								}
								
								// Ordenar los resultados más relevantes, eliminar
								// los menos relevantes, dejando solo 3.
							} else {
								//document.querySelector('#l'+i+'_'+j+'_'+k).style.display = 'none';
								// Hacemos invisible el enlace
								removed_list += '#l'+i+'_'+j+'_'+k+', ';
							}
						}	
					}
					
					if (!any_link_in_section) {
						removed_list += '#section_'+i+'_'+j+', ';
					}
				}
				
				if (!any_link_in_tower) {
					removed_list += '#tower_'+i+', ';
				} else {
					no_coincidences = false;
				}
			}
			
			if (no_coincidences) {
				removed_list += '#bookmarks>h1, ';
			}
			
			removed_list += "dummy { display: none !important; }";
			
			if (!document.querySelector('#search_css')) {
				var n_style = document.createElement('style');
				n_style.id = "search_css";
				document.querySelector('body').appendChild(n_style);
			}
			document.querySelector('#search_css').innerHTML = removed_list;
			
			var html_out = "";
			
			if (query == "") {
				config.ChangeMode(config.modes.user);
			} else {
				config.ChangeMode(config.modes.search);
			
				// Mejores resultados de marcadores
				var mejores = "";
				if (search.best.length > 0) {
					var tope = search.best.length;
					for (var m = 0; m < tope; m++) {
						var enl = search.best[m];
						
						if (!enl.href.match(/^((http[s]*|ftp|chrome[\-a-z]*):\/\/|javascript:)/)) {
							enl.href = "http://" + enl.href;
						}
						
						mejores += '<a href="' + enl.href + '" style="background-image: url(chrome://favicon/' + enl.href + ')">' + enl.name + '<span class="from"> en ' + enl.from + '</span><span class="url">' + enl.href + '</span></a>';
					}
				}
				
				html_out += mejores;
			}
			
			// Buscadores
			var search_html = "";
			
			for (i in search.engines) {
				engine = search.engines[i];
				
				search_html += '<a href="' + engine.url.left + encodeURIComponent(orig_query) + engine.url.right + '" style="background-image: url(' + engine.favicon + ')" class="search-item"><i class="icon-search icon-small"></i>' + engine.name + '</a>';
			}
			
			document.querySelector('#bookmarks_o').innerHTML = html_out;
			document.querySelector('#engines_o').innerHTML = search_html;
			search.HighlightItem(0);
		}
	},
	HighlightItem: function(ind) {
		var all_links = document.querySelectorAll("#search_output .instant a[href]");
		if (all_links[ind]) {
			if (document.querySelector("#search_output a.highlight")) {
				document.querySelector("#search_output a.highlight").classList.remove("highlight");
			}
			all_links[ind].classList.add("highlight");
		
			search.highlighted = ind;
		}
	},
	HighlightByKey: function(ev) {
		ev = ev || window.event;
		
		if (ev.keyCode == 38) {
			ev.preventDefault();
			search.HighlightItem(search.highlighted - 1);
		} else if (ev.keyCode == 40) {
			ev.preventDefault();
			search.HighlightItem(search.highlighted + 1);
		}
	},
	FormSubmit: function() {
		if (document.querySelector("#search_output .instant a.highlight")) {
			event.preventDefault();
			document.location.href = document.querySelector("#search_output .instant a.highlight").href;
		} else {
			return false;
		}
	},
	Load: function() {
		this.Display();
		document.querySelector('#search_form > input').focus();
		document.querySelector('#search_form > input').oninput = function() { search.Instant(); };
		document.querySelector('#search_form > input').onpaste = function() { search.Instant(); };
		document.querySelector('#search_form > input').onkeyup = function() { search.Instant(); };
		document.querySelector('#search_form > input').onkeydown = function() { search.HighlightByKey(); };
		document.querySelector('#search_form').onsubmit = function() { search.FormSubmit(); };
		
		var extensions = ["flickr", "duckduckgo"];
		search.handlers = {};
		
		/*for (var e in search.answers) {
			var engine = search.answers[e];
			engine.id = e;
			search.handlers[e] = new ModuleHandler(engine);
		}*/
		
		for (var e in extensions) {
			$.getJSON("https://raw.github.com/louqe/louqe/master/extensions/" + extensions[e] + ".json", function(data) {
				
				search.handlers[e] = new ModuleHandler(data);
				console.log(ext);
			});
		}
	}
};