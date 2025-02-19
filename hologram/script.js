/*
  Spectacular 3D Neon Hologram Cube Animation with Matrix Background
  ---------------------------------------------------------------------
  This script implements:
    - A Matrix rain effect in the background with configurable falling speed.
    - A 3D wireframe hologram cube (no interior fill) with neon outlines.
    - True 3D movement of the hologram across the screen (including z-axis movement).
    - Multiple movement modes (3D Linear, Circular, Random, and Rolling).
    - A control panel to configure movement speed, hologram color (or cycle), and Matrix speed.
*/

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  /* ----- MATRIX BACKGROUND SETUP ----- */
  const matrixCanvas = document.getElementById('matrix');
  const mctx = matrixCanvas.getContext('2d');
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  
  const fontSize = 16;
  const columns = Math.floor(matrixCanvas.width / fontSize);
  const drops = Array.from({ length: columns }).fill(1);
  let matrixSpeed = parseFloat(document.getElementById('matrixSpeed').value);

  function drawMatrix() {
    // Faintly fade the background to create trailing effect
    mctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    mctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    mctx.fillStyle = '#0F0'; // Neon green for Matrix characters
    mctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = String.fromCharCode(0x30A0 + Math.random() * 96);
      mctx.fillText(text, i * fontSize, drops[i] * fontSize);
      // Reset drop occasionally to create a rain effect
      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += matrixSpeed * 0.1; // Use matrixSpeed to control falling speed
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  // Update matrixSpeed when control is changed
  document.getElementById('matrixSpeed').addEventListener('input', (e) => {
    matrixSpeed = parseFloat(e.target.value);
  });

  /* ----- HOLOGRAM CUBE MOVEMENT & COLOR LOGIC ----- */
  const scene = document.getElementById('scene');
  const movementTypeSelect = document.getElementById('movementType');
  const speedInput = document.getElementById('speed');
  const neonColorSelect = document.getElementById('neonColor');
  const cube = document.getElementById('cube');

  // 3D Position Variables for the scene (cube container)
  let posX = 100, posY = 100, posZ = 0;
  let vx = 2, vy = 2, vz = 1.5;
  let randomTimer = 0;
  let circularAngle = 0;
  let circleCenterX = window.innerWidth / 2;
  let circleCenterY = window.innerHeight / 2;
  let circleRadius = Math.min(window.innerWidth, window.innerHeight) / 4;
  let hue = 0;
  let rollAngle = 0; // For rolling movement

  // Update the hologram's position and rotation based on the movement type
  function updateCubePosition() {
    const type = movementTypeSelect.value;
    const speed = parseFloat(speedInput.value);

    if (type === 'linear' || type === 'rolling') {
      // 3D Linear movement with bouncing on all axes
      posX += vx * speed;
      posY += vy * speed;
      posZ += vz * speed;

      // Bounce horizontally
      if (posX <= 0 || posX + 200 >= window.innerWidth) {
        vx = -vx;
        posX = Math.max(0, Math.min(posX, window.innerWidth - 200));
      }
      // Bounce vertically
      if (posY <= 0 || posY + 200 >= window.innerHeight) {
        vy = -vy;
        posY = Math.max(0, Math.min(posY, window.innerHeight - 200));
      }
      // Bounce on z-axis (simulate moving closer/farther within limits, e.g., -200 to 200)
      if (posZ <= -200 || posZ >= 200) {
        vz = -vz;
        posZ = Math.max(-200, Math.min(posZ, 200));
      }
      // Apply 3D transform using translate3d
      scene.style.transform = `translate3d(${posX}px, ${posY}px, ${posZ}px)`;

      // If rolling, add rotation about the X-axis to simulate rolling motion
      if (type === 'rolling') {
        rollAngle += speed * 5;
        cube.style.transform = `rotateX(${rollAngle}deg)`;
      } else {
        // Reset cube's internal rotation in non-rolling modes
        cube.style.transform = '';
      }
    } else if (type === 'circular') {
      // 3D Circular movement: Orbit around screen center with an oscillating z-axis
      circularAngle += 0.02 * speed;
      const x = circleCenterX + circleRadius * Math.cos(circularAngle) - 100;
      const y = circleCenterY + circleRadius * Math.sin(circularAngle) - 100;
      // Oscillate z-axis as well
      const z = 100 * Math.sin(circularAngle * 0.5);
      scene.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
      cube.style.transform = '';
    } else if (type === 'random') {
      // 3D Random movement with occasional changes in direction (for x, y, and z)
      posX += vx * speed;
      posY += vy * speed;
      posZ += vz * speed;
      randomTimer++;
      if (randomTimer > 60) {
        vx = (Math.random() * 4 - 2);
        vy = (Math.random() * 4 - 2);
        vz = (Math.random() * 3 - 1.5);
        randomTimer = 0;
      }
      if (posX <= 0 || posX + 200 >= window.innerWidth) {
        vx = -vx;
        posX = Math.max(0, Math.min(posX, window.innerWidth - 200));
      }
      if (posY <= 0 || posY + 200 >= window.innerHeight) {
        vy = -vy;
        posY = Math.max(0, Math.min(posY, window.innerHeight - 200));
      }
      if (posZ <= -200 || posZ >= 200) {
        vz = -vz;
        posZ = Math.max(-200, Math.min(posZ, 200));
      }
      scene.style.transform = `translate3d(${posX}px, ${posY}px, ${posZ}px)`;
      cube.style.transform = '';
    }
  }

  // Update the hologram's neon line color.
  // If 'cycle' is selected, the color continuously shifts through hues.
  function updateNeonColor() {
    const selectedColor = neonColorSelect.value;
    if (selectedColor === 'cycle') {
      hue = (hue + 1) % 360;
      document.documentElement.style.setProperty('--holo-color', 'hsl(' + hue + ', 100%, 50%)');
    } else {
      document.documentElement.style.setProperty('--holo-color', selectedColor);
    }
  }

  // Main animation loop: updates cube position and neon color continuously.
  function animateCube() {
    updateCubePosition();
    updateNeonColor();
    requestAnimationFrame(animateCube);
  }
  animateCube();

  // Update circular movement center when window resizes.
  window.addEventListener('resize', () => {
    circleCenterX = window.innerWidth / 2;
    circleCenterY = window.innerHeight / 2;
    circleRadius = Math.min(window.innerWidth, window.innerHeight) / 4;
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  });
});
