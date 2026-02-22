// ===============================
// AVIRA CORE SYSTEM v2.0
// ===============================

const coreButton = document.getElementById("coreButton");
const statusText = document.getElementById("statusText");
const intelligenceLevel = document.getElementById("intelligenceLevel");
const interactionCount = document.getElementById("interactionCount");
const successRate = document.getElementById("successRate");
const memorySize = document.getElementById("memorySize");
const uptimeDisplay = document.getElementById("uptime");
const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");

let interactions = 0;
let successes = 0;
let intelligence = 1;
let startTime = Date.now();

// ===============================
// UPTIME SYSTEM
// ===============================
setInterval(() => {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  uptimeDisplay.textContent = seconds + "s";
}, 1000);

// ===============================
// STATUS
// ===============================
function updateStatus(text) {
  statusText.textContent = text;
}

// ===============================
// SPEAK FUNCTION
// ===============================
async function speak(text) {
  updateStatus("PROCESSING");

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    const audio = new Audio(audioUrl);
    audio.play();

    audio.onended = () => {
      updateStatus("SYSTEM IDLE");
    };

  } catch (error) {
    console.error("TTS ERROR:", error);
    updateStatus("SYSTEM IDLE");
  }
}

// ===============================
// WAVEFORM VISUAL
// ===============================
canvas.width = window.innerWidth;
canvas.height = 150;

function drawWave() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  for (let x = 0; x < canvas.width; x++) {
    const y =
      canvas.height / 2 +
      Math.sin(x * 0.02 + Date.now() * 0.005) * 20;
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 2;
  ctx.stroke();

  requestAnimationFrame(drawWave);
}

drawWave();

// ===============================
// AI FETCH SECTION
// ===============================
async function fetchAIResponse(userText) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userText }),
    });

    const data = await response.json();

    if (data.reply) {
      return data.reply;
    } else {
      return "I could not understand the response.";
    }
  } catch (error) {
    console.error("AI ERROR:", error);
    return "AI system temporarily unavailable.";
  }
}

// ===============================
// PROCESS COMMAND
// ===============================
recognition.onresult = async function(event) {

  updateStatus("PROCESSING");

  const transcript = event.results[0][0].transcript;

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: transcript })
  });

  const data = await response.json();

  speak(data.reply);
};

// ===============================
// SPEECH RECOGNITION
// ===============================
let recognition;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
} else if ("SpeechRecognition" in window) {
  recognition = new SpeechRecognition();
}

if (recognition) {
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    updateStatus("LISTENING");
  };

  recognition.onresult = (event) => {
    const userText = event.results[0][0].transcript;
    processCommand(userText);
  };

  recognition.onerror = () => {
    updateStatus("SYSTEM IDLE");
  };

  recognition.onend = () => {};
} else {
  updateStatus("VOICE NOT SUPPORTED");
}

// ===============================
// CORE BUTTON
// ===============================
coreButton.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
  }
});