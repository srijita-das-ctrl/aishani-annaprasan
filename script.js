const scenes = [...document.querySelectorAll('.scene')];
const dots = document.getElementById('pageDots');
const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const stage = document.getElementById('stage');

let current = 0;
let started = false;
let muted = false;
let fadeTimer = null;

// Assign sequential stagger index to every individual .reveal element per scene
// so every single line, photo frame, and page-end cartoon appears one by one
scenes.forEach((scene, index) => {
  const revealItems = [...scene.querySelectorAll('.reveal')];
  const step = Math.min(0.22, Math.max(0.15, 2.0 / Math.max(revealItems.length, 1)));
  scene.style.setProperty('--stagger', `${step.toFixed(3)}s`);

  revealItems.forEach((item, itemIdx) => {
    item.style.setProperty('--i', itemIdx);
  });

  // Create page indicator dot
  const dot = document.createElement('i');
  if (index === 0) dot.classList.add('active');
  dots.appendChild(dot);
});

const indicators = [...dots.children];

function showScene(index) {
  current = Math.max(0, Math.min(index, scenes.length - 1));

  scenes.forEach((scene, i) => {
    scene.classList.toggle('active', i === current);
  });

  indicators.forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
  });
}

// Background music with gentle fade-in
async function startMusic() {
  if (muted) return;

  music.volume = 0;

  try {
    await music.play();
    musicToggle.classList.add('visible');

    if (fadeTimer) clearInterval(fadeTimer);

    let volume = 0;

    fadeTimer = setInterval(() => {
      if (muted) {
        clearInterval(fadeTimer);
        return;
      }

      volume = Math.min(0.45, volume + 0.025);
      music.volume = volume;

      if (volume >= 0.45) {
        clearInterval(fadeTimer);
      }
    }, 180);

  } catch (error) {
    musicToggle.classList.add('visible');
  }
}

// Start invitation
function begin() {
  if (started) return;

  started = true;
  showScene(1);
  startMusic();
}

function next() {
  if (!started) {
    begin();
    return;
  }

  if (current < scenes.length - 1) {
    showScene(current + 1);
  }
}

function previous() {
  if (started && current > 0) {
    showScene(current - 1);
  }
}

// Subtle golden tap ripple effect
function spawnTapRipple(x, y) {
  const ripple = document.createElement('span');
  ripple.className = 'tap-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  document.body.appendChild(ripple);

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

// Tap left side = previous page
// Tap centre/right side = next page
stage.addEventListener('click', (event) => {
  if (event.target.closest('a, button')) return;

  spawnTapRipple(event.clientX, event.clientY);

  const x = event.clientX;

  if (started && x < window.innerWidth * 0.28) {
    previous();
  } else {
    next();
  }
});

// Touch swipe support for smooth storybook page turns
let touchStartX = 0;
let touchStartY = 0;

stage.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }
}, { passive: true });

stage.addEventListener('touchend', (event) => {
  if (event.target.closest('a, button')) return;
  if (!event.changedTouches.length) return;

  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;

  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
    if (deltaX < 0) {
      next();
    } else {
      previous();
    }
  }
}, { passive: true });

// Keyboard arrow support on desktop
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === ' ') {
    next();
  } else if (event.key === 'ArrowLeft') {
    previous();
  }
});

// Replay invitation
document.getElementById('replayBtn').addEventListener('click', (event) => {
  event.stopPropagation();

  showScene(0);
  started = false;
  muted = false;

  if (fadeTimer) clearInterval(fadeTimer);

  music.pause();
  music.currentTime = 0;
  music.volume = 0;

  musicToggle.classList.remove('visible', 'muted');
});

// Music on/off
musicToggle.addEventListener('click', async (event) => {
  event.stopPropagation();

  muted = !muted;
  musicToggle.classList.toggle('muted', muted);

  if (muted) {
    if (fadeTimer) clearInterval(fadeTimer);
    music.pause();
  } else {
    try {
      await music.play();
      music.volume = 0.45;
    } catch (error) {
      // Browser may require another tap.
    }
  }
});

// WhatsApp RSVP (unchanged message & number)
const message =
  'শুভেচ্ছা। ঐশানী মজুমদারের অন্নপ্রাশন ও প্রীতিভোজে উপস্থিতি জানাচ্ছি। নাম: ';

document.getElementById('rsvpLink').href =
  'https://wa.me/918981464594?text=' + encodeURIComponent(message);

// Falling decorative marigold & jasmine petals
const petals = document.getElementById('petals');

for (let i = 0; i < 16; i++) {
  const petal = document.createElement('span');

  petal.className = i % 3 === 0 ? 'petal jasmine' : 'petal';
  petal.style.left = Math.random() * 100 + 'vw';
  petal.style.animationDuration = 9 + Math.random() * 9 + 's';
  petal.style.animationDelay = -Math.random() * 14 + 's';
  petal.style.opacity = (0.35 + Math.random() * 0.42).toFixed(2);

  petals.appendChild(petal);
}

// Show a placeholder if a photo file is missing
document.querySelectorAll('img').forEach((img) => {
  img.addEventListener('error', () => {
    img.style.display = 'none';

    const placeholder = img.nextElementSibling;
    if (placeholder) placeholder.style.display = 'grid';
  });
});