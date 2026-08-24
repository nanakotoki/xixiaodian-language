(function () {
  'use strict';

  var SAMPLE = '你好，我是西小电！嘻笑癫 9 7';

  var tabEncode = document.getElementById('tab-encode');
  var tabDecode = document.getElementById('tab-decode');
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var inputLabel = document.getElementById('input-label');
  var outputLabel = document.getElementById('output-label');
  var inputStats = document.getElementById('input-stats');
  var outputStats = document.getElementById('output-stats');
  var errorBox = document.getElementById('error');
  var btnCopy = document.getElementById('btn-copy');
  var btnClear = document.getElementById('btn-clear');
  var btnSample = document.getElementById('btn-sample');
  var floatHost = document.getElementById('bg-float');
  var dictGrid = document.getElementById('dict-grid');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var btnGallery = document.getElementById('btn-gallery');

  var mode = 'encode';
  var encode = window.XxdCodec.xxdEncode;
  var decode = window.XxdCodec.xxdDecode;
  var XXD_CHARS = window.XxdCodec.XXD_CHARS;

  var GALLERY = [
    'img/gallery/xxd-01.jpg', 'img/gallery/xxd-02.jpg', 'img/gallery/xxd-03.jpg',
    'img/gallery/xxd-04.jpg', 'img/gallery/xxd-05.jpg', 'img/gallery/xxd-06.jpg',
    'img/gallery/xxd-07.jpg', 'img/gallery/xxd-08.jpg', 'img/gallery/xxd-09.jpg',
    'img/gallery/xxd-10.jpg', 'img/gallery/xxd-11.png', 'img/gallery/xxd-12.jpg',
    'img/gallery/xxd-13.jpg', 'img/gallery/xxd-14.jpg'
  ];
  var lightboxIdx = 0;

  function setMode(next) {
    mode = next;
    var isEncode = mode === 'encode';
    tabEncode.classList.toggle('active', isEncode);
    tabDecode.classList.toggle('active', !isEncode);
    tabEncode.setAttribute('aria-selected', String(isEncode));
    tabDecode.setAttribute('aria-selected', String(!isEncode));
    inputLabel.textContent = isEncode ? '输入明文' : '输入西小电语言';
    outputLabel.textContent = isEncode ? '西小电语言' : '正常文字';
    input.placeholder = isEncode ? '在这里输入要加密的文字…' : '在这里粘贴西小电语言（西 小 电 嘻 笑 癫 9 7，结尾可带补位词 基米）…';
    convert();
  }

  function convert() {
    var text = input.value;
    errorBox.hidden = true;
    inputStats.textContent = text.length + ' 字';
    if (text === '') {
      output.value = '';
      outputStats.textContent = '';
      return;
    }
    try {
      var result = mode === 'encode' ? encode(text) : decode(text);
      output.value = result;
      outputStats.textContent = result.length + ' 字';
    } catch (e) {
      output.value = '';
      outputStats.textContent = '';
      errorBox.textContent = e.name === 'XxdError' ? e.message : '转换出错：' + e.message;
      errorBox.hidden = false;
    }
  }

  function copyResult() {
    if (!output.value) return;
    function done() {
      btnCopy.textContent = '已复制 ✓';
      btnCopy.classList.add('done');
      setTimeout(function () {
        btnCopy.textContent = '复制结果';
        btnCopy.classList.remove('done');
      }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output.value).then(done);
    } else {
      output.removeAttribute('readonly');
      output.select();
      document.execCommand('copy');
      output.setAttribute('readonly', '');
      window.getSelection().removeAllRanges();
      done();
    }
  }

  function spawnFloaters() {
    if (!floatHost) return;
    for (var i = 0; i < 18; i++) {
      var s = document.createElement('span');
      s.textContent = XXD_CHARS[Math.floor(Math.random() * XXD_CHARS.length)];
      s.style.left = (Math.random() * 100).toFixed(2) + '%';
      s.style.fontSize = (16 + Math.random() * 28).toFixed(0) + 'px';
      s.style.animationDuration = (16 + Math.random() * 16).toFixed(1) + 's';
      s.style.animationDelay = (-Math.random() * 24).toFixed(1) + 's';
      s.style.opacity = (0.04 + Math.random() * 0.09).toFixed(2);
      floatHost.appendChild(s);
    }
  }

  function buildDict() {
    if (!dictGrid) return;
    for (var a = 0; a < 8; a++) {
      for (var b = 0; b < 8; b++) {
        var chip = document.createElement('span');
        chip.className = 'chip c' + a;
        chip.textContent = XXD_CHARS[a] + XXD_CHARS[b];
        dictGrid.appendChild(chip);
      }
    }
    var pad = document.createElement('span');
    pad.className = 'chip pad';
    pad.textContent = '基米';
    dictGrid.appendChild(pad);
  }

  function openLightbox(i) {
    lightboxIdx = (i + GALLERY.length) % GALLERY.length;
    lightboxImg.src = GALLERY[lightboxIdx];
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  tabEncode.addEventListener('click', function () { setMode('encode'); });
  tabDecode.addEventListener('click', function () { setMode('decode'); });
  input.addEventListener('input', convert);
  btnCopy.addEventListener('click', copyResult);
  btnClear.addEventListener('click', function () {
    input.value = '';
    convert();
    input.focus();
  });
  btnSample.addEventListener('click', function () {
    setMode('encode');
    input.value = SAMPLE;
    convert();
  });

  if (btnGallery) btnGallery.addEventListener('click', function () { openLightbox(0); });
  if (lightboxImg) lightboxImg.addEventListener('click', function (e) { e.stopPropagation(); });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); openLightbox(lightboxIdx - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); openLightbox(lightboxIdx + 1); });
  if (lightbox) lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(lightboxIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(lightboxIdx + 1);
  });
  spawnFloaters();
  buildDict();
  setMode('encode');
})();
