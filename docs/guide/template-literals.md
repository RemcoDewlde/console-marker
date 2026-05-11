# Tagged template literals

marker handles tagged templates natively — no `chalk-template` shim needed.

## Basic usage

```ts
import marker from 'console-marker';

const name = 'Alice';
const count = 42;

marker.red`Hello ${name}!`
marker.bold.cyan`${count} tests passed`
marker.bgRed.white.bold` ERROR ` + marker.red` ${message}`
```

## Interpolation

All interpolated values are coerced to strings via `String(value)`:

```ts
const n = 42;
const obj = { toString: () => 'custom' };

marker.yellow`value: ${n}`     // → yellow "value: 42"
marker.yellow`value: ${obj}`   // → yellow "value: custom"
```

## Mixed styling

Combine plain text with styled segments:

```ts
const status = 'PASS';
const file = 'src/index.ts';
const time = 128;

console.log(
  marker.green`✓ ${status}` +
  marker.dim` ${file}` +
  marker.gray` (${time}ms)`
);
```

## Compared to chalk

chalk requires the separate `chalk-template` package for this syntax:

```ts
// chalk — requires npm install chalk-template
import chalkTemplate from 'chalk-template';
chalkTemplate`{red Hello ${name}!}`

// marker — built in
marker.red`Hello ${name}!`
```
