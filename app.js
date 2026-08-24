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

  var mode = 'encode';
  var encode = window.XxdCodec.xxdEncode;
  var decode = window.XxdCodec.xxdDecode;

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

  setMode('encode');
})();
