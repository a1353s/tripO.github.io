// === Leaflet Interactive Map ===
(function() {
  // Location data: [lat, lng, name, detail, icon, zoom]
  var locations = {
    guilin: {
      center: [25.2622, 110.2909],
      zoom: 13,
      markers: [
        { lat: 25.2622, lng: 110.2909, name: '象鼻山公园', detail: '桂林城徽 · 滨江路' },
        { lat: 25.2700, lng: 110.2950, name: '两江四湖', detail: '夜游游船 · 日月双塔' },
        { lat: 25.2750, lng: 110.3000, name: '东西巷/正阳步行街', detail: '美食购物 · 桂林米粉' },
        { lat: 25.3285, lng: 110.3120, name: '神州租车·桂林北站', detail: 'D5还车 · 东广场5号停车场 · 24H' }
      ]
    },
    yangshuo: {
      center: [24.7700, 110.4850],
      zoom: 12,
      markers: [
        { lat: 24.7372, lng: 110.4897, name: '阳朔西街', detail: '啤酒鱼 · 中西交融' },
        { lat: 24.7600, lng: 110.4400, name: '遇龙河竹筏', detail: '水厄底码头 · 人工竹筏' },
        { lat: 24.7100, lng: 110.4600, name: '十里画廊', detail: '骑行 · 月亮山 · 大榕树' },
        { lat: 24.7900, lng: 110.4200, name: '兴坪古镇', detail: '20元人民币背景 · 黄布倒影' },
        { lat: 24.8200, lng: 110.4500, name: '望山·千里江山约拍点', detail: '山巅汉服拍摄 · 需预约' },
        { lat: 24.8100, lng: 110.4700, name: '银子岩', detail: '溶洞 · 18-20°C避暑' },
        { lat: 24.7695, lng: 110.4915, name: '神州租车·阳朔自助点', detail: 'D3取车 · 旅游停车场 · 24H' }
      ]
    },
    longji: {
      center: [25.7936, 110.1039],
      zoom: 13,
      markers: [
        { lat: 25.7936, lng: 110.1039, name: '金坑大寨', detail: '大地指纹 · 索道/徒步' },
        { lat: 25.7800, lng: 110.1200, name: '平安壮寨', detail: '九龙五虎 · 七星伴月' }
      ]
    },
    beihai: {
      center: [21.4500, 109.1200],
      zoom: 12,
      markers: [
        { lat: 21.3956, lng: 109.1299, name: '北海银滩', detail: '细腻白沙滩 · 落日' },
        { lat: 21.4850, lng: 109.1170, name: '北海老街', detail: '南洋骑楼 · 珠海路' },
        { lat: 21.4550, lng: 109.1330, name: '侨港风情街', detail: '虾饼 · 糖水 · 越南卷粉' },
        { lat: 21.5100, lng: 109.0500, name: '冠头岭', detail: '海枯石烂 · 日落最佳点' },
        { lat: 21.4700, lng: 109.1150, name: '北海站', detail: '动车到达站' }
      ]
    },
    overview: {
      center: [23.5, 109.9],
      zoom: 7,
      markers: [
        { lat: 25.2622, lng: 110.2909, name: '桂林市区', detail: '象鼻山 · 两江四湖' },
        { lat: 24.7700, lng: 110.4850, name: '阳朔', detail: '漓江 · 遇龙河 · 约拍' },
        { lat: 25.7936, lng: 110.1039, name: '龙脊梯田', detail: '金坑大寨' },
        { lat: 21.4500, lng: 109.1200, name: '北海', detail: '银滩 · 老街' }
      ]
    }
  };

  // Route polyline data (overview mode) - new order: 阳朔→龙脊→市区→北海
  var routePoints = [
    [24.7700, 110.4850],  // 阳朔(起点, 高铁直达阳朔站)
    [25.7936, 110.1039],  // 龙脊梯田
    [25.2622, 110.2909],  // 桂林市区(返回)
    [21.4500, 109.1200]   // 北海
  ];

  // WGS-84 to GCJ-02 coordinate conversion (高德瓦片使用GCJ-02坐标系)
  function wgs84ToGcj02(lng, lat) {
    var a = 6378245.0, ee = 0.00669342162296594323;
    function tLat(x, y) {
      var r = -100 + 2*x + 3*y + 0.2*y*y + 0.1*x*y + 0.2*Math.sqrt(Math.abs(x));
      r += (20*Math.sin(6*x*Math.PI) + 20*Math.sin(2*x*Math.PI)) * 2/3;
      r += (20*Math.sin(y*Math.PI) + 40*Math.sin(y/3*Math.PI)) * 2/3;
      r += (160*Math.sin(y/12*Math.PI) + 320*Math.sin(y*Math.PI/30)) * 2/3;
      return r;
    }
    function tLng(x, y) {
      var r = 300 + x + 2*y + 0.1*x*x + 0.1*x*y + 0.1*Math.sqrt(Math.abs(x));
      r += (20*Math.sin(6*x*Math.PI) + 20*Math.sin(2*x*Math.PI)) * 2/3;
      r += (20*Math.sin(x*Math.PI) + 40*Math.sin(x/3*Math.PI)) * 2/3;
      r += (150*Math.sin(x/12*Math.PI) + 300*Math.sin(x/30*Math.PI)) * 2/3;
      return r;
    }
    var dLat = tLat(lng - 105, lat - 35), dLng = tLng(lng - 105, lat - 35);
    var radLat = lat * Math.PI / 180, magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic; var sm = Math.sqrt(magic);
    dLat = (dLat * 180) / ((a * (1 - ee)) / (magic * sm) * Math.PI);
    dLng = (dLng * 180) / (a / sm * Math.cos(radLat) * Math.PI);
    return [lat + dLat, lng + dLng]; // [gcjLat, gcjLng]
  }

  // Convert all location coordinates to GCJ-02
  Object.keys(locations).forEach(function(key) {
    var loc = locations[key];
    var c = wgs84ToGcj02(loc.center[1], loc.center[0]);
    loc.center = [c[0], c[1]];
    loc.markers.forEach(function(m) {
      var mc = wgs84ToGcj02(m.lng, m.lat);
      m.lat = mc[0]; m.lng = mc[1];
    });
  });

  // Convert route points to GCJ-02
  routePoints = routePoints.map(function(p) {
    var c = wgs84ToGcj02(p[1], p[0]);
    return [c[0], c[1]];
  });

  // Initialize map (center on Guilin, GCJ-02)
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var map = L.map('leafletMap', {
    center: locations.guilin.center,
    zoom: 13,
    zoomControl: true,
    scrollWheelZoom: !isTouch,
    dragging: true,
    tap: true
  });

  // 高德地图 (Gaode/AMap) tile layers - 国内地图瓦片
  var streetLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    attribution: '&copy; 高德地图',
    maxZoom: 18,
    subdomains: ['1','2','3','4']
  });

  var satelliteLayer = L.layerGroup([
    L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
      attribution: '&copy; 高德地图',
      maxZoom: 18,
      subdomains: ['1','2','3','4']
    }),
    L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['1','2','3','4']
    })
  ]);

  var terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri World Topo Map',
    maxZoom: 17
  });

  var currentLayer = streetLayer;
  streetLayer.addTo(map);

  // Layer switching
  var layerBtns = document.querySelectorAll('.layer-btn');
  layerBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      layerBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      map.removeLayer(currentLayer);
      var layerType = btn.getAttribute('data-layer');
      if (layerType === 'satellite') {
        currentLayer = satelliteLayer;
      } else if (layerType === 'terrain') {
        currentLayer = terrainLayer;
      } else {
        currentLayer = streetLayer;
      }
      currentLayer.addTo(map);
    });
  });

  // Custom marker icon
  function createIcon(color) {
    return L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:' + color + ';transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  }

  var guilinIcon = createIcon('#0d9488');
  var photoIcon = createIcon('#a855f7');
  var beihaiIcon = createIcon('#f59e0b');
  var rentalIcon = createIcon('#2563eb');

  // Current markers group
  var currentMarkers = L.layerGroup().addTo(map);
  var currentRoute = null;

  function showLocation(key) {
    var loc = locations[key];
    if (!loc) return;

    // Clear existing markers
    currentMarkers.clearLayers();
    if (currentRoute) {
      map.removeLayer(currentRoute);
      currentRoute = null;
    }

    // Fly to location
    map.flyTo(loc.center, loc.zoom, { duration: 1.2 });

    // Add markers after fly animation starts
    setTimeout(function() {
      loc.markers.forEach(function(m) {
        var icon = guilinIcon;
        if (key === 'beihai') icon = beihaiIcon;
        if (m.name.indexOf('约拍') !== -1 || m.name.indexOf('千里江山') !== -1) icon = photoIcon;
        if (m.name.indexOf('神州租车') !== -1) icon = rentalIcon;

        var marker = L.marker([m.lat, m.lng], { icon: icon })
          .bindPopup('<strong>' + m.name + '</strong><div class="popup-detail">' + m.detail + '</div>');
        currentMarkers.addLayer(marker);
      });

      // If overview, draw route polyline
      if (key === 'overview') {
        var routeGroup = L.layerGroup();
        // 神州租车自驾段：阳朔→龙脊→市区
        L.polyline(routePoints.slice(0, 3), {
          color: '#2563eb', weight: 4, opacity: 0.75, dashArray: '8 6', lineJoin: 'round'
        }).addTo(routeGroup);
        // Transit route: 桂林→北海 (高铁直达)
        L.polyline(
          [locations.guilin.center, locations.beihai.center],
          { color: '#f59e0b', weight: 3, opacity: 0.6, dashArray: '8 6' }
        ).addTo(routeGroup);
        routeGroup.addTo(map);
        currentRoute = routeGroup;
      }
    }, 300);
  }

  // Tab switching
  var tabs = document.querySelectorAll('.map-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var mapKey = tab.getAttribute('data-map');
      showLocation(mapKey);
    });
  });

  // Initialize with Guilin
  showLocation('guilin');

  // Handle resize for mobile orientation changes
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      map.invalidateSize();
    }, 250);
  });
})();

// === Shared dual checklist (blue + pink) via keyvalue API ===
(function() {
  var checkboxes = document.querySelectorAll('#checklist input[type="checkbox"][data-item][data-who]');
  var progressBlue = document.getElementById('progressBarBlue');
  var progressPink = document.getElementById('progressBarPink');
  var progressText = document.getElementById('progressText');
  var syncEl = document.getElementById('checklistSync');
  var LOCAL_KEY = 'guilin-beihai-checklist-v2';
  // Public KV store. POST is a "simple" CORS request (PUT is not — browsers preflight).
  var KV_NS = 'tripo-gblh';
  var KV_KEY = 'checklist-v2';
  var KV_BASE = 'https://keyvalue.immanuel.co/api/KeyVal';
  var POLL_MS = 2500;
  var SAVE_DEBOUNCE_MS = 280;

  var saveTimer = null;
  var applyingRemote = false;
  var lastRemoteUpdatedAt = 0;
  var pendingSave = false;
  // dirty keys: "itemId:who" e.g. "id-card:blue"
  var dirtyIds = {};

  var itemIds = [];
  (function collectItemIds() {
    var seen = {};
    checkboxes.forEach(function(cb) {
      var id = cb.getAttribute('data-item');
      if (id && !seen[id]) {
        seen[id] = true;
        itemIds.push(id);
      }
    });
  })();

  function setSync(text, cls) {
    if (!syncEl) return;
    syncEl.textContent = text;
    syncEl.className = 'checklist-sync' + (cls ? ' ' + cls : '');
  }

  function markDirty(itemId, who) {
    if (itemId && who) dirtyIds[itemId + ':' + who] = true;
  }

  function markAllDirty(who) {
    itemIds.forEach(function(id) {
      if (!who || who === 'blue') dirtyIds[id + ':blue'] = true;
      if (!who || who === 'pink') dirtyIds[id + ':pink'] = true;
    });
  }

  function hasDirty() {
    return Object.keys(dirtyIds).length > 0;
  }

  function normalizeEntry(v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return { blue: !!v.blue, pink: !!v.pink };
    }
    if (typeof v === 'boolean') {
      return { blue: v, pink: false };
    }
    return { blue: false, pink: false };
  }

  function normalizeItems(items) {
    var out = {};
    if (!items || typeof items !== 'object') return out;
    Object.keys(items).forEach(function(k) {
      // Ignore legacy flat ids like "id-card-blue"
      if (k.slice(-5) === '-blue' || k.slice(-5) === '-pink') return;
      out[k] = normalizeEntry(items[k]);
    });
    return out;
  }

  // Keep URL short: only persist checked=true flags
  function compactItems(items) {
    var out = {};
    var normalized = normalizeItems(items);
    Object.keys(normalized).forEach(function(id) {
      var e = normalized[id];
      var row = {};
      if (e.blue) row.blue = true;
      if (e.pink) row.pink = true;
      if (row.blue || row.pink) out[id] = row;
    });
    return out;
  }

  function collectState() {
    var state = {};
    itemIds.forEach(function(id) {
      state[id] = { blue: false, pink: false };
    });
    checkboxes.forEach(function(cb) {
      var id = cb.getAttribute('data-item');
      var who = cb.getAttribute('data-who');
      if (!id || (who !== 'blue' && who !== 'pink')) return;
      if (!state[id]) state[id] = { blue: false, pink: false };
      state[id][who] = !!cb.checked;
    });
    return state;
  }

  function preserveDirty(normalized) {
    if (!hasDirty()) return normalized;
    var local = collectState();
    Object.keys(dirtyIds).forEach(function(key) {
      var parts = key.split(':');
      var itemId = parts[0];
      var who = parts[1];
      if (!itemId || (who !== 'blue' && who !== 'pink')) return;
      if (!normalized[itemId]) normalized[itemId] = { blue: false, pink: false };
      if (local[itemId]) normalized[itemId][who] = !!local[itemId][who];
    });
    return normalized;
  }

  function applyState(items) {
    var normalized = preserveDirty(normalizeItems(items));
    applyingRemote = true;
    checkboxes.forEach(function(cb) {
      var id = cb.getAttribute('data-item');
      var who = cb.getAttribute('data-who');
      if (!id || (who !== 'blue' && who !== 'pink')) return;
      var entry = normalized[id] || { blue: false, pink: false };
      cb.checked = !!entry[who];
    });
    applyingRemote = false;
    updateRowDoneState();
    updateProgress();
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(normalized)); } catch (e) {}
  }

  function updateRowDoneState() {
    document.querySelectorAll('#checklist .checklist-item[data-item]').forEach(function(row) {
      var blue = row.querySelector('input.check-blue');
      var pink = row.querySelector('input.check-pink');
      var both = blue && pink && blue.checked && pink.checked;
      row.classList.toggle('is-done-both', !!both);
    });
  }

  function updateProgress() {
    var total = itemIds.length;
    var blueChecked = 0;
    var pinkChecked = 0;
    checkboxes.forEach(function(cb) {
      if (!cb.checked) return;
      if (cb.getAttribute('data-who') === 'blue') blueChecked++;
      if (cb.getAttribute('data-who') === 'pink') pinkChecked++;
    });
    var bluePct = total > 0 ? (blueChecked / total * 50) : 0;
    var pinkPct = total > 0 ? (pinkChecked / total * 50) : 0;
    if (progressBlue) progressBlue.style.width = bluePct + '%';
    if (progressPink) progressPink.style.width = pinkPct + '%';
    if (progressText) {
      progressText.textContent = '蓝 ' + blueChecked + '/' + total + ' · 粉 ' + pinkChecked + '/' + total;
    }
  }

  function toB64(str) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      return btoa(str);
    }
  }

  function fromB64(b64) {
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch (e) {
      return atob(b64);
    }
  }

  function parseRemotePayload(raw) {
    if (raw == null || raw === '') return { v: 2, items: {}, updatedAt: 0 };
    var text = raw;
    if (typeof raw !== 'string') {
      try { text = JSON.stringify(raw); } catch (e) { return { v: 2, items: {}, updatedAt: 0 }; }
    }
    try {
      var decoded = fromB64(text);
      var data = JSON.parse(decoded);
      if (data && typeof data === 'object') {
        data.items = normalizeItems(data.items);
        return data;
      }
    } catch (e) {}
    try {
      var plain = JSON.parse(text);
      if (plain && typeof plain === 'object') {
        plain.items = normalizeItems(plain.items);
        return plain;
      }
    } catch (e2) {}
    return { v: 2, items: {}, updatedAt: 0 };
  }

  function fetchRemote() {
    return fetch(KV_BASE + '/GetValue/' + encodeURIComponent(KV_NS) + '/' + encodeURIComponent(KV_KEY) + '?_=' + Date.now(), {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit'
    }).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function(data) {
      return parseRemotePayload(data);
    });
  }

  function putRemote(payload) {
    var body = {
      v: 2,
      items: compactItems(payload.items || {}),
      updatedAt: payload.updatedAt || Date.now()
    };
    var b64 = toB64(JSON.stringify(body));
    var url = KV_BASE + '/UpdateValue/' +
      encodeURIComponent(KV_NS) + '/' +
      encodeURIComponent(KV_KEY) + '/' +
      encodeURIComponent(b64);
    if (url.length > 1800) {
      throw new Error('payload too large for KV URL');
    }
    return fetch(url, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'omit'
    }).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function(ok) {
      if (ok !== true && ok !== 'true') throw new Error('update rejected');
      return body;
    });
  }

  function loadLocalFallback() {
    try {
      var saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      applyState(saved);
    } catch (e) {
      updateProgress();
    }
  }

  function pullRemote(isInit) {
    return fetchRemote().then(function(data) {
      var items = (data && data.items) || {};
      var updatedAt = Number(data && data.updatedAt) || 0;
      if (!isInit && updatedAt && updatedAt <= lastRemoteUpdatedAt && !hasDirty()) {
        return;
      }
      if (updatedAt > lastRemoteUpdatedAt) lastRemoteUpdatedAt = updatedAt;
      applyState(items);
      setSync(isInit ? '已同步（共享）' : '已同步', 'ok');
    }).catch(function() {
      if (isInit) {
        loadLocalFallback();
        setSync('云端暂不可用，已用本机缓存', 'err');
      } else {
        setSync('同步失败，稍后重试', 'err');
      }
    });
  }

  function pushRemote() {
    if (pendingSave) return;
    if (!hasDirty()) return;
    pendingSave = true;
    setSync('保存中…', 'pending');

    var localItems = collectState();
    var dirtySnapshot = dirtyIds;
    dirtyIds = {};

    fetchRemote().then(function(data) {
      var remoteItems = normalizeItems((data && data.items) || {});
      Object.keys(dirtySnapshot).forEach(function(key) {
        var parts = key.split(':');
        var itemId = parts[0];
        var who = parts[1];
        if (!itemId || (who !== 'blue' && who !== 'pink')) return;
        if (!remoteItems[itemId]) remoteItems[itemId] = { blue: false, pink: false };
        remoteItems[itemId][who] = !!(localItems[itemId] && localItems[itemId][who]);
      });

      var payload = {
        v: 2,
        items: remoteItems,
        updatedAt: Date.now()
      };
      return putRemote(payload).then(function(saved) {
        lastRemoteUpdatedAt = saved.updatedAt;
        applyState(normalizeItems(saved.items));
        setSync('已同步（共享）', 'ok');
      });
    }).catch(function(err) {
      Object.keys(dirtySnapshot).forEach(function(id) { dirtyIds[id] = true; });
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(localItems)); } catch (e) {}
      setSync('保存失败，已暂存本机', 'err');
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[checklist] sync failed', err);
      }
    }).then(function() {
      pendingSave = false;
      if (hasDirty()) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(pushRemote, SAVE_DEBOUNCE_MS);
      }
    });
  }

  function scheduleSave() {
    if (applyingRemote) return;
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(collectState())); } catch (e) {}
    updateRowDoneState();
    updateProgress();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(pushRemote, SAVE_DEBOUNCE_MS);
  }

  checkboxes.forEach(function(cb) {
    cb.addEventListener('change', function() {
      markDirty(cb.getAttribute('data-item'), cb.getAttribute('data-who'));
      scheduleSave();
    });
  });

  window.checkAllWho = function(who, state) {
    if (who !== 'blue' && who !== 'pink') return;
    checkboxes.forEach(function(cb) {
      if (cb.getAttribute('data-who') === who) cb.checked = !!state;
    });
    markAllDirty(who);
    scheduleSave();
  };

  window.checkAll = function(state) {
    checkboxes.forEach(function(cb) { cb.checked = !!state; });
    markAllDirty();
    scheduleSave();
  };

  window.resetChecklist = function() {
    checkboxes.forEach(function(cb) { cb.checked = false; });
    markAllDirty();
    scheduleSave();
  };

  setSync('同步中…', 'pending');
  pullRemote(true).then(function() {
    setInterval(function() {
      if (pendingSave || document.hidden) return;
      fetchRemote().then(function(data) {
        var updatedAt = Number(data && data.updatedAt) || 0;
        if (updatedAt && updatedAt > lastRemoteUpdatedAt) {
          lastRemoteUpdatedAt = updatedAt;
          applyState((data && data.items) || {});
          setSync('已同步（共享）', 'ok');
        }
      }).catch(function() {});
    }, POLL_MS);
  });
})();

// === Day Selector for Timeline ===
(function() {
  var timeline = document.getElementById('timeline');
  var selector = document.getElementById('daySelector');
  if (!timeline || !selector) return;

  var STORAGE_KEY = 'guilin-beihai-selected-day';
  var items = timeline.querySelectorAll('.timeline-item');
  var totalDays = items.length;
  var currentDay = 1;

  // Trip year from page title (e.g. "2026.9.5-9.13")
  var tripYear = (function() {
    var m = (document.title || '').match(/(\d{4})\s*[.．]/);
    return m ? parseInt(m[1], 10) : new Date().getFullYear();
  })();

  // Parse "9月5日" → { y, m, d } using tripYear
  function parseTimelineDate(text) {
    if (!text) return null;
    var m = String(text).match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (!m) return null;
    return {
      y: tripYear,
      m: parseInt(m[1], 10),
      d: parseInt(m[2], 10)
    };
  }

  function dateKey(y, m, d) {
    return y + '-' + m + '-' + d;
  }

  function todayKey() {
    var now = new Date();
    return dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  // Extract day info from timeline items
  var dayInfo = [];
  var dateToDay = {};
  var rangeStart = null;
  var rangeEnd = null;

  items.forEach(function(item, idx) {
    var day = idx + 1;
    item.setAttribute('data-day', day);
    var dot = item.querySelector('.timeline-dot');
    var dateEl = item.querySelector('.timeline-date');
    var title = item.querySelector('.timeline-title');
    var isBeihai = item.classList.contains('beihai');
    var dateText = dateEl ? dateEl.textContent.trim() : '';
    var parsed = parseTimelineDate(dateText.split(' · ')[0] || dateText);

    if (parsed) {
      var key = dateKey(parsed.y, parsed.m, parsed.d);
      dateToDay[key] = day;
      var t = new Date(parsed.y, parsed.m - 1, parsed.d).getTime();
      if (rangeStart === null || t < rangeStart) rangeStart = t;
      if (rangeEnd === null || t > rangeEnd) rangeEnd = t;
    }

    dayInfo.push({
      day: day,
      label: dot ? dot.textContent.trim() : 'D' + day,
      date: dateText.split(' · ')[0] || '',
      weekday: dateText.split(' · ')[1] || '',
      title: title ? title.textContent.trim() : '',
      isBeihai: isBeihai,
      parsed: parsed
    });
  });

  function isTodayInRange() {
    if (rangeStart === null || rangeEnd === null) return false;
    var now = new Date();
    var t = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return t >= rangeStart && t <= rangeEnd;
  }

  function loadCachedDay() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var n = parseInt(raw, 10);
      if (n >= 1 && n <= totalDays) return n;
    } catch (e) {}
    return null;
  }

  function saveCachedDay(day) {
    try { localStorage.setItem(STORAGE_KEY, String(day)); } catch (e) {}
  }

  function resolveInitialDay() {
    // 1) System date matches a schedule day
    if (isTodayInRange()) {
      var matched = dateToDay[todayKey()];
      if (matched) return matched;
    }
    // 2) Outside range → local cache
    var cached = loadCachedDay();
    if (cached) return cached;
    // 3) Default D1
    return 1;
  }

  function isHorizontalSelector() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  }

  function scrollActiveIntoView() {
    var activeBtn = selector.querySelector('.day-btn.active');
    if (!activeBtn) return;

    if (isHorizontalSelector()) {
      // Prefer keeping active near the start of the strip so ~4 days stay readable
      var leftPad = 4;
      var target = activeBtn.offsetLeft - leftPad;
      var max = Math.max(0, selector.scrollWidth - selector.clientWidth);
      selector.scrollLeft = Math.max(0, Math.min(target, max));
      return;
    }

    // Desktop: vertical list — keep active visible without jumping the page
    var top = activeBtn.offsetTop;
    var bottom = top + activeBtn.offsetHeight;
    var viewTop = selector.scrollTop;
    var viewBottom = viewTop + selector.clientHeight;
    if (top < viewTop) {
      selector.scrollTop = top;
    } else if (bottom > viewBottom) {
      selector.scrollTop = bottom - selector.clientHeight;
    }
  }

  function updateActiveButtons() {
    var btns = selector.querySelectorAll('.day-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', i + 1 === currentDay);
    }
    scrollActiveIntoView();
  }

  function renderSelector() {
    selector.innerHTML = '';
    // Render all days once — free scroll (horizontal on mobile, vertical on PC)
    for (var i = 1; i <= totalDays; i++) {
      var info = dayInfo[i - 1];
      var btn = document.createElement('button');
      btn.className = 'day-btn' + (info.isBeihai ? ' beihai' : '') + (i === currentDay ? ' active' : '');
      btn.type = 'button';
      btn.setAttribute('data-day', String(i));
      btn.innerHTML =
        '<span class="day-btn-num">' + info.label + '</span>' +
        '<span class="day-btn-date">' + info.date + (info.weekday ? ' · ' + info.weekday : '') + '</span>' +
        '<span class="day-btn-title">' + info.title + '</span>';
      (function(day) {
        btn.addEventListener('click', function() {
          selectDay(day);
        });
      })(i);
      selector.appendChild(btn);
    }
    scrollActiveIntoView();
  }

  function selectDay(day) {
    if (day < 1 || day > totalDays) return;
    currentDay = day;
    // Show only selected day, hide others
    items.forEach(function(item, idx) {
      if (idx + 1 === day) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
    if (selector.childElementCount !== totalDays) {
      renderSelector();
    } else {
      updateActiveButtons();
    }
    saveCachedDay(day);

    var active = items[day - 1];
    var loc = active && active.getAttribute('data-location');
    if (loc && typeof window.setBackgroundLocation === 'function') {
      window.setBackgroundLocation(loc);
    }
    if (loc && typeof window.updateFoodPanel === 'function') {
      window.updateFoodPanel(loc);
    }
  }

  renderSelector();
  selectDay(resolveInitialDay());
})();
