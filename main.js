const coreButton = document.getElementById("coreButton");
const statusText = document.getElementById("statusText");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  statusText.innerText = "SpeechRecognition NOT supported";
} else {

  statusText.innerText = "Ready";

  coreButton.onclick = () => {

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    statusText.innerText = "Listening...";

    recognition.start();

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      statusText.innerText = "Heard: " + transcript;
    };

    recognition.onerror = function(event) {
      statusText.innerText = "Error: " + event.error;
    };

    recognition.onend = function() {
      console.log("Recognition ended");
    };
  };
}