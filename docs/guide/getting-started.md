# Getting Started

## Installation

```bash
npm install console-marker
```

> **Node.js ≥ 20** required. Uses `String.prototype.replaceAll` and `tty.WriteStream.getColorDepth()`.

## Quick start

```ts
import marker from 'console-marker';

console.log(marker.red('Hello world'));
console.log(marker.bold.green('Build complete'));
console.log(marker.bgBlue.white.bold(' SUCCESS '));
```

## CommonJS

marker ships dual ESM + CJS — no config needed.

```js
const marker = require('marker');
console.log(marker.red('Hello world'));
```

## Named imports

Tree-shakeable single-style imports:

```ts
import { red, bold, green, bgBlue, cyan } from 'console-marker';

console.log(red('error'));
console.log(bold(green('ok')));
```

## TypeScript

Types are bundled. No `@types/marker` needed.

```ts
import marker, { type Builder } from 'console-marker';

function highlight(text: string): string {
  return marker.bold.yellow(text);
}
```
