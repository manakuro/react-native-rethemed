/**
 * Renders every theme's showcase (and the drawer menu) in both color schemes,
 * so a theme whose tokens the generic showcase can't handle fails here.
 *
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';
import { ThemeMenu } from '../src/components/ThemeMenu';
import { ThemedProvider } from '../src/shell/themed.gen';
import { TokenShowcase } from '../src/showcase/TokenShowcase';
import { THEMES } from '../src/themes';

describe.each(THEMES)('$name', theme => {
  test.each(['light', 'dark'] as const)('renders in %s mode', async scheme => {
    const Provider = theme.ThemedProvider;
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ThemedProvider colorScheme={scheme}>
          <Provider colorScheme={scheme}>
            <TokenShowcase entry={theme} />
          </Provider>
        </ThemedProvider>,
      );
    });
    expect(renderer?.root.findAllByType(TokenShowcase)).toHaveLength(1);
  });
});

test('the menu lists every theme', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <ThemedProvider colorScheme="light">
        <ThemeMenu selectedId={THEMES[0].id} onSelect={() => {}} />
      </ThemedProvider>,
    );
  });
  const text = JSON.stringify(renderer?.toJSON());
  for (const theme of THEMES) {
    expect(text).toContain(theme.name);
  }
});
