// Ads Loader — reads ads.json and renders enabled slots (Auto-detect prefix)
(function() {
  'use strict';

  function detectPrefix() {
    var el = document.querySelector('[class$="-ad-slot"]');
    if (el) {
      var match = el.className.match(/([a-zA-Z0-9_-]+)-ad-slot/);
      if (match) return match[1];
    }
    el = document.querySelector('[data-ad-slot]');
    if (el) {
      var classes = el.className.split(' ');
      for (var i = 0; i < classes.length; i++) {
        if (classes[i].indexOf('-ad-slot') !== -1) {
          var parts = classes[i].split('-ad-slot');
          if (parts[0]) return parts[0];
        }
      }
    }
    return 'rs';
  }

  var PREFIX = detectPrefix();
  var AD_SLOT_CLASS = PREFIX + '-ad-slot';
  var ARTICLE_GRID_CLASS = PREFIX + '-blog-grid';
  var ARTICLE_CARD_CLASS = PREFIX + '-blog-card';

  var DEFAULT_SLOTS = [
    {name:'home_top',height:250,enabled:true},
    {name:'home_mid',height:250,enabled:true},
    {name:'home_bottom',height:250,enabled:true},
    {name:'tool_top',height:250,enabled:true},
    {name:'tool_middle',height:250,enabled:true},
    {name:'tool_bottom',height:250,enabled:true},
    {name:'blog_top',height:250,enabled:true},
    {name:'blog_mid',height:250,enabled:true},
    {name:'blog_bottom',height:250,enabled:true},
    {name:'article_top',height:250,enabled:true},
    {name:'article_middle',height:250,enabled:true},
    {name:'article_bottom',height:250,enabled:true},
    {name:'about_bottom',height:250,enabled:true}
  ];

  function findSlotElement(slotName) {
    var el = document.getElementById(slotName);
    if (el) return el;
    return document.querySelector('.' + AD_SLOT_CLASS + '[data-ad-slot="' + slotName + '"]');
  }

  function insertBlogMidSlots(articleCount) {
    var articleGrid = document.querySelector('.' + ARTICLE_GRID_CLASS);
    if (!articleGrid) return;
    var articles = articleGrid.querySelectorAll('.' + ARTICLE_CARD_CLASS);
    if (articles.length === 0) return;
    for (var n = 2; n <= 30; n++) {
      var threshold = n * 9;
      if (articleCount < threshold) break;
      var slotName = 'blog_mid_' + n;
      if (document.getElementById(slotName)) continue;
      var insertIndex = threshold - 1;
      if (insertIndex >= articles.length) continue;
      var refNode = articles[insertIndex];
      var slotDiv = document.createElement('div');
      slotDiv.id = slotName;
      slotDiv.className = AD_SLOT_CLASS;
      slotDiv.setAttribute('data-ad-slot', slotName);
      slotDiv.innerHTML = '<span class="' + PREFIX + '-ad-label">Advertisement</span>';
      refNode.parentNode.insertBefore(slotDiv, refNode.nextSibling);
    }
  }

  function renderSlots(slots) {
    var articleCount = Array.from(document.querySelectorAll('[class*="-blog-card"]')).filter(function(el) {
      return /(^|\s)[a-zA-Z0-9_-]+-blog-card(\s|$)/.test(el.className);
    }).length;

    insertBlogMidSlots(articleCount);

    slots.forEach(function(slot) {
      if (!slot.enabled) return;
      var midMatch = slot.name.match(/^blog_mid_(\d+)$/);
      if (midMatch) {
        var threshold = parseInt(midMatch[1], 10) * 9;
        if (articleCount < threshold) return;
      }
      var el = findSlotElement(slot.name);
      if (!el) return;
      el.classList.add('has-content');
      el.innerHTML = '<div style="width:100%;height:' + slot.height + 'px;background:linear-gradient(135deg,#e0f2fe 0%,#bae6fd 100%);display:flex;align-items:center;justify-content:center;border-radius:8px;color:#0369a1;font-family:system-ui,sans-serif;font-size:14px;">Advertisement</div>';
    });
  }

  (function(){
    var scriptPath = document.currentScript ? document.currentScript.src : '';
    var basePath = '';
    if (scriptPath) {
      var lastSlash = scriptPath.lastIndexOf('/');
      if (lastSlash !== -1) basePath = scriptPath.substring(0, lastSlash + 1);
    }
    if (!basePath) {
      basePath = (location.pathname.includes('/blog/') || location.pathname.includes('/tools/') ? '../' : './');
    }
    return fetch(basePath + 'ads.json');
  })()
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.slots && data.slots.length > 0) {
        renderSlots(data.slots);
      } else {
        renderSlots(DEFAULT_SLOTS);
      }
    })
    .catch(function() {
      renderSlots(DEFAULT_SLOTS);
    });
})();
