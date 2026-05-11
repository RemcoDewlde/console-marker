import tty from 'node:tty';

export type ColorLevel = 0 | 1 | 2 | 3;

/* @internal — exported for testing only */
export function parseForceColor(): ColorLevel | undefined {
  const val = process.env['FORCE_COLOR'];
  if (val === 'true' || val === '1') return 1;
  if (val === '2') return 2;
  if (val === '3') return 3;
  if (val === 'false' || val === '0') return 0;
  return undefined;
}

/* @internal — exported for testing only */
export function hasFlag(flag: string): boolean {
  return process.argv.includes(`--${flag}`) || process.argv.includes(`--${flag}=true`);
}

/* @internal — exported for testing only */
export function detectLevel(stream: tty.WriteStream | undefined): ColorLevel {
  // Explicit overrides take highest priority
  const forced = parseForceColor();
  if (forced !== undefined) return forced;

  if (hasFlag('no-color') || hasFlag('no-colors') || 'NO_COLOR' in process.env) return 0;
  if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) return 3;
  if (hasFlag('color=256')) return 2;
  if (hasFlag('color') || hasFlag('colors')) return 1;

  if (!stream?.isTTY) return 0;

  const colors = stream.getColorDepth();
  if (colors >= 24) return 3;
  if (colors >= 8) return 2;
  if (colors >= 4) return 1;
  return 0;
}

/* @internal — exported for testing only */
export function toWriteStream(stream: NodeJS.WriteStream): tty.WriteStream | undefined {
  return stream instanceof tty.WriteStream ? stream : undefined;
}

// Memoised at module load — callers can call withLevel() if they need a different level
export const stdoutLevel: ColorLevel = detectLevel(toWriteStream(process.stdout));
export const stderrLevel: ColorLevel = detectLevel(toWriteStream(process.stderr));

export const supportsColor = stdoutLevel > 0;
export const supportsColorStderr = stderrLevel > 0;
