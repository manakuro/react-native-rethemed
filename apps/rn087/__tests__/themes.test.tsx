/**
 * Renders the playground with every theme in both color schemes, and checks
 * the drawer menu lists them all.
 *
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';
import { Playground, THEMES } from '@react-native-rethemed/example';

async function render(element: React.ReactElement) {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  return renderer!;
}

describe.each(THEMES)('$name', theme => {
  test.each(['light', 'dark'] as const)('renders in %s mode', async scheme => {
    const renderer = await render(
      <Playground initialThemeId={theme.id} colorScheme={scheme} />,
    );
    expect(JSON.stringify(renderer.toJSON())).toContain(theme.packageName);
  });
});

test('the menu lists every theme', async () => {
  const renderer = await render(<Playground colorScheme="light" />);
  const menuButton = renderer.root.find(
    node => node.props.accessibilityLabel === 'Open theme menu',
  );
  await ReactTestRenderer.act(() => menuButton.props.onPress());
  const text = JSON.stringify(renderer.toJSON());
  for (const theme of THEMES) {
    expect(text).toContain(theme.name);
  }
});
