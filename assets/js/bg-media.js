// === Full-page background scenic motion (animated image, no video player) ===
(function () {
  // Resolve against this script URL so GitHub project pages work
  // with or without a trailing slash in the page URL.
  var BASE = (function () {
    var el = document.querySelector('script[src*="bg-media.js"]');
    if (el && el.src) {
      return el.src.replace(/assets\/js\/bg-media\.js(?:\?.*)?$/i, 'assets/videos/');
    }
    var path = location.pathname || '/';
    if (/\/index\.html$/i.test(path)) {
      return path.replace(/index\.html$/i, 'assets/videos/');
    }
    if (path.slice(-1) === '/') {
      return path + 'assets/videos/';
    }
    return path + '/assets/videos/';
  })();

  var img = document.getElementById('bgImage');
  var root = document.getElementById('bgMedia');
  if (!img || !root) return;

  var currentKey = null;
  var loadToken = 0;
  var reduceMotion = false;

  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  // Keep fixed layer aligned to the *visual* viewport on mobile browsers
  // (address bar / toolbar otherwise leaves a gap at the bottom while scrolling).
  function syncViewportCover() {
    var vv = window.visualViewport;
    var height = vv && vv.height ? vv.height : window.innerHeight;
    var top = vv && typeof vv.offsetTop === 'number' ? vv.offsetTop : 0;
    // Slightly oversize to hide sub-pixel / safe-area gaps
    var cover = Math.ceil(height + 2);
    document.documentElement.style.setProperty('--app-height', cover + 'px');
    root.style.top = top + 'px';
    root.style.height = cover + 'px';
  }

  syncViewportCover();
  window.addEventListener('resize', syncViewportCover);
  window.addEventListener('orientationchange', function () {
    setTimeout(syncViewportCover, 50);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewportCover);
    window.visualViewport.addEventListener('scroll', syncViewportCover);
  }
  function pathFor(key, ext) {
    return BASE + key + '.' + ext;
  }

  /**
   * Switch full-page background to a location key.
   * Clear old motion → show still instantly → load looping WebP.
   * Same key does not restart.
   */
  function setBackgroundLocation(key) {
    if (!key) return;
    if (key === currentKey) return;
    currentKey = key;

    var token = ++loadToken;
    var still = pathFor(key, 'jpg');
    var motion = pathFor(key, 'webp');

    // 1) Clear old motion frame
    img.style.visibility = 'hidden';
    img.removeAttribute('src');

    // 2) Instant still
    root.style.backgroundImage = 'url("' + still + '")';
    root.style.backgroundSize = 'cover';
    root.style.backgroundPosition = 'center';

    if (reduceMotion) {
      return;
    }

    // 3) Load new motion on top of still
    img.onload = function () {
      if (token !== loadToken) return;
      img.style.visibility = 'visible';
    };
    img.onerror = function () {
      if (token !== loadToken) return;
      img.removeAttribute('src');
      img.style.visibility = 'hidden';
      console.warn('[bg-media] failed to load', motion);
    };

    img.src = motion + '?v=' + encodeURIComponent(key) + '&t=' + Date.now();
  }

  window.setBackgroundLocation = setBackgroundLocation;
})();
