/**
 * @file js/utils.js
 * @description DevKit core logic. Pure, DOM-free, browser + Node testable.
 *              Exposed as a UMD module (global `DevKit` in browser, CommonJS in Node).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DevKit = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* =====================================================================
   *  Text tools
   * ==================================================================== */

  /**
   * Count words in a string (whitespace delimited, trims empties).
   * @param {string} str
   * @returns {number}
   */
  function countWords(str) {
    const s = String(str == null ? '' : str);
    if (!s.trim().length) return 0;
    return s.trim().split(/\s+/).length;
  }

  /**
   * Count characters (including whitespace).
   * @param {string} str
   * @returns {number}
   */
  function countChars(str) {
    return String(str == null ? '' : str).length;
  }

  /**
   * Count non-whitespace characters.
   * @param {string} str
   * @returns {number}
   */
  function countCharsNoSpaces(str) {
    return String(str == null ? '' : str).replace(/\s/g, '').length;
  }

  /**
   * Count lines (splits on \n, empty string yields 0).
   * @param {string} str
   * @returns {number}
   */
  function countLines(str) {
    const s = String(str == null ? '' : str);
    if (s.length === 0) return 0;
    return s.split('\n').length;
  }

  /**
   * Count paragraphs (split on blank lines).
   * @param {string} str
   * @returns {number}
   */
  function countParagraphs(str) {
    const s = String(str == null ? '' : str);
    if (!s.trim().length) return 0;
    return s.split(/\n\s*\n/).filter(function (p) { return p.trim().length > 0; }).length;
  }

  /**
   * Convert a string to title case (capitalize first letter of each word).
   * @param {string} str
   * @returns {string}
   */
  function titleCase(str) {
    return String(str == null ? '' : str)
      .toLowerCase()
      .replace(/(?:^|\s|[-(/])\S/g, function (c) { return c.toUpperCase(); });
  }

  /**
   * Convert a string to sentence case.
   * @param {string} str
   * @returns {string}
   */
  function sentenceCase(str) {
    const s = String(str == null ? '' : str).toLowerCase().replace(/_/g, ' ').trim();
    if (!s.length) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * Split a raw string into words, separating on common delimiters.
   * @param {string} str
   * @returns {string[]} array of words
   */
  function splitWords(str) {
    return String(str == null ? '' : str)
      .trim()
      .split(/[\s_\-.,;:!?()/[\]{}]+/)
      .filter(function (w) { return w.length > 0; });
  }

  /**
   * camelCase: "hello world" -> "helloWorld"; "Hello world" -> "helloWorld".
   * @param {string} str
   * @returns {string}
   */
  function camelCase(str) {
    const words = splitWords(str);
    return words
      .map(function (w, i) {
        if (i === 0) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join('');
  }

  /**
   * PascalCase: "hello world" -> "HelloWorld".
   * @param {string} str
   * @returns {string}
   */
  function pascalCase(str) {
    return splitWords(str)
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })
      .join('');
  }

  /**
   * snake_case: "hello world" -> "hello_world".
   * @param {string} str
   * @returns {string}
   */
  function snakeCase(str) {
    return splitWords(str)
      .map(function (w) { return w.toLowerCase(); })
      .join('_');
  }

  /**
   * kebab-case: "hello world" -> "hello-world".
   * @param {string} str
   * @returns {string}
   */
  function kebabCase(str) {
    return splitWords(str)
      .map(function (w) { return w.toLowerCase(); })
      .join('-');
  }

  /**
   * Create a URL-safe slug. Removes diacritics, lowercases, joins with '-'.
   * @param {string} str
   * @returns {string}
   */
  function slugify(str) {
    return String(str == null ? '' : str)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Collapse runs of whitespace and trim.
   * @param {string} str
   * @returns {string}
   */
  function collapseWhitespace(str) {
    return String(str == null ? '' : str).replace(/\s+/g, ' ').trim();
  }

  /**
   * Reverse a string (works on code points).
   * @param {string} str
   * @returns {string}
   */
  function reverse(str) {
    return Array.from(String(str == null ? '' : str)).reverse().join('');
  }

  /**
   * Trim each line's leading/trailing whitespace.
   * @param {string} str
   * @returns {string}
   */
  function trimLines(str) {
    return String(str == null ? '' : str)
      .split('\n')
      .map(function (line) { return line.trim(); })
      .join('\n');
  }

  /* =====================================================================
   *  JSON tools
   * ==================================================================== */

  /**
   * Pretty-print a JSON string.
   * @param {string} str JSON string
   * @param {number} [indent=2]
   * @returns {string}
   * @throws {Error} on invalid JSON with line/col info
   */
  function formatJSON(str, indent) {
    const ind = indent == null ? 2 : indent;
    if (String(str == null ? '' : str).trim() === '') {
      throw new Error('Empty input: nothing to format.');
    }
    try {
      return JSON.stringify(JSON.parse(str), null, ind);
    } catch (e) {
      throw jsonErrorWithPosition(str, e);
    }
  }

  /**
   * Minify/compact a JSON string.
   * @param {string} str
   * @returns {string}
   * @throws {Error} on invalid JSON with line/col info
   */
  function minifyJSON(str) {
    if (String(str == null ? '' : str).trim() === '') {
      throw new Error('Empty input: nothing to minify.');
    }
    try {
      return JSON.stringify(JSON.parse(str));
    } catch (e) {
      throw jsonErrorWithPosition(str, e);
    }
  }

  /**
   * Parse JSON and return a flattened key/value table for a single level.
   * @param {string} str
   * @returns {Array<{key:string,value:string,type:string}>} rows
   */
  function jsonTable(str) {
    let data;
    try {
      data = JSON.parse(str);
    } catch (e) {
      throw jsonErrorWithPosition(str, e);
    }
    if (data === null || typeof data !== 'object') {
      throw new Error('JSON must be an object or array to inspect keys.');
    }
    const rows = [];
    Object.keys(data).forEach(function (key) {
      const val = data[key];
      let type = Array.isArray(val) ? 'array' : typeof val;
      if (val === null) type = 'null';
      let display = type === 'object' || type === 'array' ? JSON.stringify(val) : String(val);
      if (val !== null && typeof val === 'object') display = JSON.stringify(val);
      rows.push({ key: key, value: display, type: type });
    });
    return rows;
  }

  /**
   * Attach line/column info to a JSON parse error.
   * @private
   * @param {string} str original input
   * @param {Error} e original parse error
   * @returns {Error} enhanced error
   */
  function jsonErrorWithPosition(str, e) {
    const message = e && e.message ? e.message : 'Invalid JSON';
    const posMatch = message.match(/position\s+(\d+)/i);
    if (!posMatch) return new Error('Invalid JSON: ' + message);
    const pos = parseInt(posMatch[1], 10);
    const slice = str.slice(0, pos);
    const lines = slice.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return new Error('Invalid JSON at line ' + line + ', column ' + col + ' (' + message + ')');
  }

  /**
   * Structural, line-based diff of two JSON strings (both pretty-printed).
   * @param {string} before
   * @param {string} after
   * @returns {{added:string[],removed:string[],unchanged:string[]}} line buckets
   */
  function diffJSON(before, after) {
    const bLines = linesForDiff(before);
    const aLines = linesForDiff(after);
    const added = [];
    const removed = [];
    const unchanged = [];

    const aSet = new Set(aLines);
    const bSet = new Set(bLines);

    bLines.forEach(function (line) {
      if (aSet.has(line)) unchanged.push(line);
      else removed.push(line);
    });
    aLines.forEach(function (line) {
      if (!bSet.has(line)) added.push(line);
    });
    return { added: added, removed: removed, unchanged: unchanged };
  }

  /** @private */
  function linesForDiff(str) {
    try {
      return JSON.stringify(JSON.parse(str), null, 2).split('\n');
    } catch (e) {
      return String(str == null ? '' : str).split('\n');
    }
  }

  /* =====================================================================
   *  Color tools
   * ==================================================================== */

  /**
   * Parse a hex color (#rgb, #rrggbb, #rgba, #rrggbbaa) to RGB.
   * @param {string} hex
   * @returns {{r:number,g:number,b:number}}
   * @throws {Error} if invalid
   */
  function hexToRgb(hex) {
    if (typeof hex !== 'string') throw new Error('hexToRgb expects a string');
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3 || h.length === 4) {
      h = h.replace(/(.)/g, '$1$1');
    }
    if (h.length !== 6 && h.length !== 8) throw new Error('Invalid hex color: ' + hex);
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(isNaN)) throw new Error('Invalid hex color: ' + hex);
    return { r: r, g: g, b: b };
  }

  /**
   * Convert RGB (0-255 each) to hex string (#rrggbb).
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {string}
   */
  function rgbToHex(r, g, b) {
    [r, g, b] = [r, g, b].map(function (v) {
      const n = Math.round(clamp(v, 0, 255));
      return n.toString(16).padStart(2, '0');
    });
    return '#' + r + g + b;
  }

  /**
   * Convert RGB (0-255) to HSL.
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {{h:number,s:number,l:number}} h in [0,360), s/l in [0,100]
   */
  function rgbToHsl(r, g, b) {
    r = clamp(r, 0, 255) / 255;
    g = clamp(g, 0, 255) / 255;
    b = clamp(b, 0, 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  /**
   * Convert HSL to RGB.
   * @param {number} h hue [0,360)
   * @param {number} s saturation [0,100]
   * @param {number} l lightness [0,100]
   * @returns {{r:number,g:number,b:number}} 0-255
   */
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0; let g = 0; let b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  /**
   * Convert hex to HSL.
   * @param {string} hex
   * @returns {{h:number,s:number,l:number}}
   */
  function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsl(r, g, b);
  }

  /**
   * Relative luminance per WCAG.
   * @param {{r:number,g:number,b:number}} rgb
   * @returns {number} 0-1
   */
  function luminance(rgb) {
    function channel(c) {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  }

  /**
   * WCAG contrast ratio between two colors (1-21).
   * @param {string} color1 hex or rgb color
   * @param {string} color2 hex or rgb color
   * @returns {number} contrast ratio
   */
  function contrastRatio(color1, color2) {
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);
    const l1 = luminance(rgb1);
    const l2 = luminance(rgb2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * WCAG readability level for a ratio.
   * @param {number} ratio
   * @returns {{level:string,normal:string,large:string,passed:boolean}}
   */
  function readabilityLevel(ratio) {
    if (typeof ratio !== 'number' || isNaN(ratio)) {
      return { level: 'Invalid', normal: 'Fail', large: 'Fail', passed: false };
    }
    if (ratio >= 7) return { level: 'AAA', normal: 'AAA', large: 'AAA', passed: true };
    if (ratio >= 4.5) return { level: 'AA', normal: 'AA', large: 'AAA', passed: true };
    if (ratio >= 3) return { level: 'AA-Large', normal: 'Fail', large: 'AA', passed: false };
    return { level: 'Fail', normal: 'Fail', large: 'Fail', passed: false };
  }

  /** @private Parse hex or rgb(...) string into {r,g,b}. */
  function parseColor(str) {
    const s = String(str == null ? '' : str).trim();
    const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) return hexToRgb(s);
    const rgb = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
    throw new Error('Unable to parse color: ' + str);
  }

  /** @private */
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  /**
   * Generate a random RGB color.
   * @returns {{r:number,g:number,b:number,hex:string}}
   */
  function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return { r: r, g: g, b: b, hex: rgbToHex(r, g, b) };
  }

  /* =====================================================================
   *  Encoders
   * ==================================================================== */

  /** @private UTF-8 encode a string to a Uint8Array (works Node + browser). */
  function utf8Encode(str) {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str);
    }
    // Node fallback
    const buf = Buffer.from(String(str), 'utf8');
    return new Uint8Array(buf);
  }

  /** @private Decode UTF-8 bytes to string. */
  function utf8Decode(bytes) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(bytes);
    }
    return Buffer.from(bytes).toString('utf8');
  }

  /** @private Base64 chars. */
  const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  /**
   * UTF-8-safe Base64 encode.
   * @param {string} str
   * @returns {string}
   */
  function base64Encode(str) {
    const bytes = utf8Encode(String(str == null ? '' : str));
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const b0 = bytes[i];
      const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      out += B64_CHARS[b0 >> 2];
      out += B64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
      out += i + 1 < bytes.length ? B64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
      out += i + 2 < bytes.length ? B64_CHARS[b2 & 63] : '=';
    }
    return out;
  }

  /**
   * UTF-8-safe Base64 decode.
   * @param {string} str
   * @returns {string}
   * @throws {Error} on invalid base64
   */
  function base64Decode(str) {
    if (typeof str !== 'string' || !str.trim().length) throw new Error('Invalid base64: empty input');
    const clean = str.replace(/\s+/g, '');
    const bytes = [];
    let i = 0;
    while (i < clean.length) {
      const e1 = charToIndex(clean[i]);
      const e2 = i + 1 < clean.length ? charToIndex(clean[i + 1]) : 64;
      const e3 = i + 2 < clean.length ? charToIndex(clean[i + 2]) : 64;
      const e4 = i + 3 < clean.length ? charToIndex(clean[i + 3]) : 64;
      if (e1 === -1 || e2 === -1 || e3 === -1 || e4 === -1) {
        throw new Error('Invalid base64 character');
      }
      bytes.push((e1 << 2) | (e2 >> 4));
      if (e3 !== 64) bytes.push(((e2 & 15) << 4) | (e3 >> 2));
      if (e4 !== 64) bytes.push(((e3 & 3) << 6) | e4);
      i += 4;
    }
    return utf8Decode(new Uint8Array(bytes));
  }

  /** @private */
  function charToIndex(c) {
    if (c === '=') return 64;
    const idx = B64_CHARS.indexOf(c);
    return idx;
  }

  /**
   * Base64URL (safe) encode from standard base64.
   * @param {string} str
   * @returns {string}
   */
  function base64UrlEncode(str) {
    return base64Encode(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * URL-encode a string (encodeURIComponent semantics).
   * @param {string} str
   * @returns {string}
   */
  function urlEncode(str) {
    return encodeURIComponent(String(str == null ? '' : str));
  }

  /**
   * URL-decode a string.
   * @param {string} str
   * @returns {string}
   */
  function urlDecode(str) {
    return decodeURIComponent(String(str == null ? '' : str));
  }

  /* =====================================================================
   *  UUID / token generators
   * ==================================================================== */

  /**
   * Generate a v4 UUID.
   * @returns {string}
   */
  function uuidV4() {
    let bytes = [];
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      bytes = crypto.getRandomValues(new Uint8Array(16));
    } else if (typeof require === 'function') {
      const { randomBytes } = require('crypto');
      bytes = Uint8Array.from(randomBytes(16));
    } else {
      for (let i = 0; i < 16; i++) bytes.push(Math.floor(Math.random() * 256));
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map(function (b) {
      return b.toString(16).padStart(2, '0');
    });
    return (
      hex.slice(0, 4).join('') + '-' +
      hex.slice(4, 6).join('') + '-' +
      hex.slice(6, 8).join('') + '-' +
      hex.slice(8, 10).join('') + '-' +
      hex.slice(10, 16).join('')
    );
  }

  /**
   * Generate N v4 UUIDs.
   * @param {number} count
   * @returns {string[]}
   */
  function uuidList(count) {
    const n = Math.max(1, Math.floor(count || 1));
    const out = [];
    for (let i = 0; i < n; i++) out.push(uuidV4());
    return out;
  }

  /**
   * Generate a cryptographically-secure random token string.
   * @param {number} length
   * @param {string} [charset]
   * @returns {string}
   */
  function randomToken(length, charset) {
    const len = Math.max(1, Math.floor(length || 32));
    const chars = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const usable = randomInt32s(len);
    let out = '';
    for (let i = 0; i < len; i++) {
      out += chars.charAt(usable[i] % chars.length);
    }
    return out;
  }

  /** @private Return `n` secure 32-bit integers (with non-crypto fallback). */
  function randomInt32s(n) {
    const arr = new Uint32Array(n);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
      return Array.from(arr);
    }
    if (typeof require === 'function') {
      const { randomBytes } = require('crypto');
      const bytes = randomBytes(n * 4);
      const res = [];
      for (let i = 0; i < n; i++) {
        res.push(bytes.readUInt32BE(i * 4));
      }
      return res;
    }
    for (let i = 0; i < n; i++) arr[i] = Math.floor(Math.random() * 0xffffffff);
    return Array.from(arr);
  }

  /* =====================================================================
   *  Hashing (browser Web Crypto / Node crypto)
   * ==================================================================== */

  /**
   * Compute an SHA-2 digest of a string.
   * @param {string} str
   * @param {'SHA-1'|'SHA-256'|'SHA-384'|'SHA-512'} [algo='SHA-256']
   * @returns {Promise<string>} hex digest
   */
  async function sha(str, algo) {
    const algorithm = algo || 'SHA-256';
    const data = utf8Encode(String(str == null ? '' : str));
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buf = await crypto.subtle.digest(algorithm, data);
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    }
    // Node fallback
    const { createHash } = require('crypto');
    return createHash(algorithm.toLowerCase().replace('-', '')).update(data).digest('hex');
  }

  /* =====================================================================
   *  JWT decoder
   * ==================================================================== */

  /**
   * Decode a JWT's header + payload without verification.
   * @param {string} token
   * @returns {{header:Object,payload:Object}}
   * @throws {Error} on malformed token
   */
  function decodeJWT(token) {
    if (typeof token !== 'string' || !token.trim()) throw new Error('No token provided');
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Malformed JWT: expected 3 dot-separated segments');
    const header = JSON.parse(base64UrlDecodeJson(parts[0]));
    const payload = JSON.parse(base64UrlDecodeJson(parts[1]));
    return { header: header, payload: payload };
  }

  /** @private */
  function base64UrlDecodeJson(seg) {
    let s = seg.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4 !== 0) s += '=';
    return base64Decode(s);
  }

  /**
   * Return expiry/issued/not-before status of a JWT payload.
   * @param {Object} payload decoded JWT payload
   * @param {Date} [now]
   * @returns {{exp:Date|null,iat:Date|null,nbf:Date|null,expired:boolean,notYetValid:boolean}}
   */
  function jwtTimes(payload, now) {
    payload = payload || {};
    const ref = now instanceof Date ? now.getTime() : Date.now();
    const exp = typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null;
    const iat = typeof payload.iat === 'number' ? new Date(payload.iat * 1000) : null;
    const nbf = typeof payload.nbf === 'number' ? new Date(payload.nbf * 1000) : null;
    return {
      exp: exp,
      iat: iat,
      nbf: nbf,
      expired: exp ? ref > exp.getTime() : false,
      notYetValid: nbf ? ref < nbf.getTime() : false
    };
  }

  /* =====================================================================
   *  Regexp tester
   * ==================================================================== */

  /**
   * Find all matches of a pattern in a string.
   * @param {string} pattern
   * @param {string} flags
   * @param {string} target
   * @returns {{matches:Array<{match:string,index:number}>,count:number,valid:boolean,error:string|null}}
   */
  function findMatches(pattern, flags, target) {
    const result = { matches: [], count: 0, valid: false, error: null };
    if (typeof pattern !== 'string' || !pattern.trim()) {
      result.error = 'Please enter a regular expression.';
      return result;
    }
    let re;
    try {
      re = new RegExp(pattern, sanitizeFlags(flags));
    } catch (e) {
      result.error = (e && e.message ? e.message : 'Invalid regular expression.');
      return result;
    }
    result.valid = true;
    const safeFlags = 'g' + re.flags.replace(/g/g, '');
    const globalRe = new RegExp(re.source, safeFlags);
    const haystack = String(target == null ? '' : target);
    let m;
    let guard = 0;
    while ((m = globalRe.exec(haystack)) !== null && guard < 100000) {
      result.matches.push({ match: m[0], index: m.index });
      result.count++;
      if (m[0].length === 0) globalRe.lastIndex++; // avoid zero-length infinite loop
      guard++;
    }
    return result;
  }

  /** @private Keep only valid JS regex flags. */
  function sanitizeFlags(flags) {
    const allowed = 'dgimsuvy';
    return Array.from(String(flags || ''))
      .filter(function (f) { return allowed.indexOf(f) !== -1; })
      .join('');
  }

  /* =====================================================================
   *  Generators
   * ==================================================================== */

  const LOREM_WORDS = (
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
    'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud ' +
    'exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure ' +
    'in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur ' +
    'excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt ' +
    'mollit anim id est laborum'
  ).split(' ');

  /**
   * Generate a Lorem Ipsum paragraph(s).
   * @param {number} count number of units
   * @param {'paragraphs'|'sentences'|'words'} unit
   * @returns {string}
   */
  function loremIpsum(count, unit) {
    const n = Math.max(1, Math.floor(count || 1));
    const words = generateLoremWords(n * 30 + 20);
    if (unit === 'sentences') {
      return sentencesFrom(words, n).join('\n');
    }
    if (unit === 'words') {
      return words.slice(0, n).join(' ');
    }
    // paragraphs: ~5 sentences each
    const paras = [];
    for (let i = 0; i < n; i++) {
      const slice = words.slice(i * 40, i * 40 + 40);
      paras.push(sentencesFrom(slice, 5).join(' '));
    }
    return paras.join('\n\n');
  }

  /** @private Produce at least `count` pseudo-lorem words (cycled). */
  function generateLoremWords(count) {
    const out = [];
    let i = 0;
    while (out.length < count) {
      out.push(LOREM_WORDS[i % LOREM_WORDS.length]);
      i++;
    }
    return out;
  }

  /** @private Build `n` sentences of ~6-9 words each. */
  function sentencesFrom(words, n) {
    if (!words.length) return [];
    const out = [];
    let pos = 0;
    const remaining = Math.min(n, Math.max(1, Math.floor(words.length / 6)));
    for (let s = 0; s < remaining && pos < words.length; s++) {
      const len = 6 + ((pos + s) % 4);
      const chunk = words.slice(pos, pos + len);
      pos += len;
      const cap = chunk[0].charAt(0).toUpperCase() + chunk[0].slice(1);
      out.push(cap + ' ' + chunk.slice(1).join(' ') + '.');
    }
    return out;
  }

  /**
   * Generate a random password meeting the requested length and charsets.
   * @param {number} length
   * @param {Object} [opts] {upper,lower,numbers,symbols}
   * @returns {{password:string,entropy:number,strength:string}}
   */
  function generatePassword(length, opts) {
    const len = Math.max(4, Math.floor(length || 16));
    const o = opts || {};
    const pools = [];
    let chars = '';
    if (o.upper) { chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; pools.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); }
    if (o.lower) { chars += 'abcdefghijklmnopqrstuvwxyz'; pools.push('abcdefghijklmnopqrstuvwxyz'); }
    if (o.numbers) { chars += '0123456789'; pools.push('0123456789'); }
    if (o.symbols) { chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'; pools.push('!@#$%^&*()_+-=[]{}|;:,.<>?'); }
    if (!chars.length) chars = 'abcdefghijklmnopqrstuvwxyz';

    const rnd = randomInt32s(len);
    let password = '';
    // guarantee at least one from each requested pool
    pools.forEach(function (pool, idx) {
      if (idx < len) password += pool.charAt(rnd[idx] % pool.length);
    });
    while (password.length < len) {
      password += chars.charAt(randomInt32s(1)[0] % chars.length);
    }
    // shuffle
    password = shuffleString(password, rnd);

    const poolSize = chars.length;
    const entropy = len * Math.log2(poolSize || 1);
    const strength = entropy >= 100 ? 'Very Strong' : entropy >= 80 ? 'Strong' : entropy >= 60 ? 'Medium' : 'Weak';
    return { password: password, entropy: Math.round(entropy), strength: strength };
  }

  /** @private Deterministic-ish shuffle using given random ints. */
  function shuffleString(str, rnd) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = rnd[i % rnd.length] % (i + 1);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr.join('');
  }

  /* =====================================================================
   *  CSS generators
   * ==================================================================== */

  /**
   * Build a linear-gradient CSS string.
   * @param {number} angle degrees
   * @param {string[]} stops hex colors
   * @returns {string}
   */
  function linearGradient(angle, stops) {
    const clean = (stops || []).filter(Boolean).map(function (s) {
      // normalize to hex
      if (/^#/.test(s.trim())) return hexToRgb(s.trim()) ? s.trim() : s.trim();
      return s.trim();
    });
    if (clean.length < 2) throw new Error('A gradient needs at least 2 color stops.');
    clean.forEach(function (c) { parseColor(c); });
    const parts = clean.map(function (c, i) {
      return c + ' ' + Math.round((i / (clean.length - 1)) * 100) + '%';
    });
    return 'linear-gradient(' + angle + 'deg, ' + parts.join(', ') + ')';
  }

  /**
   * Build a box-shadow CSS string.
   * @param {Object} o {offsetX,offsetY,blur,spread,color,inset}
   * @returns {string}
   */
  function boxShadow(o) {
    const c = parseColor(o.color || '#000000');
    const colorHex = rgbToHex(c.r, c.g, c.b);
    const parts = [];
    if (o.inset) parts.push('inset');
    parts.push((o.offsetX || 0) + 'px');
    parts.push((o.offsetY || 0) + 'px');
    parts.push((o.blur || 0) + 'px');
    parts.push((o.spread || 0) + 'px');
    parts.push(colorHex);
    return parts.join(' ');
  }

  /* =====================================================================
   *  Public API
   * ==================================================================== */

  return {
    // text
    countWords: countWords,
    countChars: countChars,
    countCharsNoSpaces: countCharsNoSpaces,
    countLines: countLines,
    countParagraphs: countParagraphs,
    titleCase: titleCase,
    sentenceCase: sentenceCase,
    camelCase: camelCase,
    pascalCase: pascalCase,
    snakeCase: snakeCase,
    kebabCase: kebabCase,
    slugify: slugify,
    collapseWhitespace: collapseWhitespace,
    reverse: reverse,
    trimLines: trimLines,
    // json
    formatJSON: formatJSON,
    minifyJSON: minifyJSON,
    jsonTable: jsonTable,
    diffJSON: diffJSON,
    // color
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    rgbToHsl: rgbToHsl,
    hslToRgb: hslToRgb,
    hexToHsl: hexToHsl,
    contrastRatio: contrastRatio,
    readabilityLevel: readabilityLevel,
    randomColor: randomColor,
    // encoders
    base64Encode: base64Encode,
    base64Decode: base64Decode,
    base64UrlEncode: base64UrlEncode,
    urlEncode: urlEncode,
    urlDecode: urlDecode,
    // uuid / tokens / hash
    uuidV4: uuidV4,
    uuidList: uuidList,
    randomToken: randomToken,
    sha: sha,
    // jwt
    decodeJWT: decodeJWT,
    jwtTimes: jwtTimes,
    // regexp
    findMatches: findMatches,
    // generators
    loremIpsum: loremIpsum,
    generatePassword: generatePassword,
    // css
    linearGradient: linearGradient,
    boxShadow: boxShadow
  };
});
