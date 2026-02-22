// ==============================
// AVIRA HYBRID CORE v1 CLEAN
// ==============================

const coreButton = document.getElementById("coreButton");
const statusText = document.getElementById("statusText");
const intelligenceLevel = document.getElementById("intelligenceLevel");
const interactionCountEl = document.getElementById("interactionCount");
const successRateEl = document.getElementById("successRate");
const memorySizeEl = document.getElementById("memorySize");
const uptimeEl = document.getElementById("uptime");
const waveformCanvas = document.getElementById("waveform");

let interactions = 0;
let successes = 0;
let memory = [];
let startTime = Date.now();

// ==============================
// STATUS CONTROL
// ==============================
function updateStatus(text) {
  statusText.innerText = text;
}

// ==============================
// UPTIME
// ==============================
setInterval(() => {
  const diff = Math.floor((Date.now() - startTime) / 1000);
  uptimeEl.innerText = diff + "s";
}, 1000);

// ==============================
// WAVE VISUALIZER
// ==============================
function visualizeAudio(audio) {
  const ctx = waveformCanvas.getContext("2d");
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 128;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    let barWidth = waveformCanvas.width / bufferLength;

    for (let i = 0; i < bufferLength; i++) {
      let barHeight = dataArray[i] / 2;
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(i * barWidth, waveformCanvas.height - barHeight, barWidth - 2, barHeight);
    }
  }

  draw();
}

// ==============================
// SPEAK FUNCTION (REAL TTS)
// ==============================
async function speak(text) {

  try {

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      updateStatus("TTS ERROR");
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.play();

    visualizeAudio(audio);

    audio.onended = () => {
      updateStatus("SYSTEM IDLE");
    };

  } catch (err) {
    console.log(err);
    updateStatus("TTS FAILED");
  }
}

// ==============================
// AI REQUEST
// ==============================
async function askAI(message) {

  try {

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      updateStatus("AI ERROR");
      return null;
    }

    const data = await response.json();
    return data.reply;

  } catch (err) {
    console.log(err);
    updateStatus("AI FAILED");
    return null;
  }
}

// ==============================
// MIC HANDLER
// ==============================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  updateStatus("VOICE NOT SUPPORTED");
} else {

  coreButton.addEventListener("click", () => {

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    updateStatus("LISTENING");

    recognition.start();

    recognition.onresult = async (event) => {

      interactions++;
      interactionCountEl.innerText = interactions;

      const transcript = event.results[0][0].transcript.toLowerCase();
      memory.push(transcript);
      memorySizeEl.innerText = memory.length;

      updateStatus("PROCESSING");

      const aiReply = await askAI(transcript);

      if (aiReply) {
        successes++;
        successRateEl.innerText = Math.floor((successes / interactions) * 100);
        intelligenceLevel.innerText = Math.min(100, interactions * 5);

        speak(aiReply);
      } else {
        updateStatus("AI FAILED");
      }
    };

    recognition.onerror = (event) => {
      console.log(event.error);
      updateStatus("MIC ERROR");
    };

    recognition.onend = () => {
      updateStatus("SYSTEM IDLE");
    };

  });

}