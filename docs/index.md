---
layout: home

hero:
  name: console-marker
  text: Terminal styling that wins where it counts
  tagline: Zero dependencies · Dual ESM/CJS · 100% TypeScript · Node.js 20+
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/RemcoDewlde/console-marker

features:
  - icon: ⚡
    title: Built for speed
    details: Global builder cache means each unique style chain is allocated once. 1.70× faster than chalk on 5-level chains, 1.26× faster on hex colors.
  - icon: 🔗
    title: Chainable API
    details: Compose styles left-to-right with zero allocation cost after warmup. Every chain is cached globally.
  - icon: 🎨
    title: Full color support
    details: RGB, hex, ANSI 256, and truecolor — with automatic downsampling to 256→16 when the terminal doesn't support truecolor.
  - icon: 🏷️
    title: Tagged templates built-in
    details: Use marker.red`Hello ${name}!` without any extra package. chalk requires chalk-template separately.
  - icon: 🌲
    title: Tree-shakeable
    details: Named exports let bundlers drop every style you don't use. import { red, bold } from 'console-marker' — nothing else ships.
  - icon: 📦
    title: Zero dependencies
    details: No ansi-styles, no supports-color. Color detection, ANSI constants, and the builder are all written from scratch.
---
