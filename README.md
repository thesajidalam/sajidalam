<p align="center">
  <img src="https://img.shields.io/badge/dependencies-0-blue" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/tests-40%20passing-brightgreen" alt="40 tests passing">
  <img src="https://img.shields.io/badge/client--side-100%25-8A2BE2" alt="100% Client-side">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/made%20by-%40thesajidalam-blueviolet" alt="by @thesajidalam">
</p>

<h1 align="center">🧰 DevKit &mdash; The Developer's Toolbox</h1>

<p align="center">
  <strong>All the everyday dev tools you need, in one lightning-fast page.</strong><br>
  Privacy-first &bull; Zero dependencies &bull; 100% client-side &bull; Works offline
</p>

<p align="center">
  <a href="https://sajidalam.js.org"><strong>🚀 Live Demo &rarr; sajidalam.js.org</strong></a>
</p>

---

## ✨ Overview

**DevKit** is a polished, production-grade single-page web app packed with the
tools developers reach for daily &mdash; **text**, **JSON**, **color**, **CSS**,
**encoders**, **hashing**, **JWT**, **regex** and **generators**.

Your data **never leaves your device**. There is no server, no backend, no
analytics &mdash; every tool runs entirely in your browser using pure
JavaScript. Once loaded, DevKit works **fully offline**.

> 18 ready-to-use tools &bull; 10 categories &bull; zero install &bull; zero tracking

---

## ⚡ Quick Start

```bash
# clone
git clone https://github.com/thesajidalam/sajidalam.git
cd sajidalam

# run tests (Node >= 14)
npm test
```

Then just open `index.html` in any modern browser &mdash; that's it. No build
step, no bundler, no install requirements.

Or use the hosted app: **[https://sajidalam.js.org](https://sajidalam.js.org)**

---

## 🧰 Tools

| Category | Tools |
|---------|-------|
| **🧮 Text** | Live word / character / line / paragraph counter &bull; Case converter &bull; Slugify |
| **🧩 JSON** | Formatter &bull; Minifier &bull; Data viewer &bull; Structural diff |
| **🎨 Color** | HEX ⇄ RGB ⇄ HSL converter &bull; WCAG contrast checker (A/AA/AAA) &bull; Random color |
| **🌈 CSS** | Linear-gradient generator &bull; Box-shadow generator |
| **🔐 Encoders** | Base64 / Base64URL (UTF-8 safe) &bull; URL encode/decode &bull; UUID v4 &bull; Secure random tokens &bull; SHA-256/384/512 |
| **🗝️ Security** | JWT decoder (header/payload + expiry) &bull; Secure password generator |
| **〰️ Regex** | Live regex tester with match highlighting |
| **📝 Content** | Lorem ipsum generator |

Every tool ships with:
- ✅ One-click **Copy** (clipboard API + fallback)
- ✅ **Clear** action
- ✅ Clear **empty** & **error** states
- ✅ Live/preview output where it makes sense

---

## 🏗️ Architecture

```
sajidalam/
├── index.html        # Semantic HTML shell + all tool panels
├── css/style.css     # Design system (CSS custom properties as tokens)
├── js/
│   ├── utils.js      # 🌟 PURE core logic — UMD export · zero DOM · unit-tested
│   └── app.js        # Presentation only — UI wiring, tabs, copy/clear
├── test/test.js      # 40 unit tests (Node built-in assert, zero frameworks)
├── CNAME             # sajidalam.js.org
├── package.json
├── LICENSE           # MIT
└── README.md
```

Key design decisions:

- **Separation of concerns** — all business logic lives in `js/utils.js` as
  pure functions (no DOM), so every one is unit-testable in Node without a
  browser. `js/app.js` only wires inputs to those functions.
- **Zero dependencies** — no frameworks, no build step, no CDNs. Instant load.
- **Accessible** — semantic HTML, WCAG AA contrast, full keyboard navigation,
  `prefers-reduced-motion` support, `aria-live` for result regions.
- **Responsive** — the sidebar collapses to a ☰ slide-over menu on mobile.

---

## 🧪 Tests

```bash
npm test
```

```
DevKit tests:
  passed: 40
  failed: 0
All tests passed ✔ (40)
```

The suite verifies every pure function in `utils.js`:

- **Text** — word/char/line counts, slugify, all case converters, reverse, trimLines
- **JSON** — format/minify (valid + throws on invalid with line:col), viewer, diff
- **Color** — HEX/RGB/HSL round-trips, contrast ratio, readability levels
  (verifies known invariants such as **black/white ratio == 21**)
- **Encoders** — UTF-8 Base64 round-trip, URL encode/decode
- **UUID/Token** — v4 format regex, uniqueness, secure token length/charset
- **JWT** — decode valid + invalid, expiry/validity helpers
- **Regex** — matches + indices, invalid-pattern error handling
- **Generators** — lorem word/sentence/paragraph counts, password length + charset

---

## 🔒 Privacy & Security

- **Zero network requests** &mdash; no analytics, no CDNs, no tracking. Works 100% offline.
- Hashing via the browser's **Web Crypto** API (`crypto.subtle`).
- Randomness via **`crypto.getRandomValues`** (crypto-secure).
- User input is **never `eval`'d** &mdash; only safe `RegExp` matching is used.
- All injected HTML is **escaped** before being written to the DOM.

---

## 📄 Public API

All pure functions are exposed as `window.DevKit` (browser) and
`module.exports` (Node):

```js
DevKit.slugify('Hello World!');             // => 'hello-world'
DevKit.formatJSON('{"a":1}');               // => pretty JSON
DevKit.minifyJSON('{ "a" : 1 }');           // => '{"a":1}'
DevKit.contrastRatio('#000', '#fff');       // => 21
DevKit.readabilityLevel(21);                // => { level: 'AAA', ... }
DevKit.base64Encode('Hello, 世界 🎉');      // => UTF-8 safe base64
DevKit.base64Decode(encoded);               // => original string
DevKit.uuidV4();                            // => '8-4-4-4-12' v4 UUID
DevKit.randomToken(32, 'abc');              // => 32-char secure token
DevKit.sha('hello', 'SHA-256');             // => Promise<hex digest>
DevKit.decodeJWT(token);                    // => { header, payload }
DevKit.findMatches('\\d+', 'g', 'a1b2');    // => matches + indices
DevKit.generatePassword(20, {upper:true});  // => { password, entropy, strength }
DevKit.loremIpsum(3, 'paragraphs');         // => lorem text
```

Full JSDoc lives in `js/utils.js`.

---

## 🧱 Built With

- **Vanilla HTML / CSS / JS** — no frameworks
- **Web Crypto API** — secure hashing & randomness
- **Node.js** — for the test suite only

---

## 👤 Author

**Sajid Alam** &mdash; [@thesajidalam](https://github.com/thesajidalam) on GitHub

---

## 📄 License

Released under the [MIT License](LICENSE) &copy; 2026 Sajid Alam.
