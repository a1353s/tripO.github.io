// === Food shop panel (synced with schedule day / location) ===
(function() {
  function shopUrl(shop, area) {
    if (shop.url) return shop.url;
    return 'https://i.meituan.com/s?q=' + encodeURIComponent(area + ' ' + shop.name);
  }

  var foodByLocation = {
    yangshuo: {
      title: '阳朔西街 · 美食推荐',
      icon: '🍜',
      area: '阳朔西街',
      shops: [
        {
          name: '张老七高汤螺蛳粉',
          tag: '螺蛳粉',
          desc: '兰花路29号 · 18278300990',
          url: 'http://dpurl.cn/WIeumMFz'
        },
        {
          name: '町奶奶酱汁炸豆腐（西街店）',
          tag: '小吃',
          desc: '城中路18号 · 15877151141',
          url: 'http://dpurl.cn/ylgFzkCz'
        },
        {
          name: '花鸿喜客·地道桂林菜',
          tag: '桂菜',
          desc: '抗战路安置地 · 13317830911',
          url: 'http://dpurl.cn/ej6e99nz'
        },
        {
          name: '苏姐糖水铺',
          tag: '糖水',
          desc: '西街附近 · 美团外卖',
          url: 'http://dpurl.cn/OWxwu9Mz'
        },
        {
          name: '瘦子桂林米粉店（总店）',
          tag: '米粉',
          desc: '城中路22号 · 西街步行可达',
          url: 'http://dpurl.cn/RKzXWGVz'
        },
        {
          name: '月下茶白（西街步行街店）',
          tag: '奶茶',
          desc: '西街74号 · 17777385447',
          url: 'http://dpurl.cn/b7rnP9uz'
        },
        {
          name: '北部湾一哥柴火叉烧菠萝包',
          tag: '烘焙',
          desc: '城中城12号 · 13763525671',
          url: 'http://dpurl.cn/0QSBaKaz'
        }
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
      shops: [
        {
          name: '老东江米粉（总店）',
          tag: '米粉',
          desc: '七星区施家园龙隐路3号 · 13977365800',
          url: 'http://dpurl.cn/1PpG6hjz'
        },
        {
          name: '江君烤翅（正阳街美食巷店）',
          tag: '烧烤',
          desc: '正阳步行街美食巷1楼11号 · 15295986088',
          url: 'http://dpurl.cn/a4emPhxz'
        }
      ]
    },
    beihai: {
      title: '侨港 · 美食推荐',
      icon: '🦐',
      area: '侨港 / 贵州路',
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
      a.href = shopUrl(shop, area);
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

  var visible = document.querySelector('.timeline-item:not(.hidden)');
  var initLoc = visible && visible.getAttribute('data-location');
  renderFoodPanel(initLoc || 'yangshuo');
})();
