(function (global) {
  'use strict';

  var XXD_CHARS = ['西', '小', '电', '嘻', '笑', '癫', '9', '7'];
  var XXD_PAD_WORD = '基米';
  var XXD_B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function XxdError(message) {
    var e = new Error(message);
    e.name = 'XxdError';
    return e;
  }

  /* 文字 -> 西小电语言
     UTF-8 字节流，每 3 字节（24 位）切成 4 个 6 位组（即 Base64），
     每个 6 位值 idx 对应词语：chars[idx >> 3] + chars[idx & 7]，
     末组不足 3 字节时用补位词「基米」（对应 Base64 的「=」）补齐 */
  function xxdEncode(text) {
    var bytes = new TextEncoder().encode(String(text));
    var words = [];
    for (var i = 0; i < bytes.length; i += 3) {
      var has1 = i + 1 < bytes.length;
      var has2 = i + 2 < bytes.length;
      var chunk = (bytes[i] << 16) | ((has1 ? bytes[i + 1] : 0) << 8) | (has2 ? bytes[i + 2] : 0);
      var wordCount = has2 ? 4 : (has1 ? 3 : 2);
      for (var j = 0; j < wordCount; j++) {
        var idx = (chunk >>> (18 - 6 * j)) & 63;
        words.push(XXD_CHARS[idx >> 3] + XXD_CHARS[idx & 7]);
      }
      if (!has2) {
        words.push(XXD_PAD_WORD);
        if (!has1) words.push(XXD_PAD_WORD);
      }
    }
    return words.join('');
  }

  /* 西小电语言 -> 文字（逆过程，容忍缺失的补位词） */
  function xxdDecode(input) {
    var clean = String(input == null ? '' : input).replace(/\s+/g, '');
    if (clean.length === 0) return '';
    if (clean.length % 2 !== 0) {
      throw XxdError('字符数是奇数，无法两两配成词语（请检查是否漏抄了字符）');
    }
    var indices = [];
    var padCount = 0;
    var firstPad = -1;
    for (var i = 0; i < clean.length; i += 2) {
      var word = clean.slice(i, i + 2);
      if (word === XXD_PAD_WORD) {
        if (firstPad === -1) firstPad = i;
        padCount++;
        continue;
      }
      var a = XXD_CHARS.indexOf(word.charAt(0));
      var b = XXD_CHARS.indexOf(word.charAt(1));
      if (a === -1 || b === -1) {
        var bad = a === -1 ? word.charAt(0) : word.charAt(1);
        throw XxdError('包含无法识别的字符「' + bad + '」（西小电语言只由 西 小 电 嘻 笑 癫 9 7 组成，结尾可用 基米 补位）');
      }
      indices.push(a * 8 + b);
    }
    if (padCount > 2) {
      throw XxdError('补位词「基米」最多出现 2 次');
    }
    if (padCount > 0 && firstPad !== clean.length - padCount * 2) {
      throw XxdError('补位词「基米」只能出现在结尾');
    }
    if (indices.length === 0) {
      throw XxdError('内容不能只有补位词「基米」');
    }
    if (indices.length % 4 === 1) {
      throw XxdError('词语数量不合法，无法还原成完整的字节，请检查内容是否完整');
    }
    var bytes = [];
    var buf = 0;
    var bits = 0;
    for (var k = 0; k < indices.length; k++) {
      buf = (buf << 6) | indices[k];
      bits += 6;
      while (bits >= 8) {
        bits -= 8;
        bytes.push((buf >>> bits) & 0xff);
        buf &= (1 << bits) - 1;
      }
    }
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
    } catch (e) {
      throw XxdError('解出来的字节不是有效的 UTF-8 文本，内容可能被截断或抄错了');
    }
  }

  var api = {
    XXD_CHARS: XXD_CHARS,
    XXD_PAD_WORD: XXD_PAD_WORD,
    XXD_B64_ALPHABET: XXD_B64_ALPHABET,
    xxdEncode: xxdEncode,
    xxdDecode: xxdDecode
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.XxdCodec = api;
})(typeof window !== 'undefined' ? window : globalThis);
