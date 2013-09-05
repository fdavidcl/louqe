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