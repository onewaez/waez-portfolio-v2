const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 760px), (hover: none) and (pointer: coarse)');
const motionPreferenceKey = 'waez-motion-paused';
const mobileMotionPreferenceKey = 'waez-mobile-motion-enabled';

function openProjectFromHash() {
  let id: string;
  try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
  if (!id) return;
  const project = document.getElementById(id);
  if (!project?.matches('[data-project]')) return;
  const details = project.querySelector('details');
  if (details) details.open = true;
  requestAnimationFrame(() => project.scrollIntoView({ block: 'start', behavior: 'instant' }));
}

openProjectFromHash();
window.addEventListener('hashchange', openProjectFromHash);

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    if (link.hash === window.location.hash) openProjectFromHash();
  });
});

document.querySelectorAll<HTMLButtonElement>('.close-project').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => {
    const details = button.closest('details');
    if (!details) return;
    const summary = details.querySelector('summary');
    details.open = false;
    summary?.focus({ preventScroll: true });
    summary?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
});

const root = document.documentElement;
const scenes = [...document.querySelectorAll<HTMLElement>('[data-scroll-scene]')].map(element => ({
  element,
  layers: [...element.querySelectorAll<HTMLElement>('[data-scene-layer]')],
  rabbits: [...element.querySelectorAll<HTMLElement>('[data-garden-rabbit]')].map(rabbit => ({
    element: rabbit,
    arrivalDistance: Number(rabbit.dataset.arriveDistance) || 0,
  })),
}));
const motionToggles = [...document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]')];
function readMotionPreference() {
  try {
    return mobileQuery.matches
      ? localStorage.getItem(mobileMotionPreferenceKey) !== 'true'
      : localStorage.getItem(motionPreferenceKey) === 'true';
  } catch { return mobileQuery.matches; }
}
let manuallyPaused = readMotionPreference();
let scheduled = false;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
function updateScenes() {
  const enabled = !motionQuery.matches && !manuallyPaused;
  const viewportHeight = window.innerHeight;
  const scrollableHeight = document.documentElement.scrollHeight - viewportHeight;
  root.style.setProperty('--page-progress', String(scrollableHeight > 0 ? clamp(window.scrollY / scrollableHeight) : 0));
  if (mobileQuery.matches) {
    scheduled = false;
    return;
  }
  for (const scene of scenes) {
    const rect = scene.element.getBoundingClientRect();
    if (enabled && (rect.top > viewportHeight + 150 || rect.bottom < -150)) continue;
    const progress = scene.element.dataset.scrollScene === 'sky'
      ? clamp(-rect.top / (rect.height * .8))
      : clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
    const strength = enabled ? 1 : 0;
    scene.element.style.setProperty('--copy-offset', `${-progress * 35 * strength}px`);
    for (const layer of scene.layers) {
      const depth = Number(layer.dataset.depth);
      const side = Number(layer.dataset.side);
      layer.style.setProperty('--scroll-x', `${progress * side * depth * 190 * strength}px`);
      layer.style.setProperty('--scroll-y', `${-progress * depth * 210 * strength}px`);
      layer.style.setProperty('--scroll-turn', `${progress * side * depth * 4 * strength}deg`);
    }
    for (const rabbit of scene.rabbits) {
      const arrival = enabled ? (1 - clamp(progress * 2.8)) * rabbit.arrivalDistance : 0;
      rabbit.element.style.setProperty('--rabbit-arrival', `${arrival}px`);
    }
  }
  scheduled = false;
}
function scheduleScenes() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateScenes); }
}
function syncMotionPreference() {
  const paused = motionQuery.matches || manuallyPaused;
  root.dataset.motion = paused ? 'paused' : 'active';
  for (const motionToggle of motionToggles) {
    motionToggle.hidden = false;
    motionToggle.disabled = motionQuery.matches;
    const label = motionQuery.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
    const labelElement = motionToggle.querySelector('[data-motion-label]');
    if (labelElement) labelElement.textContent = label;
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.setAttribute('aria-label', motionQuery.matches ? 'Animations reduced by your system preference' : paused ? 'Resume decorative animations' : 'Pause decorative animations');
    motionToggle.title = motionQuery.matches ? 'Follows your system reduced motion preference' : label;
  }
  updateScenes();
}
motionToggles.forEach(button => button.addEventListener('click', () => {
  manuallyPaused = !manuallyPaused;
  try {
    localStorage.setItem(mobileQuery.matches ? mobileMotionPreferenceKey : motionPreferenceKey, String(mobileQuery.matches ? !manuallyPaused : manuallyPaused));
  } catch { /* Storage is optional. */ }
  syncMotionPreference();
}));
root.classList.add('has-motion');
syncMotionPreference();
window.addEventListener('scroll', scheduleScenes, { passive: true });
window.addEventListener('resize', scheduleScenes, { passive: true });
motionQuery.addEventListener('change', syncMotionPreference);
mobileQuery.addEventListener('change', () => {
  manuallyPaused = readMotionPreference();
  syncMotionPreference();
});
new ResizeObserver(scheduleScenes).observe(document.body);

const sceneObserver = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.classList.toggle('scene-is-visible', entry.isIntersecting);
}, { rootMargin: '100px' });
scenes.forEach(scene => sceneObserver.observe(scene.element));

const ambientObserver = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.classList.toggle('is-ambient-visible', entry.isIntersecting);
}, { rootMargin: '60px' });
document.querySelectorAll('.index-cloud, .chapter-margin-cloud, .about-background-cloud, .about-cloud, .contact-cloud, .contact-cloud-small').forEach(element => {
  element.classList.add('ambient-illustration');
  ambientObserver.observe(element);
});
const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in-view');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: .06, rootMargin: '0px 0px -4% 0px' });
document.querySelectorAll('[data-scroll-reveal]').forEach(element => revealObserver.observe(element));

let printState: boolean[] = [];
window.addEventListener('beforeprint', () => {
  root.dataset.motion = 'paused';
  const details = [...document.querySelectorAll('details')];
  printState = details.map(item => item.open);
  details.forEach(item => { item.open = true; });
});
window.addEventListener('afterprint', () => {
  document.querySelectorAll('details').forEach((item, i) => { item.open = printState[i] ?? false; });
  syncMotionPreference();
});
