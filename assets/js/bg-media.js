// === Full-page background scenic motion (animated image, no video player) ===
(function () {
  var BASE = 'assets/videos/';
  var img = document.getElementById('bgImage');
  var root = document.getElementById('bgMedia');
  if (!img || !root) return;

  var currentKey = null;
  var reduceMotion = false;

  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  function pathFor(key, ext) {
    return BASE + key + '.' + ext;
  }

  /**
   * Switch full-page background to a location key.
   * Uses 3s looping WebP/GIF-like motion image — never opens a video player.
   * Same key does not restart.
   */
  function setBackgroundLocation(key) {
    if (!key) return;
    if (key === currentKey) return;
    currentKey = key;

    var still = pathFor(key, 'jpg');
    var motion = pathFor(key, 'webp');

    root.style.backgroundImage = 'url("' + still + '")';
    root.style.backgroundSize = 'cover';
    root.style.backgroundPosition = 'center';

    if (reduceMotion) {
      img.removeAttribute('src');
      img.alt = '';
      img.style.display = 'none';
      return;
    }

    img.style.display = '';
    img.onerror = function () {
      // Fall back to static poster if motion asset missing
      img.removeAttribute('src');
      img.style.display = 'none';
      console.warn('[bg-media] failed to load', motion);
    };
    img.onload = function () {
      img.style.display = '';
    };
    // Cache-bust only when switching keys so GIF/WebP restarts cleanly
    img.src = motion + '?v=' + encodeURIComponent(key);
  }

  window.setBackgroundLocation = setBackgroundLocation;
})();
