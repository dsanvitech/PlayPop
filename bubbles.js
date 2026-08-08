(function () {
  const COLORS = ['#FF3EA5', '#3EC6FF', '#FFD23E', '#7B5EFF', '#3EFFC0'];
  const field = document.getElementById('bubbleField');
  const counterEl = document.getElementById('popCount');
  const BUBBLE_COUNT = window.innerWidth < 640 ? 9 : 16;

  let popCount = parseInt(localStorage.getItem('playpop-pops') || '0', 10);
  updateCounter();

  function updateCounter() {
    counterEl.textContent = popCount;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function spawnBubble() {
    const b = document.createElement('div');
    b.className = 'bg-bubble';

    const size = rand(24, 68);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const top = rand(0, 100);
    const left = rand(0, 100);
    const duration = rand(3.5, 7);
    const opacity = rand(0.35, 0.85);

    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.top = top + '%';
    b.style.left = left + '%';
    b.style.background = `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), ${color})`;
    b.style.opacity = opacity;
    b.style.animationDuration = duration + 's';

    b.addEventListener('click', (e) => pop(b, e.clientX, e.clientY, color));
    field.appendChild(b);
  }

  function pop(bubble, x, y, color) {
    const rect = bubble.getBoundingClientRect();
    const cx = x || rect.left + rect.width / 2;
    const cy = y || rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = rand(4, 9);
      const angle = (i / 8) * Math.PI * 2 + rand(-0.3, 0.3);
      const dist = rand(30, 70);
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = color;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 520);
    }

    bubble.remove();
    popCount++;
    localStorage.setItem('playpop-pops', String(popCount));
    updateCounter();

    setTimeout(spawnBubble, rand(200, 900));
  }

  for (let i = 0; i < BUBBLE_COUNT; i++) spawnBubble();
})();
