// Mouse-reactive background and glass cards
const root = document.documentElement;
const tiltCards = document.querySelectorAll(".tilt-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetX = mouseX;
let targetY = mouseY;

function updateMousePosition(event) {
  targetX = event.clientX;
  targetY = event.clientY;
}

function animateBackground() {
  mouseX += (targetX - mouseX) * 0.06;
  mouseY += (targetY - mouseY) * 0.06;

  root.style.setProperty("--mouse-x", `${mouseX}px`);
  root.style.setProperty("--mouse-y", `${mouseY}px`);

  if (!prefersReducedMotion) {
    requestAnimationFrame(animateBackground);
  }
}

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", updateMousePosition, { passive: true });
  animateBackground();
}

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;

    card.style.setProperty("--card-x", `${x}px`);
    card.style.setProperty("--card-y", `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-7px) scale(1.015)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

// Scroll reveal animations
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 45, 360)}ms`;
  revealObserver.observe(element);
});

// Fine particle field
const canvas = document.getElementById("particle-canvas");
const context = canvas.getContext("2d");
let particles = [];
let particleFrame;

function resizeCanvas() {
  const density = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * density;
  canvas.height = window.innerHeight * density;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(density, 0, 0, density, 0, 0);

  const count = Math.floor((window.innerWidth * window.innerHeight) / 18000);
  particles = Array.from({ length: Math.max(count, 34) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.25 + 0.25,
    speed: Math.random() * 0.22 + 0.06,
    opacity: Math.random() * 0.42 + 0.12,
  }));
}

function drawParticles() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += Math.sin((particle.y + particle.radius) * 0.01) * 0.06;

    if (particle.y < -8) {
      particle.y = window.innerHeight + 8;
      particle.x = Math.random() * window.innerWidth;
    }

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
    context.fill();
  });

  particleFrame = requestAnimationFrame(drawParticles);
}

resizeCanvas();

if (!prefersReducedMotion) {
  drawParticles();
}

window.addEventListener("resize", () => {
  resizeCanvas();

  if (prefersReducedMotion) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
});

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(particleFrame);
});
