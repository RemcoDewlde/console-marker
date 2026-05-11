import { stdoutLevel, stderrLevel } from './detect.js';
import { createRootBuilder } from './builder.js';
import type { Builder } from './builder.js';
import type { ColorLevel } from './detect.js';

export type { Builder, ColorLevel };
export { supportsColor, supportsColorStderr } from './detect.js';

// Default instances
const marker: Builder = createRootBuilder(stdoutLevel);
export const markerStderr: Builder = createRootBuilder(stderrLevel);

// Factory for custom level
export function withLevel(level: ColorLevel): Builder {
  return createRootBuilder(level);
}

// Named exports for tree-shaking convenience
export const reset         = marker.reset;
export const bold          = marker.bold;
export const dim           = marker.dim;
export const italic        = marker.italic;
export const underline     = marker.underline;
export const overline      = marker.overline;
export const inverse       = marker.inverse;
export const hidden        = marker.hidden;
export const strikethrough = marker.strikethrough;

export const black         = marker.black;
export const red           = marker.red;
export const green         = marker.green;
export const yellow        = marker.yellow;
export const blue          = marker.blue;
export const magenta       = marker.magenta;
export const cyan          = marker.cyan;
export const white         = marker.white;
export const gray          = marker.gray;
export const grey          = marker.grey;

export const blackBright   = marker.blackBright;
export const redBright     = marker.redBright;
export const greenBright   = marker.greenBright;
export const yellowBright  = marker.yellowBright;
export const blueBright    = marker.blueBright;
export const magentaBright = marker.magentaBright;
export const cyanBright    = marker.cyanBright;
export const whiteBright   = marker.whiteBright;

export const bgBlack       = marker.bgBlack;
export const bgRed         = marker.bgRed;
export const bgGreen       = marker.bgGreen;
export const bgYellow      = marker.bgYellow;
export const bgBlue        = marker.bgBlue;
export const bgMagenta     = marker.bgMagenta;
export const bgCyan        = marker.bgCyan;
export const bgWhite       = marker.bgWhite;
export const bgGray        = marker.bgGray;
export const bgGrey        = marker.bgGrey;

export const bgBlackBright   = marker.bgBlackBright;
export const bgRedBright     = marker.bgRedBright;
export const bgGreenBright   = marker.bgGreenBright;
export const bgYellowBright  = marker.bgYellowBright;
export const bgBlueBright    = marker.bgBlueBright;
export const bgMagentaBright = marker.bgMagentaBright;
export const bgCyanBright    = marker.bgCyanBright;
export const bgWhiteBright   = marker.bgWhiteBright;

export default marker;
