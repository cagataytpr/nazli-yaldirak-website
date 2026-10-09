const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Menüyü aç');
  nav.classList.remove('open');
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 801px)').addEventListener('change', () => closeMenu());
document.querySelector('#year').textContent = new Date().getFullYear();

// Use one predictable animation for all in-page navigation links.
let scrollFrame;
// Animated navigation explicitly requested for this site.
function stopScroll() {
  cancelAnimationFrame(scrollFrame);
  document.documentElement.classList.remove('scroll-animating');
}
['wheel', 'touchstart', 'pointerdown'].forEach(type => {
  window.addEventListener(type, stopScroll, { passive: true });
});
document.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape'].includes(event.key)) stopScroll();
});
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    const target = document.getElementById(hash.slice(1));
    if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    closeMenu();
    stopScroll();
    const start = window.scrollY;
    const headerHeight = document.querySelector('.header').getBoundingClientRect().height;
    const destination = Math.max(0, Math.min(
      target.getBoundingClientRect().top + start - headerHeight - 24,
      document.documentElement.scrollHeight - window.innerHeight
    ));
    history.pushState(null, '', hash);
    document.documentElement.classList.add('scroll-animating');
    const finish = () => {
      window.scrollTo(0, destination);
      document.documentElement.classList.remove('scroll-animating');
      // Keep keyboard navigation at the destination, without moving the page again.
      const temporaryTabIndex = !target.hasAttribute('tabindex');
      if (temporaryTabIndex) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (temporaryTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    };
    if (Math.abs(destination - start) < 2) {
      finish();
      return;
    }
    const duration = Math.min(1100, Math.max(650, Math.abs(destination - start) * 0.3));
    const started = performance.now();
    function animate(now) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - ((-2 * progress + 2) ** 3) / 2;
      window.scrollTo(0, start + (destination - start) * eased);
      if (progress < 1) scrollFrame = requestAnimationFrame(animate);
      else finish();
    }
    scrollFrame = requestAnimationFrame(animate);
  });
});

