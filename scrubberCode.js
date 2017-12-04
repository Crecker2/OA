//scrubber code
scrubber.step = .0000000000001;
function scrubTimeKeeper(){
	if(solo.isPlaying){
		scrubber.value = solo.duration + context.currentTime - solo.startTime;
		$(".timeKeeper").text(Formatter.formatSeconds((solo.duration + context.currentTime - solo.startTime)));
	} else {
		scrubber.value = solo.duration;
		$(".timeKeeper").text(Formatter.formatSeconds(solo.duration));
	}
	cancelScrubber = window.requestAnimationFrame(scrubTimeKeeper);
}
window.requestAnimationFrame(scrubTimeKeeper);

function activateScrubbing(){
	window.cancelAnimationFrame(cancelScrubber);
	console.log(scrubber.value);
}
function deactivateScrubbing(){
	playPause();
	allParts.forEach(function(part){
		part.duration = parseFloat(scrubber.value);
	});
	playPause();
	window.requestAnimationFrame(scrubTimeKeeper);
}
scrubber.addEventListener("mousedown", activateScrubbing);
scrubber.addEventListener("mouseup",deactivateScrubbing);
/*for mobile compatibility*/
scrubber.addEventListener("touchstart",activateScrubbing);
scrubber.addEventListener("touchend",deactivateScrubbing);

function spacePlayPause(key){
	var keyCode = key.keyCode;
	if(keyCode === 32){
		playPause();
	}
}
window.addEventListener("keypress",spacePlayPause);

//styling for volume adjustment buttons
$('ul a')[0].setAttribute('class', $('ul a')[0].getAttribute('class') + ' active');
$('ul a').on('click',function(){
	$('ul a').removeClass('active');
	$(this).addClass('active');
});
