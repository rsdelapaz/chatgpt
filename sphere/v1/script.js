/*
  3D Neon Holographic Sphere Comet Animation with Configurable Color Cycle & Toggleable Controls
  -----------------------------------------------------------------------------------------------
  This script creates:
    • A dynamic deep-space background with drifting stars and streaking comets.
    • A holographic sphere rendered as neon points using a Fibonacci sphere algorithm.
    • A radiant beam (like a comet) that travels along the sphere’s surface on a smooth geodesic path.
       The beam is thick, glows intensely at its sides, and leaves an impressive trail.
    • A fully configurable control panel for neon color (or cycling), color cycle speed, beam speed,
      trail length, sphere rotation speed, and background star speed.
    • A toggle button to show/hide the configuration panel.
*/

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  /* =======================
     SPACE BACKGROUND SETUP
  =========================== */
  const spaceCanvas = document.getElementById('space');
  const sctx = spaceCanvas.getContext('2d');
  spaceCanvas.width = window.innerWidth;
  spaceCanvas.height = window.innerHeight;

  // Star and comet settings
  const numStars = 150;
  const stars = [];
  const comets = [];
  let starSpeed = parseFloat(document.getElementById('starSpeed').value);

  // Create stars with random positions
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * spaceCanvas.width,
      y: Math.random() * spaceCanvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2
    });
  }

  // Occasionally spawn a comet
  function spawnComet() {
    if (Math.random() < 0.005) {
      comets.push({
        x: Math.random() * spaceCanvas.width,
        y: 0,
        length: Math.random() * 80 + 50,
        speed: Math.random() * 3 + 2,
        angle: Math.PI / 4, // 45° downward-right
        life: 0
      });
    }
  }

  function animateSpace() {
    sctx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
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
    // Update and draw comets
    for (let i = comets.length - 1; i >= 0; i--) {
      const comet = comets[i];
      comet.x += comet.speed * Math.cos(comet.angle);
      comet.y += comet.speed * Math.sin(comet.angle);
      comet.life++;
      let gradient = sctx.createLinearGradient(
        comet.x, comet.y,
        comet.x - comet.length * Math.cos(comet.angle),
        comet.y - comet.length * Math.sin(comet.angle)
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      sctx.strokeStyle = gradient;
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
    requestAnimationFrame(animateSpace);
  }
  animateSpace();

  document.getElementById('starSpeed').addEventListener('input', (e) => {
    starSpeed = parseFloat(e.target.value);
  });

  /* ===============================
     HOLOGRAM SPHERE & BEAM ANIMATION
  ================================ */
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

  // Perspective projection function
  function project(point) {
    const factor = cameraDistance / (cameraDistance + point.z);
    return {
      x: point.x * factor + centerX,
      y: point.y * factor + centerY
    };
  }

  // Rotate a point around X and Y axes
  function rotatePoint(p, angleX, angleY) {
    let y = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
    let z = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
    let x = p.x * Math.cos(angleY) + z * Math.sin(angleY);
    z = -p.x * Math.sin(angleY) + z * Math.cos(angleY);
    return { x, y, z };
  }

  // Beam variables: the beam travels along the sphere's surface.
  let beamProgress = 0;
  const beamDelta = 0.02;

  function animateHologram() {
    hctx.clearRect(0, 0, holoCanvas.width, holoCanvas.height);

    // Update sphere rotation based on rotationSpeed control.
    const rotSpeed = parseFloat(rotationSpeedInput.value) * 0.01;
    rotX += rotSpeed;
    rotY += rotSpeed;

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
      const rotated = rotatePoint(p, rotX, rotY);
      const proj = project(rotated);
      hctx.beginPath();
      hctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
      hctx.fill();
    }

    // Update beam progress.
    const beamSpeed = parseFloat(beamSpeedInput.value) * 0.005;
    beamProgress += beamSpeed;

    // Compute current beam position using spherical coordinates.
    const beamPhi = beamProgress;
    const beamTheta = Math.PI / 2 + 0.2 * Math.sin(beamProgress * 0.5);
    let beamPoint = {
      x: sphereRadius * Math.sin(beamTheta) * Math.cos(beamPhi),
      y: sphereRadius * Math.sin(beamTheta) * Math.sin(beamPhi),
      z: sphereRadius * Math.cos(beamTheta)
    };

    // Rotate beam point with current sphere rotation.
    beamPoint = rotatePoint(beamPoint, rotX, rotY);
    const beam2D = project(beamPoint);

    // Draw the radiant beam as a thick, glowing burst.
    const glowRadius = 14;
    const beamGradient = hctx.createRadialGradient(beam2D.x, beam2D.y, 0, beam2D.x, beam2D.y, glowRadius);
    beamGradient.addColorStop(0, neonColor);
    beamGradient.addColorStop(0.4, neonColor);
    beamGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hctx.fillStyle = beamGradient;
    hctx.beginPath();
    hctx.arc(beam2D.x, beam2D.y, glowRadius, 0, Math.PI * 2);
    hctx.fill();

    // Draw a smooth trail along the sphere's curvature.
    const trailLength = parseInt(trailLengthInput.value);
    hctx.strokeStyle = neonColor;
    hctx.lineWidth = 4;
    hctx.beginPath();
    for (let i = 0; i <= trailLength; i++) {
      const t = beamProgress - i * beamDelta;
      const tPhi = t;
      const tTheta = Math.PI / 2 + 0.2 * Math.sin(t * 0.5);
      let point = {
        x: sphereRadius * Math.sin(tTheta) * Math.cos(tPhi),
        y: sphereRadius * Math.sin(tTheta) * Math.sin(tPhi),
        z: sphereRadius * Math.cos(tTheta)
      };
      point = rotatePoint(point, rotX, rotY);
      const projPoint = project(point);
      if (i === 0) {
        hctx.moveTo(projPoint.x, projPoint.y);
      } else {
        hctx.lineTo(projPoint.x, projPoint.y);
      }
    }
    hctx.stroke();

    requestAnimationFrame(animateHologram);
  }
  animateHologram();

  // Update canvas sizes on window resize.
  window.addEventListener('resize', () => {
    spaceCanvas.width = window.innerWidth;
    spaceCanvas.height = window.innerHeight;
    holoCanvas.width = window.innerWidth;
    holoCanvas.height = window.innerHeight;
  });

  /* ===============================
     TOGGLE CONFIGURATION PANEL
  ================================ */
  const toggleBtn = document.getElementById('toggleConfig');
  const controlsPanel = document.getElementById('controls');
  toggleBtn.addEventListener('click', () => {
    if (controlsPanel.style.display === 'none') {
      controlsPanel.style.display = 'block';
      toggleBtn.textContent = 'Hide Config';
    } else {
      controlsPanel.style.display = 'none';
      toggleBtn.textContent = 'Show Config';
    }
  });
});
