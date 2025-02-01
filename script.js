///////////////
// PARAMETRS //
///////////////

const baseURL = "https://nuttylmao.github.io/youtube-music-widget";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const token = urlParams.get("token") || "";
const visibilityDuration = urlParams.get("duration") || 0;
const hideAlbumArt = urlParams.has("hideAlbumArt");


/////////////////
// GLOBAL VARS //
/////////////////

let animationSpeed = 0.5;
let currentState = 0;


////////////
// SOCKET //
////////////

function connectws() {
	const socket = io("http://localhost:9863/api/v1/realtime", {
		transports: ['websocket'],
		auth: {
			token: token
		}
	}); 
	
	socket.on("state-update", (state) => {
		console.debug(state);
		UpdatePlayer(state);
	});

	socket.on("playlist-created", (playlist) => {
		console.debug(playlist);
	});

	socket.on("playlist-delete", (playlistId) => {
		console.debug(playlistId);
	});
	
	socket.on('connect', function(){
		SetConnectionStatus(true);
	});

	socket.on('disconnect', function(){
		SetConnectionStatus(false);
		setTimeout(connectws, 5000);
	});
}

function UpdatePlayer(state) {

	if (state.player.trackState != currentState)
	{
		// Set thumbnail
		const songInfo = state.video;
		const thumbnail = songInfo.thumbnails[songInfo.thumbnails.length - 1].url;
		console.log(thumbnail);
		UpdateAlbumArt(document.getElementById("albumArt"), thumbnail);
		UpdateAlbumArt(document.getElementById("backgroundImage"), thumbnail);
	
		// Set song info
		console.log(`Artist: ${songInfo.author}`);
		console.log(`Title: ${songInfo.title}`);
		UpdateTextLabel(document.getElementById("artistLabel"), songInfo.author);
		UpdateTextLabel(document.getElementById("songLabel"), songInfo.title);

		// Set player visibility
		switch (state.player.trackState)
		{
			case -1:
				console.log("Player State: Unknown");
				SetVisibility(false);
				break;
			case 0:
				console.log("Player State: Paused");
				SetVisibility(false);
				break;
			case 2:
				console.log("Player State: Buffering");
				SetVisibility(false);
				break;
			case 1:
				console.log("Player State: Playing");
				setTimeout(() => {
					SetVisibility(true);
				}, animationSpeed * 1000);
				break;
		}

		currentState = state.player.trackState;
	}	

	// Set progressbar	
	const songInfo = state.video;
	const progress = ((state.player.videoProgress / songInfo.durationSeconds) * 100);
	const progressTime = ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(state.player.videoProgress);
	const duration = ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(songInfo.durationSeconds);	
	console.log(`Progress: ${ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(state.player.videoProgress)}`);
	console.log(`Duration: ${ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(songInfo.durationSeconds)}`);
	document.getElementById("progressBar").style.width = `${progress}%`;
	document.getElementById("progressTime").innerHTML = progressTime;
	document.getElementById("duration").innerHTML = `-${duration}`;

}

function UpdateTextLabel(div, text) {
	if (div.innerHTML != text) {
		div.setAttribute("class", "text-fade");
		setTimeout(() => {
			div.innerHTML = text;
			div.setAttribute("class", ".text-show");
		}, animationSpeed * 250);
	}
}

function UpdateAlbumArt(div, imgsrc) {
	if (div.src != imgsrc) {
		div.setAttribute("class", "text-fade");
		setTimeout(() => {
			div.src = imgsrc;
			div.setAttribute("class", "text-show");
		}, animationSpeed * 500);
	}
}

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

function ConvertSecondsToMinutesSoThatItLooksBetterOnTheOverlay(time) {
	const minutes = Math.floor(time / 60);
	const seconds = Math.trunc(time - minutes * 60);

	return `${minutes}:${('0' + seconds).slice(-2)}`;
}

function SetVisibility(isVisible) {
	widgetVisibility = isVisible;

	const mainContainer = document.getElementById("mainContainer");

	if (isVisible) {
		var tl = new TimelineMax();
		tl
			.to(mainContainer, animationSpeed, { bottom: "50%", ease: Power1.easeInOut }, 'label')
			.to(mainContainer, animationSpeed, { opacity: 1, ease: Power1.easeInOut }, 'label')
	}
	else {
		var tl = new TimelineMax();
		tl
			.to(mainContainer, animationSpeed, { bottom: "45%", ease: Power1.easeInOut }, 'label')
			.to(mainContainer, animationSpeed, { opacity: 0, ease: Power1.easeInOut }, 'label')
	}
}



///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

// This function sets the visibility of the Streamer.bot status label on the overlay
function SetConnectionStatus(connected) {
	let statusContainer = document.getElementById("statusContainer");
	if (connected) {
		statusContainer.style.background = "#2FB774";
		statusContainer.innerText = "Connected!";
		var tl = new TimelineMax();
		tl
			.to(statusContainer, 0, { opacity: 1, ease: Linear.easeNone })
			.to(statusContainer, 2, { opacity: 0, ease: Linear.easeNone });
		console.log("Connected!");
	}
	else {
		// statusContainer.style.background = "#D12025";
		// statusContainer.innerText = "Connecting...";
		// var tl = new TimelineMax();
		// tl
		// 	.to(statusContainer, 0, { opacity: 1, ease: Linear.easeNone })
		// 	.to(statusContainer, 2, { opacity: 0, ease: Linear.easeNone });
		console.log("Not connected...");
	}
}



//////////////////////////////////////////////////////////////////////////////////////////
// RESIZER THING BECAUSE I THINK I KNOW HOW RESPONSIVE DESIGN WORKS EVEN THOUGH I DON'T //
//////////////////////////////////////////////////////////////////////////////////////////

let outer = document.getElementById('mainContainer'),
	maxWidth = outer.clientWidth,
	maxHeight = outer.clientHeight;

window.addEventListener("resize", resize);

resize();
function resize() {
	const scale = window.innerWidth / maxWidth;
	outer.style.transform = 'translate(-50%, 50%) scale(' + scale + ')';
}



/////////////////////////////////////////////////////////////////////
// IF THE USER PUT IN THE HIDEALBUMART PARAMATER, THEN YOU SHOULD  //
//   HIDE THE ALBUM ART, BECAUSE THAT'S WHAT IT'S SUPPOSED TO DO   //
/////////////////////////////////////////////////////////////////////

if (hideAlbumArt)
{
	document.getElementById("albumArtBox").style.display = "none";
	document.getElementById("songInfoBox").style.width = "calc(100% - 20px)";
}

if (token == "")
{
	console.log("No token detected...");
	window.open(`${baseURL}/configure`);
}
else
	connectws();