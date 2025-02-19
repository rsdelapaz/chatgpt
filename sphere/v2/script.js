/*
  3D Neon Holographic Sphere Animation V2.4
  ------------------------------------------
  This script creates:
    • A dynamic deep-space background with drifting stars, streaking comets, and subtle neon nebulae.
    • A holographic sphere rendered as neon points using a Fibonacci sphere algorithm.
    • A radiant beam that travels along the sphere's surface on a smooth great‑circle path.
         The beam now has a smaller, more concentrated head and a dramatically extended trail,
         evoking the look of a meteor with a fiery, dusty wake.
    • A minimalist, interactive planet with a Saturn‑like ring in the background.
    • Interactive camera control (click/drag or touch) to adjust the view.
    • A fully configurable control panel for neon color (or cycling), color cycle speed, beam speed,
         trail length, sphere rotation speed, and star/comet speed.
    • Minimalistic icon buttons (placed outside the panel) to toggle the configuration panel and fullscreen mode.
*/

// --- SPACE BACKGROUND SETUP ---
const spaceCanvas = document.getElementById('space');
const sctx = spaceCanvas.getContext('2d');
spaceCanvas.width = window.innerWidth;
spaceCanvas.height = window.innerHeight;

// Star settings
const numStars = 150;
const stars = [];
let starSpeed = parseFloat(document.getElementById('starSpeed').value);
for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * spaceCanvas.width,
    y: Math.random() * spaceCanvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 0.5 + 0.2
  });
}

// Nebula settings
const numNebula = 5;
const nebulae = [];
for (let i = 0; i < numNebula; i++) {
  nebulae.push({
    x: Math.random() * spaceCanvas.width,
    y: Math.random() * spaceCanvas.height,
    radius: Math.random() * 100 + 50,
    color: `rgba(${Math.floor(100 + Math.random() * 155)}, ${Math.floor(100 + Math.random() * 155)}, ${Math.floor(100 + Math.random() * 155)}, 0.15)`,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2
  });
}

// Comet settings
const comets = [];
function spawnComet() {
  if (Math.random() < 0.005) {
    comets.push({
      x: Math.random() * spaceCanvas.width,
      y: 0,
      length: Math.random() * 80 + 50,
      speed: Math.random() * 3 + 2,
      angle: Math.PI / 4,
      life: 0
    });
  }
}

// Draw a minimalist planet with a Saturn-like ring
function drawPlanet() {
  const planetX = spaceCanvas.width * 0.8;
  const planetY = spaceCanvas.height * 0.7;
  const planetRadius = 30;
  sctx.beginPath();
  sctx.fillStyle = '#222';
  sctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
  sctx.fill();
  sctx.beginPath();
  sctx.strokeStyle = '#555';
  sctx.lineWidth = 2;
  sctx.ellipse(planetX, planetY, planetRadius + 10, planetRadius + 4, Math.PI / 6, 0, Math.PI * 2);
  sctx.stroke();
}

function animateSpace() {
  sctx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);

  // Draw nebulae
  for (let nebula of nebulae) {
    nebula.x += nebula.speedX;
    nebula.y += nebula.speedY;
    if (nebula.x < 0) nebula.x = spaceCanvas.width;
    if (nebula.x > spaceCanvas.width) nebula.x = 0;
    if (nebula.y < 0) nebula.y = spaceCanvas.height;
    if (nebula.y > spaceCanvas.height) nebula.y = 0;
    let grad = sctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
    grad.addColorStop(0, nebula.color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
    sctx.fill();
  }
  
  // Draw stars
  for (let star of stars) {
    star.y += star.speed * (starSpeed / 10);
    if (star.y > spaceCanvas.height) {
      star.y = 0;
      star.x = Math.random() * spaceCanvas.width;
    }
    sctx.fillStyle = '#fff';
    sctx.beginPath();
    sctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    sctx.fill();
  }
  
  spawnComet();
  // Draw comets
  for (let i = comets.length - 1; i >= 0; i--) {
    const comet = comets[i];
    comet.x += comet.speed * Math.cos(comet.angle);
    comet.y += comet.speed * Math.sin(comet.angle);
    comet.life++;
    let grad = sctx.createLinearGradient(
      comet.x, comet.y,
      comet.x - comet.length * Math.cos(comet.angle),
      comet.y - comet.length * Math.sin(comet.angle)
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sctx.strokeStyle = grad;
    sctx.lineWidth = 2;
    sctx.beginPath();
    sctx.moveTo(comet.x, comet.y);
    sctx.lineTo(
      comet.x - comet.length * Math.cos(comet.angle),
      comet.y - comet.length * Math.sin(comet.angle)
    );
    sctx.stroke();
    if (comet.x > spaceCanvas.width || comet.y > spaceCanvas.height || comet.life > 150) {
      comets.splice(i, 1);
    }
  }
  
  // Draw the planet
  //drawPlanet();

  requestAnimationFrame(animateSpace);
}
animateSpace();

document.getElementById('starSpeed').addEventListener('input', (e) => {
  starSpeed = parseFloat(e.target.value);
});

// --- HOLOGRAM SPHERE & BEAM ANIMATION ---
const holoCanvas = document.getElementById('hologram');
const hctx = holoCanvas.getContext('2d');
holoCanvas.width = window.innerWidth;
holoCanvas.height = window.innerHeight;

// Control panel elements
const neonColorSelect = document.getElementById('neonColor');
const colorCycleSpeedInput = document.getElementById('colorCycleSpeed');
const beamSpeedInput = document.getElementById('beamSpeed');
const trailLengthInput = document.getElementById('trailLength');
const rotationSpeedInput = document.getElementById('rotationSpeed');

// Sphere settings using Fibonacci sphere algorithm
const sphereRadius = 150;
const numPoints = 500;
let spherePoints = [];
for (let i = 0; i < numPoints; i++) {
  const offset = 2 / numPoints;
  const y = i * offset - 1 + (offset / 2);
  const r = Math.sqrt(1 - y * y);
  const phi = i * Math.PI * (3 - Math.sqrt(5));
  const x = Math.cos(phi) * r;
  const z = Math.sin(phi) * r;
  spherePoints.push({ x: x * sphereRadius, y: y * sphereRadius, z: z * sphereRadius });
}

// Perspective and rotation settings
let rotX = 0, rotY = 0;
const cameraDistance = 400;
const centerX = holoCanvas.width / 2;
const centerY = holoCanvas.height / 2;

// Interactive camera control variables
let userRotX = 0, userRotY = 0;
let isDragging = false, lastMouseX = 0, lastMouseY = 0;

function project(point) {
  const factor = cameraDistance / (cameraDistance + point.z);
  return {
    x: point.x * factor + centerX,
    y: point.y * factor + centerY
  };
}
function rotatePoint(p, angleX, angleY) {
  let y = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
  let z = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
  let x = p.x * Math.cos(angleY) + z * Math.sin(angleY);
  z = -p.x * Math.sin(angleY) + z * Math.cos(angleY);
  return { x, y, z };
}

// Beam variables: the beam travels along the sphere's surface.
let beamProgress = 0;
// Reduced beamDelta for a denser, longer trail.
const beamDelta = 0.01;

function animateHologram() {
  hctx.clearRect(0, 0, holoCanvas.width, holoCanvas.height);

  // Update sphere rotation based on control and user interaction.
  const rotSpeed = parseFloat(rotationSpeedInput.value) * 0.01;
  rotX += rotSpeed;
  rotY += rotSpeed;
  const finalRotX = rotX + userRotX;
  const finalRotY = rotY + userRotY;

  // Determine neon color.
  let neonColor = neonColorSelect.value;
  if (neonColor === 'cycle') {
    const cycleSpeed = parseFloat(colorCycleSpeedInput.value);
    const time = Date.now() * cycleSpeed * 0.002;
    neonColor = 'hsl(' + (time % 360) + ', 100%, 50%)';
  }

  // Draw sphere points as neon dots.
  hctx.fillStyle = neonColor;
  for (let p of spherePoints) {
    const rotated = rotatePoint(p, finalRotX, finalRotY);
    const proj = project(rotated);
    hctx.beginPath();
    hctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
    hctx.fill();
  }

  // Update beam progress.
  const beamSpeed = parseFloat(beamSpeedInput.value) * 0.005;
  beamProgress += beamSpeed;

  // Compute current beam position on sphere's surface using spherical coordinates.
  const beamPhi = beamProgress;
  const beamTheta = Math.PI / 2 + 0.2 * Math.sin(beamProgress * 0.5);
  let beamPoint = {
    x: sphereRadius * Math.sin(beamTheta) * Math.cos(beamPhi),
    y: sphereRadius * Math.sin(beamTheta) * Math.sin(beamPhi),
    z: sphereRadius * Math.cos(beamTheta)
  };
  beamPoint = rotatePoint(beamPoint, finalRotX, finalRotY);
  const beam2D = project(beamPoint);

  // Draw the beam head as a small glowing dot.
  const headRadius = 10; // Smaller head for a more delicate effect.
  const headGradient = hctx.createRadialGradient(beam2D.x, beam2D.y, 0, beam2D.x, beam2D.y, headRadius);
  headGradient.addColorStop(0, neonColor);
  headGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  hctx.fillStyle = headGradient;
  hctx.shadowColor = neonColor;
  hctx.shadowBlur = 40;
  hctx.beginPath();
  hctx.arc(beam2D.x, beam2D.y, headRadius, 0, Math.PI * 2);
  hctx.fill();
  hctx.shadowBlur = 0;

  // Draw an extended, dramatic trail along the sphere's curvature.
  const trailLength = parseInt(trailLengthInput.value);
  for (let i = 0; i <= trailLength; i++) {
    const t = beamProgress - i * beamDelta;
    const tPhi = t;
    const tTheta = Math.PI / 2 + 0.2 * Math.sin(t * 0.5);
    let point = {
      x: sphereRadius * Math.sin(tTheta) * Math.cos(tPhi),
      y: sphereRadius * Math.sin(tTheta) * Math.sin(tPhi),
      z: sphereRadius * Math.cos(tTheta)
    };
    point = rotatePoint(point, finalRotX, finalRotY);
    const projPoint = project(point);
    
    // Compute fading alpha and decreasing size for the trail particles.
    const alpha = Math.max(0, 1 - i / trailLength);
    const size = 4 * alpha;
    
    hctx.fillStyle = neonColor;
    hctx.globalAlpha = alpha * 0.8;
    hctx.beginPath();
    hctx.arc(projPoint.x, projPoint.y, size, 0, Math.PI * 2);
    hctx.fill();
    hctx.globalAlpha = 1;
  }
  
  requestAnimationFrame(animateHologram);
}
animateHologram();

// --- Interactive Camera Control ---
holoCanvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});
holoCanvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  userRotY += dx * 0.005;
  userRotX += dy * 0.005;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});
holoCanvas.addEventListener('mouseup', () => { isDragging = false; });
holoCanvas.addEventListener('mouseleave', () => { isDragging = false; });
holoCanvas.addEventListener('touchstart', (e) => {
  isDragging = true;
  const touch = e.touches[0];
  lastMouseX = touch.clientX;
  lastMouseY = touch.clientY;
});
holoCanvas.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  const dx = touch.clientX - lastMouseX;
  const dy = touch.clientY - lastMouseY;
  userRotY += dx * 0.005;
  userRotX += dy * 0.005;
  lastMouseX = touch.clientX;
  lastMouseY = touch.clientY;
  e.preventDefault();
});
holoCanvas.addEventListener('touchend', () => { isDragging = false; });

// --- Fullscreen Toggle ---
const fullscreenToggle = document.getElementById('fullscreenToggle');
fullscreenToggle.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
});

// --- Update Canvas Sizes on Window Resize ---
window.addEventListener('resize', () => {
  spaceCanvas.width = window.innerWidth;
  spaceCanvas.height = window.innerHeight;
  holoCanvas.width = window.innerWidth;
  holoCanvas.height = window.innerHeight;
});

// --- Toggle Configuration Panel ---
const toggleBtn = document.getElementById('toggleConfig');
const controlsPanel = document.getElementById('controls');
toggleBtn.addEventListener('click', () => {
  
  if (controlsPanel.style.display === 'none') {
    controlsPanel.style.display = 'block';
  } else {
    controlsPanel.style.display = 'none';
  }
});
