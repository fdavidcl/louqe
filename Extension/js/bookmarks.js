/*
 * Este archivo procesa los marcadores del usuario y los convierte en
 * una lista de torres de enlaces almacenada en localStorage
 */

/*
 * Estructura de una torre: [ "<Título>", [<Secciones>] ]
 * Estructura de una sección: [ "<Nombre>", [<Enlaces>] ]
 * Estructura de un enlace: [ "<Nombre>", "<URL>" ]
 */
 
/*
 * BUGS
 * TODO
 */

search.lenses.bookmarks = new Lens({
	id: "bookmarks",
	name: "Bookmarks",
	icon: "bookmark",
	query: function(query) {
		var sections = 1, links = 1, href = 1, name = 0;
		
		search.best = [];
		var min_relev = -1;
		
		var removed_list = "";
		var no_coincidences = true;
		
		for (var i = 0; i < bookmarks.towers.length; i++) {
			var this_tower = bookmarks.towers[i];
			var any_link_in_tower = false;
			
			for (var j = 0; j < this_tower[sections].length; j++) {
				var this_section = this_tower[sections][j];
				var any_link_in_section = false;
				
				for (var k = 0; k < this_section[links].length; k++) {
					var l_name = this_section[links][k][name];
					var l_url = this_section[links][k][href].replace('http','').replace('s://','').replace('://','');
					
					if ($('#l'+i+'_'+j+'_'+k)) {
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
							
							//$('#l'+i+'_'+j+'_'+k).style.display = 'block';
							
							var obj_encontrado = {
								name: l_name,
								href: this_section[links][k][href],
								url: l_url,
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
							//$('#l'+i+'_'+j+'_'+k).style.display = 'none';
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
		
		var besthtml = "";
		
		if (no_coincidences) {
			//$("#bookmarks h1").classList.add("no-results");
		} else {
			for (var i in search.best) {
				var bk = search.best[i]
				besthtml += '<a href="' + bk.href + '" style="background-image: url(chrome://favicon/' + bk.href + ');">' + bk.name + '<span class="url">' + bk.url + '</span></a>'
			}
		}
		
		removed_list += "dummy { display: none !important; }";
		
		if (!$('#search_css')) {
			var n_style = document.createElement('style');
			n_style.id = "search_css";
			$('body').appendChild(n_style);
		}
		$('#search_css').innerHTML = removed_list;
		
		this.displayResults(besthtml);
	}
});
 
var bookmarks = {
	ProcessSection: function(section, path) {
		// Creamos el "camino" hasta la carpeta
		if (!path) {
			path = "";
		}
		
		var section_list = [[path, []]];
		
		var n_elements = section.children.length;
		for (var i = 0; i < n_elements; i++) {
			var this_item = section.children[i];
			
			// Añadimos los marcadores a la sección raíz y las
			// carpetas internas forman nuevas secciones.
			if (this_item.url) {
				section_list[0][1].push([this_item.title, this_item.url]);
			} else if (this_item.children) {
				var new_path = path == "" ? this_item.title : path + " / "  + this_item.title;
				section_list = section_list.concat(bookmarks.ProcessSection(this_item, new_path));
			}
		}
			
		if (section_list[0][1].length == 0) {
			section_list.shift();
		}
		
		return section_list;
	},
	ProcessTower: function(tower) {
		var output_tower =[tower.title, []];
		
		// Creamos secciones
		output_tower[1] = output_tower[1].concat(bookmarks.ProcessSection(tower));
		
		return output_tower;
	},
	CreateTowers: function(group) {
		var tower_n = group.children.length;
		var tower_list = [];
		var default_tower = [group.title, [ ["", []] ] ];
		var default_links = default_tower[1][0][1];
		
		/* Creamos una torre por carpeta y añadimos los marcadores sueltos
		   a la torre por defecto                                          */
		for (var i = 0; i < tower_n; i++) {
			var item = group.children[i];
			
			if (item.children) { // Carpeta
				var temp = bookmarks.ProcessTower(item);
				tower_list.push(temp);
			} else if (item.url) { // Marcador
				default_links.push([item.title, item.url]);
			}
		}
		
		if (default_links.length > 0) {
			tower_list.push(default_tower);
		}
		
		return tower_list;
	},
	Import: function(bookmarks_tree, bar_towers, other_towers, mobile_towers) {
		/* Hay tres fuentes de marcadores: Barra de marcadores, Otros marcadores
		   y Marcadores del móvil. Importamos la primera con tantas torres como
		   carpetas tenga, la segunda y la tercera como una única torre cada una */
		var tower_list = [];
		
		/* Barra de marcadores */
		var bm_bar = bookmarks_tree.children[0];
		var bar_hierarchy;
		
		if (bar_towers) {
			bar_hierarchy = bookmarks.CreateTowers(bm_bar);
		} else {
			bar_hierarchy = [ bookmarks.ProcessTower(bm_bar) ];
		}
		
		/* Otros marcadores */
		var other = bookmarks_tree.children[1];
		var other_hierarchy;
		
		if (other_towers) {
			other_hierarchy = bookmarks.CreateTowers(other);
		} else {
			other_hierarchy = [ bookmarks.ProcessTower(other) ];
		}
		
		/* Marcadores del móvil */
		var mobile = bookmarks_tree.children[2];
		var mobile_hierarchy;
		
		if (mobile_towers) {
			mobile_hierarchy = bookmarks.CreateTowers(mobile);
		} else {
			mobile_hierarchy = [ bookmarks.ProcessTower(mobile) ];
		}
		
		tower_list = bar_hierarchy.concat(other_hierarchy, mobile_hierarchy);
		
		_("towersData", JSON.stringify(tower_list));
	},
	LoadImport: function() {
		/* Opciones para mostrar las carpetas como torres o agruparlas en una sola */
		var expand_bar_folders = true;
		var expand_other_folders = false;
		var expand_mobile_folders = false;
		
		chrome.bookmarks.getTree(function(resp) {
			bookmarks.Import(resp[0], expand_bar_folders, expand_other_folders, expand_mobile_folders);
		});
	},
	Load: function() {
		if (localStorage.towersData) {
			this.towers = JSON.parse(localStorage.towersData);
		} else {
			this.towers = [];
		}
		
		this.Display();
		this.LoadImport();
	},
	Display: function() {
		var lim = this.towers.length;
		
		var sections = 1, links = 1, href = 1, name = 0;
		
		var bkhtml = "<h1>Bookmarks</h1>";
		
		for (var i = 0; i < lim; i++) {
			var tower = this.towers[i];
			var elem_t = document.createElement("div");
			var inner = "<h2 id='tower_" + i + "'><span>" + tower[name] + "</span></h2>";
			
			var link_counter = 1;
			var lim_sec = tower[sections].length;
			for (var j = 0; j < lim_sec; j++) {
				var section = tower[sections][j];
				
				if (section[name] && section[name] != "") {
					inner += "<h3 id='section_" + i + "_" + j + "'>" + section[name] + "</h3>";
					link_counter++;
				}
				
				var quantity = section[links].length;
				for (var k = 0; k < quantity; k++) {
					var link = section[links][k];
					var l_elem = document.createElement('a');
					l_elem.className = 'bm';
					l_elem.id = "l" + i + "_" + j + "_" + k;
					l_elem.href = link[href];
					l_elem.style.backgroundImage = "url(chrome://favicon/" + link[href] + ")";
					l_elem.innerHTML = link[name];
					var dummy = document.createElement('div');
					dummy.appendChild(l_elem);
					
					inner += dummy.innerHTML;
					
					link_counter++;
				}
			}
			
			elem_t.innerHTML = inner;
			
			bkhtml += elem_t.innerHTML;
			
		}
		
		$('#bookmarks').innerHTML = bkhtml;
	}
};