const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';
const shark = document.getElementById('jaggle-shark');
const leftEye = document.getElementById('left-eye');
const rightEye = document.getElementById('right-eye');
const leftPupil = leftEye.querySelector('.pupil');
const rightPupil = rightEye.querySelector('.pupil');
const RADIAN = Math.PI / 180;
const ATAN = 180 / Math.PI;
let cursorMoving = false;
let cursorX = 0;
let cursorY = 0;

const handleMouseMove = (event) => {

  clearTimeout(timeout);

  timeout = setTimeout((event) => {
    cursorMoving = true;
    cursorX = event.clientX;
    cursorY = event.clientY;
  }, 100);

};

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
    rootMargin: '0px 0px -50px 0px'
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
  const walrusLeftPosition = walrusBowlElement.offsetLeft - walrusBowlElement.width / 2;
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
  const nativeImageWidth = 1811; // px
  const nativeEyeWidth = 50; // px
  const eyeScaleFactor = (nativeEyeWidth / nativeImageWidth).toFixed(4);
  const halfNativeEyeWidth = nativeEyeWidth / 2;
  // Limit bannerHeight to max of viewportHeight
  bannerHeight = Math.min(bannerHeight, viewportHeight - 150);

  walrusBowlElement.style.top = bannerHeight + 'px';

  // Position eyes
  leftEye.style.top = bannerHeight + leftEyeYOffset - halfNativeEyeWidth + 'px';
  leftEye.style.left = walrusLeftPosition + leftEyeXOffset - halfNativeEyeWidth + 'px';
  rightEye.style.top = bannerHeight + rightEyeYOffset - halfNativeEyeWidth + 'px';
  rightEye.style.left = walrusLeftPosition + rightEyeXOffset - halfNativeEyeWidth + 'px';

  // Scale eyes
  const scaleFactor = walrusBowlElement.width * eyeScaleFactor;
  const eyeScale = (scaleFactor / nativeEyeWidth).toFixed(4);
  const scaleExp = 'scale(' + eyeScale + ')';
  leftEye.style.transform = scaleExp;
  rightEye.style.transform = scaleExp;
}

function getAngleToCursor(eye) {

  // Get eye coordinates
  const eyeX = eye.offsetLeft + eye.offsetWidth / 2;
  const eyeY = eye.offsetTop + eye.offsetHeight / 2;

  // Calculate angle
  return Math.atan2(cursorY - eyeY, cursorX - eyeX) * ATAN;
}

function trackJaggleShark() {
  //console.log(shark.offsetLeft + 'px');
  // Get shark coordinates
  const sharkX = shark.offsetLeft + shark.offsetWidth / 2;
  const sharkY = shark.offsetTop + shark.offsetHeight / 2;

  // Get eyes coordinates
  const leftEyeX = leftEye.offsetLeft + leftEye.offsetWidth / 2;
  const leftEyeY = leftEye.offsetTop + leftEye.offsetHeight / 2;

  const rightEyeX = rightEye.offsetLeft + rightEye.offsetWidth / 2;
  const rightEyeY = rightEye.offsetTop + rightEye.offsetHeight / 2;

  let leftAngle, rightAngle;
  // Calculate angles
  if (cursorMoving) {
    //Look at cursor instead of Jaggle Shark
    leftAngle = getAngleToCursor(leftEye);
    rightAngle = getAngleToCursor(rightEye);

  } else {
    leftAngle = Math.atan2(sharkY - leftEyeY, sharkX - leftEyeX) * ATAN;
    rightAngle = Math.atan2(sharkY - rightEyeY, sharkX - rightEyeX) * ATAN;
  }
  // Convert angle to radians
  const leftRadAngle = leftAngle * RADIAN;

  // Get x and y coords from sine and cosine
  const lx = Math.cos(leftRadAngle);
  const ly = Math.sin(leftRadAngle);

  // Map range -1 to 1
  const lxPercent = (lx + 1) / 2 * 100;
  const lyPercent = (ly + 1) / 2 * 100;

  // Set position
  leftPupil.style.left = lxPercent + '%';
  leftPupil.style.top = lyPercent + '%';

  const rightRadAngle = rightAngle * RADIAN;

  // Get x and y coords from sine and cosine
  const rx = Math.cos(rightRadAngle);
  const ry = Math.sin(rightRadAngle);

  // Map range -1 to 1
  const rxPercent = (rx + 1) / 2 * 100;
  const ryPercent = (ry + 1) / 2 * 100;

  // Set position
  rightPupil.style.left = rxPercent + '%';
  rightPupil.style.top = ryPercent + '%';
}

window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
  initializeScrollZoomAnimationTrigger();
  initializeWalrusBowls();
  setInterval(trackJaggleShark, 100);
});

// Add event listeners for window resize
window.addEventListener('resize', () => {
  initializeWalrusBowls();
});

document.addEventListener('mousemove', (event) => {
  cursorMoving = true;
  cursorX = event.clientX;
  cursorY = event.clientY;
});

document.addEventListener('mousestop', () => {
  cursorMoving = false;
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => initializeScrollAnimationTrigger(event.target, true));
  document.addEventListener('shopify:section:reorder', () => initializeScrollAnimationTrigger(document, true));
}
