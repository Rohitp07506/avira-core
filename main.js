const coreButton = document.getElementById("coreButton");
const statusText = document.getElementById("statusText");

const intelligenceLevelEl = document.getElementById("intelligenceLevel");
const interactionCountEl = document.getElementById("interactionCount");
const successRateEl = document.getElementById("successRate");
const memorySizeEl = document.getElementById("memorySize");
const uptimeEl = document.getElementById("uptime");

const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");

let AVIRA = JSON.parse(localStorage.getItem("AVIRA")) || {
  version: "1.0",
  protocol: "Stark Adaptive Protocol",
  interactions: 0,
  successful: 0,
  learnedCommands: [],
  memory: [],
  startTime: Date.now()
};

function saveSystem() {
  localStorage.setItem("AVIRA", JSON.stringify(AVIRA));
}

function updateMetrics() {
  let intelligence =
    (AVIRA.learnedCommands.length * 10) +
    (AVIRA.successful * 2) +
    (AVIRA.memory.length * 5);

  intelligenceLevelEl.innerText = intelligence;
  interactionCountEl.innerText = AVIRA.interactions;

  let rate = AVIRA.interactions > 0
    ? Math.floor((AVIRA.successful / AVIRA.interactions) * 100)
    : 0;

  successRateEl.innerText = rate;
  memorySizeEl.innerText = AVIRA.memory.length;

  let uptime = Math.floor((Date.now() - AVIRA.startTime) / 1000);
  uptimeEl.innerText = uptime + "s";
}

setInterval(updateMetrics, 1000);

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utter);
  visualize();
}

function visualize() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 30; i++) {
    let height = Math.random() * 80;
    ctx.fillStyle = "#00f0ff";
    ctx.fillRect(i * 12, 100 - height, 8, height);
  }
}

function processCommand(command) {
  AVIRA.interactions++;
  AVIRA.memory.push(command);

  if (!AVIRA.learnedCommands.includes(command)) {
    AVIRA.learnedCommands.push(command);
  }

  let response = "Command acknowledged.";

  if (command.includes("hello")) {
    response = "Hello Rohit.";
    AVIRA.successful++;
  }
  else if (command.includes("time")) {
    response = new Date().toLocaleTimeString();
    AVIRA.successful++;
  }
  else if (command.includes("who are you")) {
    response = "I am AVIRA, evolving with you.";
    AVIRA.successful++;
  }

  saveSystem();
  updateMetrics();
  speak(response);
}

coreButton.onclick = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.start();

  statusText.innerText = "LISTENING";

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    statusText.innerText = "PROCESSING";
    processCommand(transcript);
    statusText.innerText = "SYSTEM IDLE";
  };

  recognition.onerror = function() {
    statusText.innerText = "ERROR";
  };
};

updateMetrics();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js");
  });
}