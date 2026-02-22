alert("JS LOADED");

document.addEventListener("DOMContentLoaded", function() {

document.getElementById("coreButton");
  
const statusText = document.getElementById("statusText");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!coreButton) {
    console.log("Core button NOT found");
    return;
  }

  if (!SpeechRecognition) {
    statusText.innerText = "Speech not supported";
    return;
  }

  statusText.innerText = "SYSTEM READY";

  coreButton.addEventListener("click", function() {

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    statusText.innerText = "LISTENING";
    recognition.start();

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      statusText.innerText = "Heard: " + transcript;
    };

    recognition.onerror = function(event) {
      statusText.innerText = "ERROR: " + event.error;
    };

    recognition.onend = function() {
      statusText.innerText = "SYSTEM IDLE";
    };

  });

});