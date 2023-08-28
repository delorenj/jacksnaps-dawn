const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';

// Scroll in animation logic
function onIntersection(elements, observer) {
  elements.forEach((element, index) => {
    if (element.isIntersecting) {
      const elementTarget = element.target;
      if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        if (elementTarget.hasAttribute('data-cascade'))
          elementTarget.setAttribute('style', `--animation-order: ${index};`);
      }
      observer.unobserve(elementTarget);
    } else {
      element.target.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
      element.target.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
    }
  });
}

function initializeScrollAnimationTrigger(rootEl = document, isDesignModeEvent = false) {
  const animationTriggerElements = Array.from(rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
  if (animationTriggerElements.length === 0) return;

  if (isDesignModeEvent) {
    animationTriggerElements.forEach((element) => {
      element.classList.add('scroll-trigger--design-mode');
    });
    return;
  }

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -50px 0px',
  });
  animationTriggerElements.forEach((element) => observer.observe(element));
}

// Zoom in animation logic
function initializeScrollZoomAnimationTrigger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animationTriggerElements = Array.from(document.getElementsByClassName(SCROLL_ZOOM_IN_TRIGGER_CLASSNAME));

  if (animationTriggerElements.length === 0) return;

  const scaleAmount = 0.2 / 100;

  animationTriggerElements.forEach((element) => {
    let elementIsVisible = false;
    const observer = new IntersectionObserver((elements) => {
      elements.forEach((entry) => {
        elementIsVisible = entry.isIntersecting;
      });
    });
    observer.observe(element);

    element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));

    window.addEventListener(
      'scroll',
      throttle(() => {
        if (!elementIsVisible) return;

        element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
      }),
      { passive: true }
    );
  });
}

function percentageSeen(element) {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;
  const elementPositionY = element.getBoundingClientRect().top + scrollY;
  const elementHeight = element.offsetHeight;

  if (elementPositionY > scrollY + viewportHeight) {
    // If we haven't reached the image yet
    return 0;
  } else if (elementPositionY + elementHeight < scrollY) {
    // If we've completely scrolled past the image
    return 100;
  }

  // When the image is in the viewport
  const distance = scrollY + viewportHeight - elementPositionY;
  let percentage = distance / ((viewportHeight + elementHeight) / 100);
  return Math.round(percentage);
}

function initializeWalrusBowls() {
  const walrusBowlElement = document.getElementById('walrus-bowls');
  const imageBannerElement = document.getElementsByClassName('banner')[0];
  let bannerHeight = imageBannerElement.offsetHeight;
  const walrusLeftPosition = walrusBowlElement.offsetLeft - walrusBowlElement.width/2
  const viewportHeight = window.innerHeight;
  const leftEye = document.getElementById('left-eye');
  const rightEye = document.getElementById('right-eye');
  const leftEyeXW = 0.342352291551629;
  const leftEyeYH = 0.122735674676525;
  const rightEyeXW = 0.775041413583655;
  const rightEyeYH = 0.143900184842884;
  const leftEyeXOffset = leftEyeXW * walrusBowlElement.offsetWidth;
  const leftEyeYOffset = leftEyeYH * walrusBowlElement.offsetHeight;
  const rightEyeXOffset = rightEyeXW * walrusBowlElement.offsetWidth;
  const rightEyeYOffset = rightEyeYH * walrusBowlElement.offsetHeight;
  const eyeScaleFactor = 0.020982882385422; // imgWidth * eyeScaleFactor = eyeSize
  // Limit bannerHeight to max of viewportHeight
  bannerHeight = Math.min(bannerHeight, viewportHeight-150);

  walrusBowlElement.style.top = bannerHeight + 'px';

  // Position eyes
  leftEye.style.top = bannerHeight + leftEyeYOffset - 19 + 'px';
  leftEye.style.left = walrusLeftPosition + leftEyeXOffset  - 19 + 'px';

  rightEye.style.top = bannerHeight + rightEyeYOffset - 19 + 'px';
  rightEye.style.left = walrusLeftPosition + rightEyeXOffset - 19 + 'px';

  // Scale eyes
  const scaleFactor = walrusBowlElement.width * eyeScaleFactor
  leftEye.transform = 'scale(' + eyeScaleFactor + ')';
  leftEye.style.height = walrusBowlElement.width * eyeScaleFactor + 'px';
  rightEye.style.width = walrusBowlElement.width * eyeScaleFactor + 'px';
  rightEye.style.height = walrusBowlElement.width * eyeScaleFactor + 'px';


}

window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
  initializeScrollZoomAnimationTrigger();
  initializeWalrusBowls();
});

// Add event listeners for window resize
window.addEventListener('resize', () => {
  initializeWalrusBowls();
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => initializeScrollAnimationTrigger(event.target, true));
  document.addEventListener('shopify:section:reorder', () => initializeScrollAnimationTrigger(document, true));
}
