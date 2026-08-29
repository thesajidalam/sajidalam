/**
 * @file js/app.js
 * @description DevKit UI wiring. Presentation only — all business logic lives
 *              in utils.js and is covered by unit tests.
 */
(function () {
  'use strict';

  var DK = window.DevKit;
  if (!DK) {
    console.error('DevKit utils not loaded.');
    return;
  }

  /* ---------------- error helper ---------------- */
  function err(text) { return '<span style="color:var(--red)">' + escapeHtml(text) + '</span>'; }

  /* ---------------- tiny DOM helpers ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function setMsg(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'error');
  }
  function setOut(el, html) { if (el) el.innerHTML = html; }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------- clipboard helper ---------------- */
  function copyText(el, btn) {
    var text = (el.textContent || el.innerText).trim();
    function done() {
      if (btn) {
        var old = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('ok');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('ok'); }, 1400);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text); done();
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  // Wire all [data-copy] buttons
  $all('.copy-btn[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-copy'));
      if (target) copyText(target, btn);
    });
  });

  /* ---------------- nav / tab switching ---------------- */
  var currentTool = 'wordcount';
  function activateTool(id) {
    currentTool = id;
    $all('.panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + id); });
    $all('.nav-item').forEach(function (b) { b.classList.toggle('active', b.dataset.tool === id); });
    closeMenu();
    // move focus to the panel heading for a11y
    var head = $('#panel-' + id + ' h2');
    if (head && head.setAttribute) head.setAttribute('tabindex', '-1');
    if (head) head.focus({ preventScroll: true });
  }
  $all('.nav-item').forEach(function (btn) {
    btn.addEventListener('click', function () { activateTool(btn.dataset.tool); });
  });

  /* ---------------- mobile menu ---------------- */
  function openMenu() { $('#sidebar').classList.add('open'); $('#menuBtn').setAttribute('aria-expanded', 'true'); $('#scrim').hidden = false; }
  function closeMenu() { $('#sidebar').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); $('#scrim').hidden = true; }
  $('#menuBtn').addEventListener('click', function () {
    if ($('#sidebar').classList.contains('open')) closeMenu(); else openMenu();
  });
  $('#scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ===================================================================
   *  1. Word Counter
   * ================================================================== */
  (function () {
    function update() {
      var v = $('#wc-input').value;
      var vals = {
        words: DK.countWords(v),
        chars: DK.countChars(v),
        nospaces: DK.countCharsNoSpaces(v),
        lines: DK.countLines(v),
        paras: DK.countParagraphs(v)
      };
      $all('#wc-stats [data-k]').forEach(function (el) { el.textContent = vals[el.dataset.k]; });
    }
    $('#wc-input').addEventListener('input', update);
    update();
  })();

  /* ===================================================================
   *  2. Case Converter
   * ================================================================== */
  (function () {
    var map = {
      upper: function (v) { return v.toUpperCase(); },
      lower: function (v) { return v.toLowerCase(); },
      title: DK.titleCase,
      sentence: DK.sentenceCase,
      camel: DK.camelCase,
      pascal: DK.pascalCase,
      snake: DK.snakeCase,
      kebab: DK.kebabCase,
      reverse: DK.reverse
    };
    function run() {
      var v = $('#cc-input').value;
      $('#cc-result').textContent = v || '';
      $('#cc-result').setAttribute('style', '');
    }
    Object.keys(map).forEach(function (key) {
      $('#cc-' + key).addEventListener('click', function () {
        var v = $('#cc-input').value;
        try { $('#cc-result').textContent = map[key](v); }
        catch (e) { $('#cc-result').innerHTML = err(e.message); }
      });
    });
    $('#cc-clear').addEventListener('click', function () { $('#cc-input').value = ''; run(); });
  })();

  /* ===================================================================
   *  3. Slugify
   * ================================================================== */
  (function () {
    function run() {
      try { $('#slug-result').textContent = DK.slugify($('#slug-input').value); }
      catch (e) { $('#slug-result').innerHTML = err(e.message); }
    }
    $('#slug-input').addEventListener('input', run);
    run();
  })();

  /* ===================================================================
   *  4. JSON Format / Minify
   * ================================================================== */
  (function () {
    function getIndent() {
      var v = $('#jf-indent').value;
      return v === 'tab' ? '\t' : parseInt(v, 10);
    }
    function run(mode) {
      var input = $('#jf-input').value;
      var out = $('#jf-output');
      var msg = $('#jf-msg');
      setMsg(msg, '', true);
      out.textContent = '';
      try {
        out.textContent = mode === 'format' ? DK.formatJSON(input, getIndent()) : DK.minifyJSON(input);
      } catch (e) {
        out.innerHTML = err(e.message);
        setMsg(msg, 'Check your JSON and try again.', false);
      }
    }
    $('#jf-format').addEventListener('click', function () { run('format'); });
    $('#jf-minify').addEventListener('click', function () { run('minify'); });
    $('#jf-paste').addEventListener('click', function () {
      if (!navigator.clipboard || !navigator.clipboard.readText) { setMsg($('#jf-msg'), 'Clipboard read not available here (needs https or localhost).', false); return; }
      navigator.clipboard.readText().then(function (t) { if (t) $('#jf-input').value = t; }).catch(function () { setMsg($('#jf-msg'), 'Could not read clipboard.', false); });
    });
    $('#jf-file').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { $('#jf-input').value = String(reader.result); run('format'); };
      reader.readAsText(file);
    });
    $('#jf-clear').addEventListener('click', function () { $('#jf-input').value = ''; $('#jf-output').textContent = ''; setMsg($('#jf-msg'), '', true); });
    $('#jf-indent').addEventListener('change', function () { if ($('#jf-input').value.trim()) run('format'); });
  })();

  /* ===================================================================
   *  5. JSON Viewer
   * ================================================================== */
  (function () {
    function view() {
      var wrap = $('#jv-table-wrap');
      var msg = $('#jv-msg');
      setMsg(msg, '', true);
      wrap.innerHTML = '';
      try {
        var rows = DK.jsonTable($('#jv-input').value);
        if (!rows.length) { wrap.innerHTML = '<div class="output">Empty object/array.</div>'; return; }
        var html = '<table class="ktable"><thead><tr><th>Key</th><th>Type</th><th>Value</th></tr></thead><tbody>';
        rows.forEach(function (r) {
          html += '<tr><td>' + escapeHtml(r.key) + '</td><td class="type">' + escapeHtml(r.type) + '</td><td>' + escapeHtml(r.value) + '</td></tr>';
        });
        html += '</tbody></table>';
        wrap.innerHTML = html;
      } catch (e) {
        setMsg(msg, e.message, false);
      }
    }
    $('#jv-view').addEventListener('click', view);
    $('#jv-clear').addEventListener('click', function () { $('#jv-input').value = ''; $('#jv-table-wrap').innerHTML = ''; setMsg($('#jv-msg'), '', true); });
  })();

  /* ===================================================================
   *  6. JSON Diff
   * ================================================================== */
  (function () {
    function diff() {
      var msg = $('#jd-msg');
      setMsg(msg, '', true);
      var out = $('#jd-result');
      out.textContent = '';
      var a = $('#jd-before').value;
      var b = $('#jd-after').value;
      if (!a.trim() && !b.trim()) { setMsg(msg, 'Enter JSON in one of the fields.', false); return; }
      var d = DK.diffJSON(a, b);
      var html = '<div class="msg ok" style="margin:0 0 8px">' + d.added.length + ' added, ' + d.removed.length + ' removed, ' + d.unchanged.length + ' unchanged</div>';
      d.removed.forEach(function (l) { html += '<div class="diff-line del">- ' + escapeHtml(l) + '</div>'; });
      d.added.forEach(function (l) { html += '<div class="diff-line add">+ ' + escapeHtml(l) + '</div>'; });
      d.unchanged.forEach(function (l) { html += '<div class="diff-line unchanged">  ' + escapeHtml(l) + '</div>'; });
      out.innerHTML = html;
    }
    $('#jd-diff').addEventListener('click', diff);
    $('#jd-swap').addEventListener('click', function () {
      var a = $('#jd-before').value, b = $('#jd-after').value;
      $('#jd-before').value = b; $('#jd-after').value = a;
      diff();
    });
    $('#jd-clear').addEventListener('click', function () {
      $('#jd-before').value = ''; $('#jd-after').value = '';
      $('#jd-result').textContent = ''; setMsg($('#jd-msg'), '', true);
    });
  })();

  /* ===================================================================
   *  7. Color Converter
   * ================================================================== */
  (function () {
    function parseInput(v) {
      v = v.trim();
      if (v.charAt(0) === '#') return DK.hexToRgb(v);
      if (/^rgb/i.test(v)) { var m = v.match(/(\d+)/g); return { r: +m[0], g: +m[1], b: +m[2] }; }
      if (/^hsl/i.test(v)) { var mm = v.match(/([\d.]+)/g); return DK.hslToRgb(+mm[0], +mm[1], +mm[2]); }
      throw new Error('Unrecognized color format.');
    }
    function render(rgb) {
      var hex = DK.rgbToHex(rgb.r, rgb.g, rgb.b);
      var hsl = DK.rgbToHsl(rgb.r, rgb.g, rgb.b);
      $('#cc-hex').value = hex;
      $('#cc-rgb').value = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
      $('#cc-hsl').value = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
      $('#cc-pick').value = hex;
      $('#cc-swatch').style.background = hex;
    }
    function applySource(source, value) {
      try {
        var rgb;
        if (source === 'hex') rgb = DK.hexToRgb(value);
        else if (source === 'rgb') { var m = value.match(/(\d+)/g); rgb = { r: +m[0], g: +m[1], b: +m[2] }; }
        else if (source === 'hsl') { var mm = value.match(/([\d.]+)/g); rgb = DK.hslToRgb(+mm[0], +mm[1], +mm[2]); }
        else rgb = DK.hexToRgb(value);
        render(rgb);
      } catch (e) { /* ignore invalid input while typing */ }
    }
    $('#cc-pick').addEventListener('input', function () { applySource('hex', $('#cc-pick').value); });
    $('#cc-hex').addEventListener('input', function () { applySource('hex', $('#cc-hex').value); });
    $('#cc-rgb').addEventListener('input', function () { applySource('rgb', $('#cc-rgb').value); });
    $('#cc-hsl').addEventListener('input', function () { applySource('hsl', $('#cc-hsl').value); });
    $('#cc-random').addEventListener('click', function () { render(DK.randomColor()); });
    render(DK.hexToRgb('#58a6ff'));
  })();

  /* ===================================================================
   *  8. Contrast Checker
   * ================================================================== */
  (function () {
    function update() {
      var fg = $('#ct-fg-hex').value;
      var bg = $('#ct-bg-hex').value;
      $('#ct-fg').value = fg; $('#ct-bg').value = bg;
      var preview = $('#ct-preview');
      preview.style.background = bg;
      preview.style.color = fg;
      var ratio;
      try { ratio = DK.contrastRatio(fg, bg); }
      catch (e) { setMsg($('#ct-msg'), e.message, false); $('#ct-ratio').textContent = '--:1'; $('#ct-badges').innerHTML = ''; return; }
      $('#ct-ratio').textContent = ratio.toFixed(2) + ':1';
      var rl = DK.readabilityLevel(ratio);
      setMsg($('#ct-msg'), '', true);
      $('#ct-badges').innerHTML =
        '<span class="badge ' + (rl.passed ? 'pass' : 'fail') + '">' + rl.level + '</span>' +
        '<span class="badge ' + (rl.normal === 'Fail' ? 'fail' : 'pass') + '">Normal: ' + rl.normal + '</span>' +
        '<span class="badge ' + (rl.large === 'Fail' ? 'fail' : 'pass') + '">Large: ' + rl.large + '</span>';
    }
    ['#ct-fg', '#ct-bg', '#ct-fg-hex', '#ct-bg-hex'].forEach(function (sel) {
      $(sel).addEventListener('input', update);
    });
    update();
  })();

  /* ===================================================================
   *  9. Gradient
   * ================================================================== */
  (function () {
    function render() {
      var angle = +$('#gr-angle').value;
      $('#gr-angle-val').textContent = angle + '°';
      var stops = [$('#gr-c1').value, $('#gr-c2').value];
      var c3 = $('#gr-c3').value;
      if (c3) stops.push(c3);
      var css;
      try { css = DK.linearGradient(angle, stops); }
      catch (e) { $('#gr-output').innerHTML = err(e.message); return; }
      $('#gr-preview').style.background = css;
      $('#gr-output').textContent = 'background: ' + css + ';';
    }
    ['#gr-angle', '#gr-c1', '#gr-c2', '#gr-c3'].forEach(function (sel) { $(sel).addEventListener('input', render); });
    render();
  })();

  /* ===================================================================
   *  10. Box Shadow
   * ================================================================== */
  (function () {
    function render() {
      var o = {
        offsetX: +$('#bs-x').value, offsetY: +$('#bs-y').value,
        blur: +$('#bs-blur').value, spread: +$('#bs-spread').value,
        color: $('#bs-color').value, inset: $('#bs-inset').checked
      };
      $('#bs-x-val').textContent = o.offsetX; $('#bs-y-val').textContent = o.offsetY;
      $('#bs-blur-val').textContent = o.blur; $('#bs-spread-val').textContent = o.spread;
      var css;
      try { css = DK.boxShadow(o); }
      catch (e) { $('#bs-output').innerHTML = err(e.message); return; }
      $('#bs-output').textContent = 'box-shadow: ' + css + ';';
      $('#bs-box').style.boxShadow = css;
    }
    ['#bs-x', '#bs-y', '#bs-blur', '#bs-spread', '#bs-color', '#bs-inset'].forEach(function (sel) {
      $(sel).addEventListener('input', render);
    });
    render();
  })();

  /* ===================================================================
   *  11. Base64
   * ================================================================== */
  (function () {
    function encode() {
      try { $('#b64-out').textContent = DK.base64Encode($('#b64-in').value); setMsg($('#b64-msg'), '', true); }
      catch (e) { setMsg($('#b64-msg'), e.message, false); }
    }
    function decode() {
      try { $('#b64-out').textContent = DK.base64Decode($('#b64-in').value); setMsg($('#b64-msg'), '', true); }
      catch (e) { setMsg($('#b64-msg'), e.message, false); }
    }
    function url() {
      try { $('#b64-out').textContent = DK.base64UrlEncode($('#b64-in').value); setMsg($('#b64-msg'), '', true); }
      catch (e) { setMsg($('#b64-msg'), e.message, false); }
    }
    $('#b64-encode').addEventListener('click', encode);
    $('#b64-decode').addEventListener('click', decode);
    $('#b64-url').addEventListener('click', url);
    $('#b64-clear').addEventListener('click', function () { $('#b64-in').value = ''; $('#b64-out').textContent = ''; setMsg($('#b64-msg'), '', true); });
  })();

  /* ===================================================================
   *  12. URL Codec
   * ================================================================== */
  (function () {
    function encode() {
      try { $('#url-out').textContent = DK.urlEncode($('#url-in').value); setMsg($('#url-msg'), '', true); }
      catch (e) { setMsg($('#url-msg'), e.message, false); }
    }
    function decode() {
      try { $('#url-out').textContent = DK.urlDecode($('#url-in').value); setMsg($('#url-msg'), '', true); }
      catch (e) { setMsg($('#url-msg'), e.message, false); }
    }
    $('#url-encode').addEventListener('click', encode);
    $('#url-decode').addEventListener('click', decode);
    $('#url-clear').addEventListener('click', function () { $('#url-in').value = ''; $('#url-out').textContent = ''; setMsg($('#url-msg'), '', true); });
  })();

  /* ===================================================================
   *  13. UUID
   * ================================================================== */
  (function () {
    function gen() {
      var n = Math.max(1, Math.min(100, parseInt($('#uuid-count').value, 10) || 1));
      $('#uuid-out').textContent = DK.uuidList(n).join('\n');
    }
    $('#uuid-gen').addEventListener('click', gen);
    $('#uuid-count').addEventListener('keydown', function (e) { if (e.key === 'Enter') gen(); });
    $('#uuid-copyall').addEventListener('click', function () { copyText($('#uuid-out')); });
    gen();
  })();

  /* ===================================================================
   *  14. Token
   * ================================================================== */
  (function () {
    function gen() {
      var len = +$('#tok-len').value;
      $('#tok-len-val').textContent = len;
      $('#tok-out').textContent = DK.randomToken(len, $('#tok-charset').value);
    }
    $('#tok-gen').addEventListener('click', gen);
    $('#tok-len').addEventListener('input', function () { $('#tok-len-val').textContent = $('#tok-len').value; });
    $('#tok-copy').addEventListener('click', function () { copyText($('#tok-out')); });
    gen();
  })();

  /* ===================================================================
   *  15. Hash
   * ================================================================== */
  (function () {
    function run() {
      var input = $('#hash-in').value;
      if (!input.trim()) { $('#hash-out').textContent = ''; return; }
      DK.sha(input, $('#hash-algo').value).then(function (h) { $('#hash-out').textContent = h; })
        .catch(function (e) { $('#hash-out').innerHTML = err(e.message); });
    }
    $('#hash-in').addEventListener('input', run);
    $('#hash-algo').addEventListener('change', run);
    $('#hash-clear').addEventListener('click', function () { $('#hash-in').value = ''; $('#hash-out').textContent = ''; });
    run();
  })();

  /* ===================================================================
   *  16. JWT
   * ================================================================== */
  (function () {
    function decode() {
      var msg = $('#jwt-msg');
      setMsg(msg, '', true);
      $('#jwt-rows').hidden = true;
      $('#jwt-badges').hidden = true;
      var token = $('#jwt-in').value.trim();
      if (!token) { setMsg(msg, 'Paste a JWT to decode.', false); return; }
      try {
        var d = DK.decodeJWT(token);
        $('#jwt-header').textContent = JSON.stringify(d.header, null, 2);
        $('#jwt-payload').textContent = JSON.stringify(d.payload, null, 2);
        $('#jwt-rows').hidden = false;
        var t = DK.jwtTimes(d.payload);
        var badges = '';
        badges += t.exp ? '<span class="badge">exp: ' + escapeHtml(formatDate(t.exp)) + '</span>' : '';
        badges += t.iat ? '<span class="badge">iat: ' + escapeHtml(formatDate(t.iat)) + '</span>' : '';
        badges += t.nbf ? '<span class="badge">nbf: ' + escapeHtml(formatDate(t.nbf)) + '</span>' : '';
        if (t.exp || t.nbf) {
          badges += '<span class="badge ' + (t.expired ? 'fail' : 'pass') + '">' + (t.expired ? 'EXPIRED' : 'Valid') + '</span>';
        }
        $('#jwt-badges').innerHTML = badges || '<span class="badge">No time claims</span>';
        $('#jwt-badges').hidden = false;
      } catch (e) {
        setMsg(msg, e.message, false);
      }
    }
    function formatDate(d) {
      return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
    }
    $('#jwt-decode').addEventListener('click', decode);
    $('#jwt-paste').addEventListener('click', function () {
      if (!navigator.clipboard || !navigator.clipboard.readText) { setMsg($('#jwt-msg'), 'Clipboard read not available here (needs https or localhost).', false); return; }
      navigator.clipboard.readText().then(function (t) { if (t) { $('#jwt-in').value = t; decode(); } }).catch(function () { setMsg($('#jwt-msg'), 'Could not read clipboard.', false); });
    });
    $('#jwt-clear').addEventListener('click', function () {
      $('#jwt-in').value = ''; $('#jwt-rows').hidden = true; $('#jwt-badges').hidden = true;
      setMsg($('#jwt-msg'), '', true);
    });
    $('#jwt-in').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) decode(); });
  })();

  /* ===================================================================
   *  17. Password
   * ================================================================== */
  (function () {
    function gen() {
      var len = +$('#pw-len').value;
      $('#pw-len-val').textContent = len;
      var opts = { upper: $('#pw-upper').checked, lower: $('#pw-lower').checked, numbers: $('#pw-num').checked, symbols: $('#pw-sym').checked };
      var r = DK.generatePassword(len, opts);
      $('#pw-out').textContent = r.password;
      $('#pw-entropy').textContent = r.entropy + ' bits entropy';
      var st = $('#pw-strength');
      st.textContent = 'Strength: ' + r.strength;
      st.className = 'msg ' + (r.entropy >= 80 ? 'ok' : r.entropy >= 60 ? '' : 'error');
      st.style.color = r.entropy >= 80 ? 'var(--green)' : r.entropy >= 60 ? 'var(--amber)' : 'var(--red)';
      var meter = $('#pw-meter');
      var pct = Math.min(100, Math.round((r.entropy / 128) * 100));
      meter.style.width = pct + '%';
      meter.style.background = r.entropy >= 80 ? 'var(--green)' : r.entropy >= 60 ? 'var(--amber)' : 'var(--red)';
    }
    $('#pw-gen').addEventListener('click', gen);
    $('#pw-len').addEventListener('input', function () { $('#pw-len-val').textContent = $('#pw-len').value; });
    ['#pw-upper', '#pw-lower', '#pw-num', '#pw-sym'].forEach(function (sel) { $(sel).addEventListener('change', gen); });
    $('#pw-copy').addEventListener('click', function () { copyText($('#pw-out')); });
    gen();
  })();

  /* ===================================================================
   *  18. Regex Tester
   * ================================================================== */
  (function () {
    function test() {
      var pattern = $('#rx-pattern').value;
      var flags = $('#rx-flags').value;
      var target = $('#rx-target').value;
      var msg = $('#rx-msg');
      setMsg(msg, '', true);
      var r = DK.findMatches(pattern, flags, target);
      if (!r.valid) { setMsg(msg, r.error, false); $('#rx-count').textContent = '0'; $('#rx-matches').innerHTML = ''; $('#rx-highlight').innerHTML = escapeHtml(target); return; }
      $('#rx-count').textContent = r.count;

      // build highlight
      if (r.count === 0) {
        $('#rx-highlight').textContent = target;
        $('#rx-matches').innerHTML = '<div class="msg" style="color:var(--text-muted)">No matches found.</div>';
        return;
      }
      var html = '';
      var last = 0;
      r.matches.forEach(function (m) {
        html += escapeHtml(target.slice(last, m.index));
        html += '<span class="hl">' + escapeHtml(m.match) + '</span>';
        last = m.index + m.match.length;
      });
      html += escapeHtml(target.slice(last));
      $('#rx-highlight').innerHTML = html;

      var list = '';
      r.matches.forEach(function (m, i) {
        list += '<div class="match-item"><span class="idx">#' + (i + 1) + '</span><span class="txt">' + escapeHtml(m.match) + '</span><span style="color:var(--text-muted);margin-left:auto">@' + m.index + '</span></div>';
      });
      $('#rx-matches').innerHTML = list;
    }
    $('#rx-test').addEventListener('click', test);
    $('#rx-clear').addEventListener('click', function () { $('#rx-pattern').value = ''; $('#rx-flags').value = ''; $('#rx-target').value = ''; $('#rx-highlight').textContent = ''; $('#rx-matches').innerHTML = ''; $('#rx-count').textContent = '0'; setMsg($('#rx-msg'), '', true); });
  })();

  /* ===================================================================
   *  19. Lorem Ipsum
   * ================================================================== */
  (function () {
    function gen() {
      var n = Math.max(1, parseInt($('#lorem-count').value, 10) || 1);
      var unit = $('#lorem-unit').value;
      $('#lorem-out').textContent = DK.loremIpsum(n, unit);
    }
    $('#lorem-gen').addEventListener('click', gen);
    $('#lorem-count').addEventListener('keydown', function (e) { if (e.key === 'Enter') gen(); });
    $('#lorem-clear').addEventListener('click', function () { $('#lorem-out').textContent = ''; });
    gen();
  })();
})();
