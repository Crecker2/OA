var context = new (window.AudioContext || window.webkitAudioContext)();

//Set up the objects for each part
var solo = { audio: context.createBufferSource(),
	     audioData: context.createBufferSource(),
	     modifier: context.createGain(),
	     file: "",
	     vocal: "solo",
	     request: new XMLHttpRequest(),
	     isPlaying: false,
	     startTime: null,
	     seekAsOfLastPause: 0,
	     duration: 0
            }
var t1 = { audio: context.createBufferSource(),
	   audioData: context.createBufferSource(),
	   modifier: context.createGain(),
	   file: "",
	   vocal: "t1",
	   request: new XMLHttpRequest(),
	   isPlaying: false,
	   startTime: null,
	   seekAsOfLastPause: 0,
	   duration: 0
         }
var t2 = { audio: context.createBufferSource(),
	   audioData: context.createBufferSource(),
	   modifier: context.createGain(),
	   file: "",
	   vocal: "t2",
	   request: new XMLHttpRequest(),
	   isPlaying: false,
	   startTime: null,
	   seekAsOfLastPause: 0,
	   duration: 0
            }
var baritone = {
		 audio: context.createBufferSource(),
		 audioData: context.createBufferSource(),
	 	 modifier: context.createGain(),
		 file: "",
		 vocal: "baritone",
		 request: new XMLHttpRequest(),
		 isPlaying: false,
		 startTime: null,
		 seekAsOfLastPause: 0,
		 duration: 0
            }
var bass = { audio: context.createBufferSource(),
	     audioData: context.createBufferSource(),
	     modifier: context.createGain(),
	     file: "",
	     vocal: "bass",
	     request: new XMLHttpRequest(),
	     isPlaying: false,
	     startTime: null,
	     seekAsOfLastPause: 0,
	     duration: 0
           }

var allParts = [solo, t1, t2, baritone, bass];

var files;
$.ajax({
	url: 'files.json',
}).done(function(data){
	files = jQuery.parseJSON(data);
	for(var i=0; i<allParts.length; i++){
		var file = allParts[i].vocal;
		allParts[i].file = files[file];
	}
	allParts.forEach(function(part){
		part.request = new XMLHttpRequest();
		part.request.open("GET", part.file, true);
		part.request.responseType = "arraybuffer";
		part.request.onload = function(){
			//request.response is audio
			context.decodeAudioData(part.request.response, onDecoded);
		}
		function onDecoded(buffer){
			part.audioData.buffer = buffer;
			partLoadKeeper++;
			playDelay();
		}
		part.request.send();
	});
});

/* create requests, send requests, load files */
var partLoadKeeper = 0;
function playDelay(){
	if(partLoadKeeper === 5){
		window.setTimeout(function(){
			$(".playpausebtn").click(playPause);
			$(".playpausebtn").removeClass("disabled");
			scrubber.max = solo.audioData.buffer.duration;
			$(".timeSong").text(Formatter.formatSeconds(solo.audioData.buffer.duration));
			console.log("ready to play!");
		},1000);
	}
}


function playPause(){
	if(solo.isPlaying == false) {
		$(".playpausebtn").text("Pause");
	
		allParts.forEach(function(part){
			part.isPlaying = true;
			part.audio = context.createBufferSource();
			part.audio.buffer = part.audioData.buffer;
			part.startTime = context.currentTime;
			solo.audio.onended = function(){
				if(solo.duration >= solo.audioData.buffer.duration){
					playPause();
					allParts.forEach(function(part){
						part.duration = 0;
					});
				}
			}
			part.audio.connect(part.modifier);
			part.modifier.connect(context.destination);
			part.audio.start(0,part.duration);
		});
	} else {
		$(".playpausebtn").text("Play");
		allParts.forEach(function(part){
			part.isPlaying = false;
			part.audio.stop();
			part.seekAsOfLastPause = context.currentTime - part.startTime;
			part.duration += part.seekAsOfLastPause;
		});
	}
}

function highlight(part){
	resetVolume();
	allParts.forEach(function(allRest){
		if(allRest.vocal != part.vocal){
			allRest.modifier.gain.value = 1/4;
		}
	});
}
function only(part){
	resetVolume();
	allParts.forEach(function(allRest){
		if(allRest.vocal != part.vocal){
			allRest.modifier.gain.value = 0;
		}
	});
}
function resetVolume(){
	allParts.forEach(function(allRest){
		allRest.modifier.gain.value = 1;
	});
}
//formatter code. Credits to Timothy J. Aveni (https://github.com/syntaxblitz) for the Formatter.
class Formatter {
	static formatSeconds (seconds, padMinutes) {
		var secondsOutput = (seconds % 60).toFixed(2);
		if (secondsOutput.length === 4)
			secondsOutput = '0' + secondsOutput;

		var minutes = Math.floor(seconds / 60);
		var minutesOutput = '' + minutes;
		if (padMinutes && minutesOutput.length === 1) {
			minutesOutput = '0' + minutesOutput;
		}

		var output = minutesOutput + ':' + secondsOutput;

		return output;
	}

	static parseTimecodeString (timecodeString) {
		var matches = timecodeString.match(/([0-9]+):([0-9][0-9]\.([0-9]+)?)/);

		if (matches) {
			let minutes = parseInt(matches[1]);
			let seconds = parseFloat(matches[2]);

			return minutes * 60 + seconds;
		} else {
			return 0;
		}
	}
}
