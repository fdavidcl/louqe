search.lenses.lastfm = new Lens({
	id: "lastfm",
	url: "http://ws.audioscrobbler.com/2.0/?method=track.search&api_key=a1bb084d4264b8ee3ef29234f1d0a25d&format=json&limit=15&track=",
	name: "Songs",
	icon: "music",
	delay: 1000,
	generateAnswer: function(response) {
		response = JSON.parse(response);
		var lnlist = [];
		
		if (response.results.trackmatches.track) {
			var songlist = response.results.trackmatches.track;
			
			for (var i = 0; i < songlist.length; i++) {
				var song = songlist[i];
				lnlist.push({
					href: song.url,
					html: '<img class="album-thumbnail" src="' + (song.image ? song.image[0]["#text"] : "") + '" />' + song.artist + ' - <span class="song-name">' + song.name + '</span>'
				})

				//mushtml += '<a href="' + song.url + '" class="oneline answer"><img class="album-thumbnail" src="' + (song.image ? song.image[0]["#text"] : "") + '" />' + song.artist + ' - <span class="song-name">' + song.name + '</span></a>';
			}
		}
		
		return lnlist;
	}
});