
var audioPlayer = document.getElementById("myAudio");
var audioTimeDisplay = document.getElementById("audioTime");

var videoPlayer = document.getElementById("myVideo");
var videoTimeDisplay = document.getElementById("videoTime");




audioPlayer.addEventListener("timeupdate", function() {
    
    var currentTime = audioPlayer.currentTime.toFixed(2);
    audioTimeDisplay.innerText = currentTime;
});


videoPlayer.addEventListener("timeupdate", function() {
    var currentTime = videoPlayer.currentTime.toFixed(2);
    videoTimeDisplay.innerText = currentTime;
});