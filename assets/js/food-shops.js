// === Food shop panel (synced with schedule day / location) ===
(function() {
  function meituanUrl(name, area, poiId) {
    if (poiId) {
      return 'https://www.meituan.com/meishi/' + poiId + '/';
    }
    return 'https://i.meituan.com/s?q=' + encodeURIComponent(area + ' ' + name);
  }

  var foodByLocation = {
    yangshuo: {
      title: '阳朔西街 · 美食推荐',
      icon: '🍜',
      area: '阳朔西街',
      shops: [
        { name: '张老七高汤螺蛳粉', tag: '螺蛳粉', desc: '西街附近 · 高汤原味' },
        { name: '町奶奶酱汁臭豆腐', tag: '小吃', desc: '西街附近 · 现炸现拌' },
        { name: '花鸿喜客', tag: '粤菜', desc: '西街附近 · 本地风味' },
        { name: '苏姐糖水', tag: '糖水', desc: '西街附近 · 广式甜品' },
        { name: '瘦子米粉', tag: '米粉', desc: '西街附近 · 城中路老店' },
        { name: '月下茶白', tag: '奶茶', desc: '西街附近 · 云顶伏见白桃' },
        { name: '柴火叉烧菠萝包', tag: '烘焙', desc: '西街附近 · 柴火烤制' }
      ]
    },
    longji: {
      title: '龙脊梯田 · 美食推荐',
      icon: '🏔️',
      area: '龙脊梯田',
      shops: []
    },
    guilin: {
      title: '桂林市区 · 美食推荐',
      icon: '🥢',
      area: '桂林市区',
      shops: []
    },
    beihai: {
      title: '北海 · 美食推荐',
      icon: '🦐',
      area: '北海',
      shops: []
    }
  };

  var panel = document.getElementById('foodPanel');
  var listEl = document.getElementById('foodShopList');
  var emptyEl = document.getElementById('foodPanelEmpty');
  var titleEl = document.getElementById('foodPanelTitle');
  var subEl = document.getElementById('foodPanelSub');
  var iconEl = document.getElementById('foodPanelIcon');

  if (!panel || !listEl) return;

  function renderFoodPanel(locationKey) {
    var loc = foodByLocation[locationKey] || foodByLocation.yangshuo;
    var area = loc.area || '阳朔西街';

    if (titleEl) titleEl.textContent = loc.title;
    if (iconEl) iconEl.textContent = loc.icon;
    if (subEl) {
      subEl.textContent = loc.shops.length
        ? (locationKey === 'yangshuo' ? '西街附近 · 点击跳转美团' : '点击店铺跳转美团')
        : '店铺列表待补充';
    }

    listEl.innerHTML = '';
    if (!loc.shops.length) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    loc.shops.forEach(function(shop) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'food-shop-item';
      a.href = meituanUrl(shop.name, area, shop.poiId);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML =
        '<span class="food-shop-name">' + shop.name + '</span>' +
        (shop.tag ? '<span class="food-shop-tag">' + shop.tag + '</span>' : '') +
        (shop.desc ? '<span class="food-shop-desc">' + shop.desc + '</span>' : '') +
        '<span class="food-shop-arrow" aria-hidden="true">→</span>';
      li.appendChild(a);
      listEl.appendChild(li);
    });
  }

  window.updateFoodPanel = renderFoodPanel;

  // Sync with day already selected by main.js (may differ from D1 if cached)
  var visible = document.querySelector('.timeline-item:not(.hidden)');
  var initLoc = visible && visible.getAttribute('data-location');
  renderFoodPanel(initLoc || 'yangshuo');
})();
