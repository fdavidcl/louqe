search.answers.youtube = {
	name: "Videos",
	url: "https://www.googleapis.com/youtube/v3/search?part=snippet&order=relevance&type=video&videoDefinition=any&videoEmbeddable=any&key=AIzaSyCZzbZYrl0q_DifacgL__oJMcSRLfR8qsY&maxResults=8&q=",
	delay: 500,
	generateAnswer: function(response) {
		response = JSON.parse(response);
		var vidhtml = "";
		
		if (response.items.length > 0) {
			var vidlist = response.items;
			
			for (var i = 0; i < vidlist.length; i++) {
				var video = vidlist[i];
				vidhtml += '<a href="http://www.youtube.com/watch?v=' + video.id.videoId + '" class="video answer"><img class="video-thumbnail" src="' + video.snippet.thumbnails["default"].url + '" />' + video.snippet.title + '<br /><span class="video-author">' + video.snippet.channelTitle + '</span></a>';
			}
		}
		
		return vidhtml;
	}
};