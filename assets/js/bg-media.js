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

  function pathFor(key, ext) {
    return BASE + key + '.' + ext;
  }

  /**
   * Switch full-page background to a location key.
   * Uses ~3s looping WebP — never opens a video player.
   * Same key does not restart.
   */
  function setBackgroundLocation(key) {
    if (!key) return;
    if (key === currentKey) return;
    currentKey = key;

    var token = ++loadToken;
    var still = pathFor(key, 'jpg');
    var motion = pathFor(key, 'webp');

    // Instant still while motion asset loads
    root.style.backgroundImage = 'url("' + still + '")';
    root.style.backgroundSize = 'cover';
    root.style.backgroundPosition = 'center';

    if (reduceMotion) {
      img.removeAttribute('src');
      img.style.visibility = 'hidden';
      return;
    }

    // Drop previous motion frame immediately so day switches are visible
    img.style.visibility = 'hidden';
    img.removeAttribute('src');

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
