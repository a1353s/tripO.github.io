// === Floating TOC ===
(function() {
  var toggle = document.getElementById('tocToggle');
  var panel = document.getElementById('tocPanel');
  var items = panel.querySelectorAll('.toc-item');
  var isOpen = false;

  // Toggle open/close
  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    toggle.classList.toggle('active', isOpen);
    toggle.textContent = isOpen ? '✕' : '📖';
  });

  // Close when clicking outside
  document.addEventListener('click', function(e) {
    if (isOpen && !panel.contains(e.target) && e.target !== toggle) {
      isOpen = false;
      panel.classList.remove('open');
      toggle.classList.remove('active');
      toggle.textContent = '📖';
    }
  });

  // Click item to scroll to section
  items.forEach(function(item) {
    item.addEventListener('click', function() {
      var targetId = item.getAttribute('data-target');
      var target = document.getElementById(targetId);
      if (target) {
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      // Close panel on mobile after click
      if (window.innerWidth <= 768) {
        isOpen = false;
        panel.classList.remove('open');
        toggle.classList.remove('active');
        toggle.textContent = '📖';
      }
    });
  });

  // Scroll spy: highlight current section
  var sectionIds = ['overview', 'schedule', 'map', 'routes', 'checklist', 'weather', 'sources'];
  var sections = sectionIds.map(function(id) { return document.getElementById(id); }).filter(Boolean);

  function updateActive() {
    var scrollY = window.pageYOffset + 120;
    var currentIdx = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= scrollY) {
        currentIdx = i;
      }
    }
    items.forEach(function(item, idx) {
      item.classList.toggle('active', idx === currentIdx);
    });
  }

  var scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateActive, 50);
  });
  updateActive();
})();
