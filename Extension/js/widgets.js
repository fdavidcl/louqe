/*
 * liveinfo.js se encarga de mostrar información actualizada
 * sobre el tiempo, las redes sociales, etc.
 */

/*
 * BUGS
	
 * TODO
	Interfaz para añadir y modificar liveinfo personalizados
	Modificar widget del tiempo más fácilmente
	Integración de notificaciones sociales con iSocial
 */

var start = {
	clock: {
		update: function() {
			var ampm = "";
			var date = new Date();
			//var dias = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
			var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
			//var months = ["enero", "febrero", "marzo", 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
			var months = ["january", "february", "march", 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
			
			var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
			if (_(ampm) == "true") {
				ampm = "AM";
				
				if (hour > 12) {
					hour = hour - 12;
					ampm = "PM";
				} else if (hour == 0) {
					hour = 12;
				}
			}
			var mins = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
			
			this.node.querySelector('.date').innerHTML = days[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()];
			this.node.querySelector('.time').innerHTML = '<span class="hour">' + hour + "</span>:<span class='mins'>" + mins + "</span>" + ampm;
		},
		load: function() {
			var node = this.node = document.createElement('div');
			node.id = "start_clock";
			node.innerHTML = '<span class="date"></span><span class="time"></span>';
			$(".start").appendChild(node);
			start.clock.update();
			this.interval = setInterval(function(){ start.clock.update() }, 1000);
		}
	},
	speeddial: {
		display: function() {
			var links = JSON.parse(_("speeddial")); // List of [ "(Name)", "(URL)" ]
			var html = "";
			var edithtml = "";
			
			for (var i = 0; i < links.length; i++) {
				var l = links[i];
				
				html += '<a href="' + l[1] + '"><span class="content">' + l[0] + '</span><span class="title"><img src="chrome://favicon/' + l[1] + '" /> ' + l[1].replace("http://","").replace("https://","") + '</span></a>';
				edithtml += '<span class="drop-icon-here" id="drop_icon_' + i + '"></span><a draggable="true" id="dial_icon_' + i + '"><span class="content">' + l[0] + '</span><span class="title"><img src="chrome://favicon/' + l[1] + '" /> ' + l[1].replace("http://","").replace("https://","") + '</span><span class="delete-icon" id="delete_icon_' + i + '"><i class="icon-remove"></i></span></a>';
			}
			
			edithtml += '<span class="drop-icon-here" id="drop_icon_' + i + '"></span>';
			
			$("#dial_container").innerHTML = html;
			$("#current_dial").innerHTML = edithtml;
			
			if ($("#speeddial a[href]")) $("#speeddial a[href]").classList.add("highlight");
			
			var allicons = $$("#current_dial a");
			for (var i = 0; i < allicons.length; i++) {
				allicons[i].ondragstart = function() {
					$("#current_dial").classList.add("ondrag");
					this.classList.add("dragging");
					event.dataTransfer.setData("icon_id", this.id);
				};
				allicons[i].ondragend = function() {
					$("#current_dial").classList.remove("ondrag");
					this.classList.remove("dragging");
					if ($(".ondragover")) {
						$(".ondragover").classList.remove("ondragover");
					}
				};
			}
			
			var alldrops = $$("#current_dial .drop-icon-here");
			for (var i = 0; i < alldrops.length; i++) {
				alldrops[i].ondragenter = function() {
					this.classList.add("ondragover");
				};
				alldrops[i].ondragover = function() {
					event.preventDefault();
				};
				alldrops[i].ondrop = function() {
					event.preventDefault();
					var curicons = JSON.parse(_("speeddial"));
					var newicons = [];
					var last_index = parseInt(event.dataTransfer.getData("icon_id").replace("dial_icon_", ""));
					var new_index = parseInt(this.id.replace("drop_icon_", ""));
					
					if (last_index < new_index) {
						for (var j = 0; j < last_index; j++) {
							newicons.push(curicons[j]);
						}
						
						for (var j = last_index + 1; j < new_index; j++) {
							newicons.push(curicons[j]);
						}
						
						newicons.push(curicons[last_index]);
						
						for (var j = new_index; j < curicons.length; j++) {
							newicons.push(curicons[j]);
						}
					} else {
						for (var j = 0; j < new_index; j++) {
							newicons.push(curicons[j]);
						}
						
						newicons.push(curicons[last_index]);
						
						for (var j = new_index; j < last_index; j++) {
							newicons.push(curicons[j]);
						}
						
						for (var j = last_index + 1; j < curicons.length; j++) {
							newicons.push(curicons[j]);
						}
					}
					
					_("speeddial", JSON.stringify(newicons));
					
					start.speeddial.display();
				};
				alldrops[i].ondragleave = function() {
					this.classList.remove("ondragover");
				};
			}
			
			var alldels = $$("#current_dial .delete-icon");
			for (var i = 0; i < alldels.length; i++) {
				alldels[i].onclick = function() {
					var curicons = JSON.parse(_("speeddial"));
					var delindex = parseInt(this.id.replace("delete_icon_", ""));
					
					curicons.splice(delindex, 1);
					_("speeddial", JSON.stringify(curicons));
					
					start.speeddial.display();
				};
			}
		},
		load: function() {
			if (_("speeddial")) {
				this.display();
			}
		
			$("#add_icon").onclick = start.speeddial.add_icon;
			$("#add_icon_form").onsubmit = function() { start.speeddial.add_icon() };
		},
		add_icon: function() {
			event.preventDefault();
			var name = $("#new_icon_name").value;
			var url = $("#new_icon_url").value;
			
			if (url.indexOf("://") < 0) {
				url = "http://" + url;
			}
			
			if (name.length > 0 && url.length > 0) {
				var allicons = _("speeddial") ? JSON.parse(_("speeddial")) : [];
				
				allicons.push([name, url]);
				
				_("speeddial", JSON.stringify(allicons));
				start.speeddial.display();
				$("#add_icon_form").reset();
			}
		},
		highlighted: 0,
		HighlightItem: function(ind) {
			var all_links = $$("#speeddial a[href]");
			
			if (all_links[ind]) {
				if ($("#speeddial a.highlight")) {
					$("#speeddial a.highlight").classList.remove("highlight");
				}
				all_links[ind].classList.add("highlight");
			
				start.speeddial.highlighted = ind;
			}
		},
	},
	load: function() {
		this.clock.load();
		this.speeddial.load();
	}
};


var wallpaper = {
	load: function() {
		var curwp = _("wallpaper_url");
		
		if (!curwp) {
			curwp = "back/luminance.jpg"; // Default wallpaper
		}
		
		$("body").style.backgroundImage = "url('" + _("wallpaper_url") + "')";
		
		var list = ["astral", "dreamy", "elegance", "gaia", "luminance", "moonbeam", "pearl", "radient", "void"];
		var setwphtml = "";
		
		for (var w in list) {
			var name = list[w];
			
			setwphtml += '<input type="radio" name="wp-select" class="wp-select" value="' + name + '" id="select-' + name + '" /><label for="select-' + name + '" style="background-image:url(back/' + name + '_min.jpg)">' + name + '</label>';
		}
		
		setwphtml += '<input type="radio" name="wp-select" class="wp-select" value="custom" id="select-custom" /><label for="select-custom">custom</label><input type="text" id="custom_wp_url" placeholder="http://example.com/wallpaper.jpg" />';
		
		$("form#wallpaper_settings").innerHTML = setwphtml;
		
		$("form#wallpaper_settings").onchange = function() {
			var newwp = $("form#wallpaper_settings input:checked").value;
			_("wallpaper_url", "back/" + newwp + ".jpg");
			$("body").style.backgroundImage = "url('" + _("wallpaper_url") + "')";
		}
	}
};


var traduccion_weather = [
	"tornado",
	"tormenta tropical",
	"huracán",
	"tormentas fuertes",
	"tormenta",
	"lluvia y nieve",
	"aguanieve",
	"nieve y aguanieve",
	"llovizna helada",
	"llovizna",
	"lluvia helada",
	"chubascos",
	"chubascos",
	"rachas de nieve",
	"chubascos de nieve",
	"nieve y viento",
	"nieve",
	"granizo",
	"aguanieve",
	"polvo en suspensión",
	"niebla",
	"bruma",
	"humo",
	"viento fuerte",
	"viento",
	"frío",
	"nublado",
	"bastante nublado",
	"bastante nublado",
	"parcialmente nublado",
	"parcialmente nublado",
	"despejado",
	"soleado",
	"bueno",
	"bueno",
	"lluvia y granizo",
	"calor",
	"tormentas aisladas",
	"tormentas aisladas",
	"tormentas aisladas",
	"chubascos aislados",
	"mucha nieve",
	"chubascos de nieve aislados",
	"mucha nieve",
	"pacialmente nublado",
	"chubascos tormentosos",
	"chubascos de nieve",
	"chubascos tormentosos aislados"
];
traduccion_weather[3200] = "no disponible";

var liveinfo = {
	store: {
		clock: {
			name: "Reloj",
			id: 0,
			variables: {
				ampm: {description: "¿Utilizar el formato 12 horas?", value: false}
			},
			
			title: "Reloj",
			content: {
				front: "..."
			},
			Update: function UpdateClock() {
				var ampm = "";
				var date = new Date();
				var dias = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
				var meses = ["enero", "febrero", "marzo", 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
				
				var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
				if (this.variables.ampm.value) {
					ampm = "AM";
					
					if (hour > 12) {
						hour = hour - 12;
						ampm = "PM";
					} else if (hour == 0) {
						hour = 12;
					}
				}
				var mins = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
				
				this.node.querySelector('.title').textContent = dias[date.getDay()] + " " + date.getDate() + " " + meses[date.getMonth()];
				this.node.querySelector('.content').textContent = hour + ":" + mins + ampm;
			},
			update_freq: 4,
			
			toJSON: function() {
				return {
					type: "clock",
					variables: this.variables
				};
			},
			create: function(variables) {
				var el = Object.create(liveinfo.store.clock);
				el.variables = variables;
				
				return el;
			}
		},
		weather: {
			name: "El tiempo",
			id: 0,
			variables: {
				citycode: {description: "Código de la localidad", value: "SPXX0045"}
			},
			
			title: "Cargando",
			href: "",
			content: {
				front: "...",
				back: "..."
			},
			Update: function() {
				var el = this.node;
				var cit = this.variables.citycode.value;
				var wreq = new AjaxRequest("http://weather.yahooapis.com/forecastrss?p=" + cit + "&u=c", function(response) {
					var city = response.documentElement.querySelector("title").textContent.replace('Yahoo! Weather - ', '');
					var temp = response.documentElement.querySelector("[temp]").getAttribute("temp");
					var cond = traduccion_weather[response.documentElement.querySelector("[temp]").getAttribute("code")];
					var link = response.documentElement.querySelector("link").textContent;
					el.querySelector('.title').textContent = city;
					el.querySelector('.content').textContent = temp + "º";
					el.querySelector('.content+.content').innerHTML = "<span class=\"small\">" + cond + "</span>";
					el.href = link;
				});
				wreq.Send();
			},
			update_freq: 6000,
			
			toJSON: function() {
				return {
					type: "weather",
					variables: this.variables
				};
			},
			create: function(variables) {
				var el = Object.create(liveinfo.store.weather);
				el.variables = variables;
				
				return el;
			}
		},
		link: {
			name: "Enlace",
			id: 0,
			variables: {
				title: {description: "Título del enlace", value: ""},
				url: {description: "Dirección web", value: ""}
			},
			
			title: "Enlace",
			href: "",
			content: {
				front: "...",
				back: "..."
			},
			
			Update: function() {
				this.node.href = this.variables.url.value;
				this.node.querySelector('.title').textContent = this.variables.title.value;
				this.node.querySelector('.content').innerHTML = '<img src="chrome://favicon/' + this.variables.url.value + '" />';
				this.node.querySelector('.content+.content').innerHTML = '<span style="font-size: 14px">' + this.variables.url.value.split('://')[1] + '</span>';
			},
			
			toJSON: function() {
				return {
					type: "link",
					variables: this.variables
				};
			},
			create: function(variables) {
				var el = Object.create(liveinfo.store.link);
				el.variables = variables;
				
				return el;
			}
		}
		/***************************
		mail: {
			name: "Outlook",
			id: 0,
			variables: {
				// ???
			}
		},
		tuenti: {
			name: "Tuenti",
			id: 0,
			variables: {
				// Integración con iSocial aquí
			}
		},
		twitter: {
			name: "Twitter",
			id: 0,
			variables: {
				// Integración con iSocial aquí
			}
		}
		***************************/
	},
	widgets: [],
	Display: function() {
		$("#start").innerHTML = "";
		
		for (var i = 0; i < this.widgets.length; i++) {
			var dget = this.widgets[i];
			dget.node = document.createElement('a');
			var node = dget.node;
			
			// Identificación del widget
			node.id = "widget_" + i;
			node.classList.add(dget.content.back ? "prelive" : "nolive", i%2>0 ? "r" : "l");
			
			// Contenido del widget
			node.href = dget.href ? dget.href : null;
			node.innerHTML = dget.content.back ? "<div class=\"content\"></div>" : "";
			node.innerHTML += "<div class=\"content\"></div><div class=\"title\"></div>";
			node.querySelector('.title').textContent = dget.title;
			node.querySelector('.content').innerHTML = dget.content.front;
			dget.content.back ? node.querySelector('.content+.content').innerHTML = dget.content.back : 0;
			
			$("#start").appendChild(node);
			
			// Actualizamos contenido
			if (dget.Update) {
				dget.Update();
				if (dget.update_freq) {
					dget.update_interval = setInterval("liveinfo.widgets["+i+"].Update();", dget.update_freq * 1000);
				}
			} else {
				this.UpdateWidget(i);
			}
		}
		
		this.ActivaLiveTiles();
	},
	Load: function() {
		/*try {
			var list = JSON.parse(Store("user_widgets"));
			
			for (widget in list) {
				this.AddWidget(list[widget].type, list[widget].variables);
			}
		} catch(err) {
			console.log("Error al cargar widgets: " + err.message);
		}
		
		this.Display();*/
	},
	UpdateWidget: function(indice) {
		var icon = this.widgets[indice];
		var my_widget = icon.node;
		
		// Actualizamos título y enlace (si está disponible)
		my_widget.querySelector(".title").textContent = icon.title;
		my_widget.href = icon.href? icon.href: null;
		
		// Actualizamos contenido principal y secundario (si disponible)
		my_widget.querySelector('.content').innerHTML = icon.content.front;
		if (icon.content.back && my_widget.querySelectorAll('.content')[1]) {
			my_widget.querySelectorAll('.content')[1].innerHTML = icon.content.back;
		}
	},
	ActivaLiveTiles: function() {
		var a_activar = $$('#liveinfo .prelive');
		
		for (elem in a_activar) {
			var t = Math.floor(Math.random() * 6000);
			
			setTimeout("var el = $(\"#" + a_activar[elem].id + "\"); if (el) { el.classList.remove(\"prelive\"); el.classList.add(\"live\"); }", t);
		}
	},
	Save: function() {
		var storable = this.widgets;
		
		return Store("user_widgets", JSON.stringify(storable));
	},
	AddWidget: function(type, variables) {
		this.widgets.push(this.store[type].create(variables));
	},
	CreateWidget: function(type) {
		var thevars = this.store[type].variables;
		
		if (thevars) {
			for (varname in thevars) {
				switch (typeof thevars[varname].value) {
					case "boolean":
						thevars[varname].value = io.Confirm(thevars[varname].description);
						break;
					case "string":
						thevars[varname].value = io.Ask(thevars[varname].description);
						break;
					case "number":
						thevars[varname].value = parseFloat(io.Ask(thevars[varname].description));
						break;
				}
			}
		}
		
		this.AddWidget(type, thevars);
		this.Display();
		this.Save();
	},
	RemoveWidget: function(indice) {
		this.widgets.splice(indice,1);
		this.Save();
		this.Display();
	}
};