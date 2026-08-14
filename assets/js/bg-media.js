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

  var CACHE_NAME = 'tripo-bg-v1';
  var LOCATION_KEYS = ['yangshuo', 'longji', 'guilin', 'beihai'];

  var img = document.getElementById('bgImage');
  var root = document.getElementById('bgMedia');
  if (!img || !root) return;

  var currentKey = null;
  var loadToken = 0;
  var reduceMotion = false;
  // url -> objectURL (reuse across switches; avoid re-download)
  var blobUrlMap = {};
  var inflight = {};

  try {
    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  // Keep fixed layer aligned to the *visual* viewport on mobile browsers
  function syncViewportCover() {
    var vv = window.visualViewport;
    var height = vv && vv.height ? vv.height : window.innerHeight;
    var top = vv && typeof vv.offsetTop === 'number' ? vv.offsetTop : 0;
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

  function supportsCache() {
    return typeof caches !== 'undefined' && typeof fetch === 'function';
  }

  /**
   * Resolve an asset URL to a local blob: URL via Cache API when possible.
   * First visit: network fetch → store in Cache Storage → blob URL.
   * Later visits / switches: read from Cache Storage first (no re-download).
   */
  function resolveLocalUrl(url) {
    if (blobUrlMap[url]) {
      return Promise.resolve(blobUrlMap[url]);
    }
    if (inflight[url]) return inflight[url];

    inflight[url] = (supportsCache()
      ? caches.open(CACHE_NAME).then(function (cache) {
          return cache.match(url).then(function (hit) {
            if (hit) return hit;
            return fetch(url, { credentials: 'same-origin', cache: 'force-cache' }).then(function (res) {
              if (!res || !res.ok) throw new Error('fetch failed ' + url);
              cache.put(url, res.clone());
              return res;
            }).catch(function () {
              // force-cache miss / opaque failure → normal fetch then cache
              return fetch(url, { credentials: 'same-origin' }).then(function (res) {
                if (!res || !res.ok) throw new Error('fetch failed ' + url);
                cache.put(url, res.clone());
                return res;
              });
            });
          });
        })
      : fetch(url, { credentials: 'same-origin', cache: 'force-cache' })
    )
      .then(function (res) {
        return res.blob();
      })
      .then(function (blob) {
        var obj = URL.createObjectURL(blob);
        blobUrlMap[url] = obj;
        delete inflight[url];
        return obj;
      })
      .catch(function (err) {
        delete inflight[url];
        // Fallback: use original URL (browser HTTP cache may still help)
        return url;
      });

    return inflight[url];
  }

  function applyStill(localUrl) {
    root.style.backgroundImage = 'url("' + localUrl + '")';
    root.style.backgroundSize = 'cover';
    root.style.backgroundPosition = 'center';
  }

  function applyMotion(token, localUrl) {
    if (token !== loadToken) return;
    img.onload = function () {
      if (token !== loadToken) return;
      img.style.visibility = 'visible';
    };
    img.onerror = function () {
      if (token !== loadToken) return;
      img.removeAttribute('src');
      img.style.visibility = 'hidden';
      console.warn('[bg-media] failed to show motion', localUrl);
    };
    img.src = localUrl;
  }

  /**
   * Switch full-page background to a location key.
   * Clear old motion → show still instantly → load looping WebP.
   * Assets are cached locally (Cache Storage + blob URLs).
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

    // 2) Instant still (from local cache when available)
    resolveLocalUrl(still).then(function (localStill) {
      if (token !== loadToken) return;
      applyStill(localStill);
    });

    if (reduceMotion) return;

    // 3) Motion on top of still (from local cache when available)
    resolveLocalUrl(motion).then(function (localMotion) {
      if (token !== loadToken) return;
      applyMotion(token, localMotion);
    });
  }

  function prefetchAll() {
    LOCATION_KEYS.forEach(function (key) {
      resolveLocalUrl(pathFor(key, 'jpg'));
      if (!reduceMotion) resolveLocalUrl(pathFor(key, 'webp'));
    });
  }

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(prefetchAll, { timeout: 2500 });
  } else {
    setTimeout(prefetchAll, 800);
  }

  window.setBackgroundLocation = setBackgroundLocation;
})();
