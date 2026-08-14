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
        { lat: 25.2750, lng: 110.3000, name: '东西巷/正阳步行街', detail: '美食购物 · 桂林米粉' }
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
        { lat: 24.8100, lng: 110.4700, name: '银子岩', detail: '溶洞 · 18-20°C避暑' }
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

        var marker = L.marker([m.lat, m.lng], { icon: icon })
          .bindPopup('<strong>' + m.name + '</strong><div class="popup-detail">' + m.detail + '</div>');
        currentMarkers.addLayer(marker);
      });

      // If overview, draw route polyline
      if (key === 'overview') {
        var routeGroup = L.layerGroup();
        L.polyline(routePoints, {
          color: '#0d9488', weight: 3, opacity: 0.6, dashArray: '8 6', lineJoin: 'round'
        }).addTo(routeGroup);
        // Transit route: 桂林→北海 (高铁直达, using GCJ-02 coords)
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

// === Checklist with localStorage ===
(function() {
  var checkboxes = document.querySelectorAll('#checklist input[type="checkbox"]');
  var progressBar = document.getElementById('progressBar');
  var progressText = document.getElementById('progressText');
  var STORAGE_KEY = 'guilin-beihai-checklist';

  // Update progress bar
  function updateProgress() {
    var total = checkboxes.length;
    var checked = 0;
    checkboxes.forEach(function(cb) {
      if (cb.checked) checked++;
    });
    var percent = total > 0 ? (checked / total * 100) : 0;
    progressBar.style.width = percent + '%';
    progressText.textContent = checked + ' / ' + total;
  }

  // Load saved state
  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      checkboxes.forEach(function(cb) {
        if (saved[cb.id] !== undefined) cb.checked = saved[cb.id];
      });
    } catch(e) {}
    updateProgress();
  }

  // Save state
  function saveState() {
    var state = {};
    checkboxes.forEach(function(cb) {
      state[cb.id] = cb.checked;
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }

  // Bind events
  checkboxes.forEach(function(cb) {
    cb.addEventListener('change', function() {
      saveState();
      updateProgress();
    });
  });

  // Expose global functions
  window.checkAll = function(state) {
    checkboxes.forEach(function(cb) { cb.checked = state; });
    saveState();
    updateProgress();
  };

  window.resetChecklist = function() {
    checkboxes.forEach(function(cb) { cb.checked = false; });
    saveState();
    updateProgress();
  };

  // Init
  loadState();
})();

// === Day Selector for Timeline ===
(function() {
  var timeline = document.getElementById('timeline');
  var selector = document.getElementById('daySelector');
  if (!timeline || !selector) return;

  var items = timeline.querySelectorAll('.timeline-item');
  var totalDays = items.length;
  var currentDay = 1;

  // Extract day info from timeline items
  var dayInfo = [];
  items.forEach(function(item, idx) {
    var day = idx + 1;
    item.setAttribute('data-day', day);
    var dot = item.querySelector('.timeline-dot');
    var date = item.querySelector('.timeline-date');
    var title = item.querySelector('.timeline-title');
    var isBeihai = item.classList.contains('beihai');
    dayInfo.push({
      day: day,
      label: dot ? dot.textContent.trim() : 'D' + day,
      date: date ? date.textContent.trim().split(' · ')[0] : '',
      weekday: date ? (date.textContent.trim().split(' · ')[1] || '') : '',
      title: title ? title.textContent.trim() : '',
      isBeihai: isBeihai
    });
  });

  function renderSelector() {
    selector.innerHTML = '';
    // Calculate visible window: currentDay ± 2, clamped to [1, totalDays]
    var start = Math.max(1, currentDay - 2);
    var end = Math.min(totalDays, currentDay + 2);

    for (var i = start; i <= end; i++) {
      var info = dayInfo[i - 1];
      var btn = document.createElement('button');
      btn.className = 'day-btn' + (info.isBeihai ? ' beihai' : '') + (i === currentDay ? ' active' : '');
      btn.type = 'button';
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
    renderSelector();
  }

  // Initialize with D1
  selectDay(1);
})();
