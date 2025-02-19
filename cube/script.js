/*
  Spectacular 3D Neon Cube Fluid Animation with Matrix Background & Rolling Movement
  -------------------------------------------------------------------------------------
  This script implements:
    - A Matrix rain effect in the background.
    - A 3D cube with a neon liquid interior that moves around the screen.
    - Multiple movement modes (linear, circular, random, and rolling).
    - A dynamic neon color effect (fixed or cycling) controlled via a UI.
*/

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  /* ----- MATRIX BACKGROUND EFFECT ----- */
  const matrixCanvas = document.getElementById('matrix');
  const mctx = matrixCanvas.getContext('2d');
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  const fontSize = 16;
  const columns = matrixCanvas.width / fontSize;
  const drops = Array.from({ length: columns }).fill(1);

  function drawMatrix() {
    mctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    mctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    mctx.fillStyle = '#0F0';
    mctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = String.fromCharCode(0x30A0 + Math.random() * 96);
      mctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975)
        drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* ----- CUBE MOVEMENT & NEON LIQUID LOGIC ----- */
  const scene = document.getElementById('scene');
  const movementType = document.getElementById('movementType');
  const speedInput = document.getElementById('speed');
  const neonColorSelect = document.getElementById('neonColor');
  const liquid = document.getElementById('liquid');
  const cube = document.getElementById('cube');

  // Cube dimensions (200px x 200px)
  let posX = 100, posY = 100;
  let vx = 2, vy = 2;
  let randomTimer = 0;
  let circularAngle = 0;
  let circleCenterX = window.innerWidth / 2;
  let circleCenterY = window.innerHeight / 2;
  let circleRadius = Math.min(window.innerWidth, window.innerHeight) / 3;
  let hue = 0;
  let rollAngle = 0; // For rolling movement

  // Update cube position based on movement type
  function updateCubePosition() {
    const type = movementType.value;
    const speed = parseFloat(speedInput.value);

    if (type === 'linear' || type === 'rolling') {
      // Use linear bouncing movement
      posX += vx * speed;
      posY += vy * speed;
      if (posX <= 0 || posX + 200 >= window.innerWidth) {
        vx = -vx;
        posX = Math.max(0, Math.min(posX, window.innerWidth - 200));
      }
      if (posY <= 0 || posY + 200 >= window.innerHeight) {
        vy = -vy;
        posY = Math.max(0, Math.min(posY, window.innerHeight - 200));
      }
      scene.style.left = posX + 'px';
      scene.style.top = posY + 'px';

      // If rolling, update cube's internal rotation (simulate rolling on its axis)
      if (type === 'rolling') {
        // Increase rollAngle based on movement speed (adjust factor as needed)
        rollAngle += speed * 5;
        cube.style.transform = `rotateX(${rollAngle}deg)`;
      } else {
        // For standard linear movement, reset cube rotation
        cube.style.transform = '';
      }
    } else if (type === 'circular') {
      // Circular movement around screen center
      circularAngle += 0.02 * speed;
      const x = circleCenterX + circleRadius * Math.cos(circularAngle) - 100;
      const y = circleCenterY + circleRadius * Math.sin(circularAngle) - 100;
      scene.style.left = x + 'px';
      scene.style.top = y + 'px';
      cube.style.transform = ''; // No extra roll in circular mode
    } else if (type === 'random') {
      // Random movement with occasional direction changes
      posX += vx * speed;
      posY += vy * speed;
      randomTimer++;
      if (randomTimer > 60) {
        vx = (Math.random() * 4 - 2);
        vy = (Math.random() * 4 - 2);
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
      scene.style.left = posX + 'px';
      scene.style.top = posY + 'px';
      cube.style.transform = ''; // No extra roll in random mode
    }
  }

  // Update the neon liquid color (cycle or fixed)
  function updateNeonColor() {
    const selectedColor = neonColorSelect.value;
    if (selectedColor === 'cycle') {
      hue = (hue + 1) % 360;
      liquid.style.setProperty('--liquid-color', 'hsl(' + hue + ', 100%, 50%)');
    } else {
      liquid.style.setProperty('--liquid-color', selectedColor);
    }
  }

  // Main animation loop
  function animateCube() {
    updateCubePosition();
    updateNeonColor();
    requestAnimationFrame(animateCube);
  }
  animateCube();

  // Update parameters on window resize
  window.addEventListener('resize', () => {
    circleCenterX = window.innerWidth / 2;
    circleCenterY = window.innerHeight / 2;
    circleRadius = Math.min(window.innerWidth, window.innerHeight) / 3;
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  });
});
