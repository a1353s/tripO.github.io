// === Full-page background scenic video ===
(function () {
  var PLAY_SEC = 5;
  var BASE = 'assets/videos/';
  var video = document.getElementById('bgVideo');
  var root = document.getElementById('bgMedia');
  if (!video || !root) return;

  var currentKey = null;
  var playToken = 0;
  var reduceMotion = false;
  var onTime = null;
  var onLoaded = null;
  var onEnded = null;

  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  function detachVideoListeners() {
    if (onTime) {
      video.removeEventListener('timeupdate', onTime);
      onTime = null;
    }
    if (onLoaded) {
      video.removeEventListener('loadeddata', onLoaded);
      onLoaded = null;
    }
    if (onEnded) {
      video.removeEventListener('ended', onEnded);
      onEnded = null;
    }
  }

  function pauseAtFrame() {
    try { video.pause(); } catch (e) {}
  }

  video.loop = false;
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  function pathFor(key, ext) {
    return BASE + key + '.' + ext;
  }

  function startPlay(token) {
    if (token !== playToken) return;
    try { video.currentTime = 0; } catch (e) {}

    // Loop only the first PLAY_SEC seconds (or full clip if shorter)
    onTime = function () {
      if (token !== playToken) return;
      if (video.currentTime >= PLAY_SEC) {
        try { video.currentTime = 0; } catch (e) {}
      }
    };
    video.addEventListener('timeupdate', onTime);

    onEnded = function () {
      if (token !== playToken) return;
      try { video.currentTime = 0; } catch (e) {}
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    };
    video.addEventListener('ended', onEnded);

    var p = video.play();
    if (p && typeof p.then === 'function') {
      p.catch(function () {
        pauseAtFrame();
      });
    }
  }

  /**
   * Switch full-page background to a location key.
   * Plays the first ~5s on loop. Same key does not restart.
   */
  function setBackgroundLocation(key) {
    if (!key) return;
    if (key === currentKey) return;

    currentKey = key;
    playToken += 1;
    var token = playToken;
    detachVideoListeners();

    var poster = pathFor(key, 'jpg');
    var src = pathFor(key, 'mp4');
    video.setAttribute('poster', poster);
    root.style.backgroundImage = 'url("' + poster + '")';
    root.style.backgroundSize = 'cover';
    root.style.backgroundPosition = 'center';

    if (reduceMotion) {
      video.removeAttribute('src');
      try { video.load(); } catch (e) {}
      return;
    }

    video.onerror = function () {
      if (token !== playToken) return;
      console.warn('[bg-media] failed to load', src);
      pauseAtFrame();
    };

    onLoaded = function () {
      if (token !== playToken) return;
      startPlay(token);
    };
    video.addEventListener('loadeddata', onLoaded);

    if (video.getAttribute('src') === src && video.readyState >= 2) {
      startPlay(token);
    } else {
      video.setAttribute('src', src);
      video.load();
    }
  }

  window.setBackgroundLocation = setBackgroundLocation;
})();
