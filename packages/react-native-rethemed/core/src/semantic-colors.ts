import type { SchemeColor, SemanticColors } from './types';

/**
 * A color of `semanticTokens.colors` (as opposed to a group of them): an
 * object whose `light` or `dark` is a string. A group's values are objects,
 * so a group may still name a token `light` or `dark` (Material UI's
 * `primary.light`).
 */
export function isSchemeColor(node: unknown): node is SchemeColor {
  if (typeof node !== 'object' || node === null) return false;
  const { light, dark } = node as Record<string, unknown>;
  return typeof light === 'string' || typeof dark === 'string';
}

/**
 * Visits every semantic color in definition order with its token name:
 * `'group.token'` inside a group, or the bare name for a top-level color
 * (`'primary'`, `'primary-foreground'`).
 */
export function walkSemanticColors(
  colors: SemanticColors | undefined,
  visit: (token: string, color: SchemeColor, group: string | undefined) => void,
): void {
  for (const [key, node] of Object.entries(colors ?? {})) {
    if (isSchemeColor(node)) {
      visit(key, node, undefined);
      continue;
    }
    for (const [name, color] of Object.entries(node)) {
      visit(`${key}.${name}`, color, key);
    }
  }
}
