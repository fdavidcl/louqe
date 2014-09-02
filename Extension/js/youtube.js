search.lenses.youtube = new Lens({
	id: "youtube",
	url: "https://www.googleapis.com/youtube/v3/search?part=snippet&order=relevance&type=video&videoDefinition=any&videoEmbeddable=any&key=AIzaSyCZzbZYrl0q_DifacgL__oJMcSRLfR8qsY&maxResults=8&q=",
	name: "Videos",
	icon: "youtube-play",
	delay: 1000,
	generateAnswer: function(response) {
		response = JSON.parse(response);
		var vidhtml = [];
		
		if (response.items.length > 0) {
			var vidlist = response.items;
			
			for (var i = 0; i < vidlist.length; i++) {
				var video = vidlist[i];
				vidhtml.push({
					class: "bigthumb",
					href: "http://www.youtube.com/watch?v=" + video.id.videoId,
					html: '<img class="thumbnail" src="' + video.snippet.thumbnails["default"].url + '" />' + video.snippet.title + '<br /><span class="author">' + video.snippet.channelTitle + '</span>'
				});
			}
		}
		
		return vidhtml;
	}
});