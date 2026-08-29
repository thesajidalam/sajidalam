# 🧰 DevKit — The Developer's Toolbox

> Privacy-first, zero-dependency, 100% client-side developer tools. Your data
> **never leaves your device** — every tool runs locally in your browser.

**Live:** [sajidalam.js.org](https://sajidalam.js.org) · License: MIT

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-40%20passing-brightgreen)](#tests)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue)]()
[![Made by @thesajidalam](https://img.shields.io/badge/made%20by-@thesajidalam-blueviolet)](https://github.com/thesajidalam)

---

## ✨ Features

A single-page toolbox covering the everyday tools developers reach for:

| Category | Tools |
|---|---|
| **Text** | Live word/char/line/paragraph counter · Case converter (UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case) · Slugify |
| **JSON** | Formatter / minifier (with line & column error reporting) · Data viewer (key/value table) · Structural diff |
| **Color** | HEX ↔ RGB ↔ HSL converter · WCAG contrast checker (A/AA/AAA) · Random color |
| **CSS** | Linear-gradient generator · Box-shadow generator |
| **Encoders** | Base64 / Base64URL (UTF-8 safe) · URL encode/decode · UUID v4 · Secure random tokens · SHA-256/384/512 |
| **Security** | JWT decoder (header/payload + expiry) · Secure password generator |
| **Regex** | Live regex tester with match highlighting |
| **Content** | Lorem ipsum generator |

Every tool includes **Copy** (clipboard API with fallback) and **Clear**
affordances, plus clear empty and error states.

## 🔒 Privacy & Security

- **Zero network requests.** No analytics, no tracking, no backend. Works fully
  offline once loaded.
- Hashing uses the browser's **Web Crypto** API.
- Randomness uses **crypto.getRandomValues**.
- User input is never `eval`'d — only safe `RegExp` matching is used.
- All HTML output is escaped before injection.

## 🏗️ Architecture

```
sajidalam/
├── index.html        # Semantic shell + all tool panels
├── css/style.css     # Design system (CSS custom properties as tokens)
├── js/
│   ├── utils.js      # PURE core logic — UMD export, zero DOM, unit-tested
│   └── app.js        # UI wiring + presentation only
├── test/test.js      # Node unit tests (single-file, built-in assert)
├── CNAME             # sajidalam.js.org
├── package.json
├── LICENSE           # MIT
└── README.md
```

Core logic is separated from UI wiring so every pure function is unit-testable
in Node without a browser.

## 🧪 Tests

```bash
npm install
npm test
# -> 40 tests passing, 0 failing
```

The suite exercises `utils.js` for text, JSON, color, encoders, UUID/tokens,
JWT, regex, and generators. Known invariants are verified (e.g. black/white
contrast ratio == 21, UTF-8 Base64 round-trips, UUID v4 format + uniqueness).

## 🚀 Usage

Just open `index.html`, or use the deployed site. Pick a tool from the sidebar
and start working. On mobile, the sidebar collapses behind a ☰ menu.

## 📄 API

All pure functions are exposed as `window.DevKit` (browser) / `module.exports`
(Node). Highlights:

```js
DevKit.slugify('Hello World!');            // 'hello-world'
DevKit.formatJSON('{"a":1}');              // pretty JSON
DevKit.contrastRatio('#000', '#fff');      // 21
DevKit.base64Encode('Hello, 世界');        // UTF-8 safe base64
DevKit.uuidV4();                           // 8-4-4-4-12 v4 UUID
DevKit.decodeJWT(token);                   // { header, payload }
DevKit.findMatches('\\d+', 'g', 'a1b2');   // matches + indices
DevKit.generatePassword(20, {upper:true}); // { password, entropy, strength }
```

See `js/utils.js` for full JSDoc.

## 👤 Author

**Sajid Alam** — [@thesajidalam](https://github.com/thesajidalam)

## 📄 License

[MIT](LICENSE) © 2026 Sajid Alam.
