/*
  Spectacular Neon Geometric Pattern with Enhanced Music Sync
  ------------------------------------------------------------
  This script:
  - Draws a radial geometric pattern with neon lines.
  - Animates a moving light along each line, whose speed increases with music intensity.
  - Adds a "trail" effect behind the moving light and a pulsating ring that reacts to the music.
  - Uses the Web Audio API to sync visual effects with the music.
*/

// Global variables and canvas setup
const canvas = document.getElementById("patternCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

let center = { x: width / 2, y: height / 2 };
let radius = Math.min(width, height) * 0.45;

const numLines = 16;           // Number of radial lines
const baseSpeed = 0.0003;      // Reduced base animation speed
let syncEnabled = true;        // Music sync enabled by default

// Adjust canvas size on window resize
window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  center = { x: width / 2, y: height / 2 };
  radius = Math.min(width, height) * 0.45;
});

// Audio setup for music synchronization
const audioElement = document.getElementById("audio");
let audioCtx, analyser, source;

if (audioElement) {
  // Create AudioContext and analyser node
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256; // FFT for smooth updates

  // Connect the audio element to the analyser and destination
  source = audioCtx.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  // Resume audio context on play (user interaction required in some browsers)
  audioElement.addEventListener("play", () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  });
}

// Toggle music synchronization with button
document.getElementById("toggleSync").addEventListener("click", () => {
  syncEnabled = !syncEnabled;
});

// Animation loop
let startTime = null;
function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // Get audio amplitude (normalized between 0 and 1)
  let amplitude = 0;
  if (syncEnabled && analyser) {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    amplitude = sum / bufferLength / 255;
  }

  // Loop through each radial line
  for (let i = 0; i < numLines; i++) {
    const angle = (i / numLines) * Math.PI * 2;
    const offset = i / numLines;
    // Reduced dynamic speed: speed increases with amplitude but less drastically
    const dynamicSpeed = baseSpeed * (1 + amplitude * 2);
    const progress = ((elapsed * dynamicSpeed) + offset) % 1;

    // Calculate end coordinates of the line (at circle edge)
    const endX = center.x + radius * Math.cos(angle);
    const endY = center.y + radius * Math.sin(angle);

    // Calculate moving light position on the line
    const lightX = center.x + progress * radius * Math.cos(angle);
    const lightY = center.y + progress * radius * Math.sin(angle);

    // Calculate dynamic neon color based on time and line index
    const hue = (elapsed * 0.05 + i * (360 / numLines)) % 360;

    // Draw the radial line with a gradient that lights up with the moving light's color
    ctx.save();
    const lineGradient = ctx.createLinearGradient(center.x, center.y, endX, endY);
    lineGradient.addColorStop(0, `hsla(${hue}, 100%, 20%, ${0.3 + amplitude * 0.7})`);
    lineGradient.addColorStop(progress, `hsla(${hue}, 100%, 60%, ${0.9 + amplitude * 0.1})`);
    lineGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 6 + amplitude * 4; // Thicker line during intensity peaks
    ctx.lineCap = "round";
    ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${0.8 + amplitude * 0.2})`;
    ctx.shadowBlur = 30 + amplitude * 100;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    // Draw the moving light (circle with radial gradient)
    ctx.save();
    const glowRadius = 20 + amplitude * 40;
    const radialGradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, glowRadius);
    radialGradient.addColorStop(0, `hsla(${hue}, 100%, 60%, ${0.9 + amplitude * 0.1})`);
    radialGradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`);
    ctx.fillStyle = radialGradient;
    ctx.shadowBlur = 50 + amplitude * 100;
    ctx.shadowColor = `hsla(${hue}, 100%, 80%, ${0.9 + amplitude * 0.1})`;
    ctx.beginPath();
    ctx.arc(lightX, lightY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Trail effect behind the moving light to emphasize movement
    ctx.save();
    const trailOffset = 0.08; // Offset for the trail effect
    let trailProgress = (progress - trailOffset + 1) % 1;
    const trailX = center.x + trailProgress * radius * Math.cos(angle);
    const trailY = center.y + trailProgress * radius * Math.sin(angle);
    const trailGlowRadius = 10 + amplitude * 20;
    const trailGradient = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, trailGlowRadius);
    trailGradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.7)`);
    trailGradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`);
    ctx.fillStyle = trailGradient;
    ctx.beginPath();
    ctx.arc(trailX, trailY, trailGlowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Additional effect: a pulsating ring around the pattern reacting to the music
  ctx.save();
  const ringAlpha = amplitude * 0.7;
  if (ringAlpha > 0.1) {
    const outerRadius = radius + amplitude * 80;
    const ringGradient = ctx.createRadialGradient(center.x, center.y, radius, center.x, center.y, outerRadius);
    ringGradient.addColorStop(0, `hsla(${(elapsed * 0.05) % 360}, 100%, 50%, 0)`);
    ringGradient.addColorStop(0.5, `hsla(${(elapsed * 0.05) % 360}, 100%, 70%, ${ringAlpha})`);
    ringGradient.addColorStop(1, `hsla(${(elapsed * 0.05) % 360}, 100%, 70%, 0)`);
    ctx.fillStyle = ringGradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, outerRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Request the next frame of animation
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
