import { walkSemanticColors } from '../semantic-colors';
import type { ThemeConfig } from '../types';

export type ColorScheme = 'light' | 'dark';

/**
 * `config.semanticTokens.colors` for one scheme, keeping its shape: groups
 * become group -> token -> string (`{ fg: { default: '#000' } }`) and
 * top-level colors a string (`{ primary: '#171717' }`). Semantic values are
 * already concrete strings in the config, so this only picks
 * `light`/`dark`.
 */
export function resolveSemanticColors(
  config: ThemeConfig,
  scheme: ColorScheme,
): Record<string, string | Record<string, string>> {
  const result: Record<string, string | Record<string, string>> = {};
  walkSemanticColors(config.semanticTokens?.colors, (token, color, group) => {
    if (group === undefined) {
      result[token] = color[scheme];
    } else {
      if (result[group] === undefined) result[group] = {};
      const tokens = result[group] as Record<string, string>;
      tokens[token.slice(group.length + 1)] = color[scheme];
    }
  });
  return result;
}
