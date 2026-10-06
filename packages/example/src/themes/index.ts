/**
 * The themes the playground can switch between. To add one:
 *
 * 1. Create `src/themes/<id>/theme.ts` exporting `themeConfig`.
 * 2. Add its codegen command to the `theme:codegen` script and run it.
 * 3. Add an entry below.
 */

import type {
  ThemedProviderProps,
  UseThemedResult,
} from '@react-native-rethemed/core';
import type { ComponentType } from 'react';
import { ChakraUiPreview } from './chakra-ui/Preview';
import * as chakraUi from './chakra-ui/themed.gen';
import * as materialDesign from './material-design/themed.gen';
import { MaterialUiPreview } from './material-ui/Preview';
import * as materialUi from './material-ui/themed.gen';
import * as pandaCss from './panda-css/themed.gen';

export type ThemeEntry = {
  id: string;
  name: string;
  packageName: string;
  description: string;
  ThemedProvider: ComponentType<ThemedProviderProps>;
  /**
   * The theme's `useThemed`, loosely typed so the generic showcase can render
   * any theme. Theme-specific code (`Preview`) uses the generated, exactly
   * typed hook instead.
   */
  useThemed: () => UseThemedResult;
  /** Optional sample components written against this theme's tokens. */
  Preview?: ComponentType;
};

/** Each generated hook has exact token types; the showcase only needs loose ones. */
const loose = (hook: () => unknown) => hook as () => UseThemedResult;

export const THEMES: ThemeEntry[] = [
  {
    id: 'chakra-ui',
    name: 'Chakra UI',
    packageName: '@react-native-rethemed/chakra-ui-tokens',
    description:
      'Colors with light/dark semantic colors, radii, spacing, typography, shadows and z-indices.',
    ThemedProvider: chakraUi.ThemedProvider,
    useThemed: loose(chakraUi.useThemed),
    Preview: ChakraUiPreview,
  },
  {
    id: 'material-ui',
    name: 'Material UI',
    packageName: '@react-native-rethemed/material-ui-tokens',
    description:
      "Material UI's default theme: the light/dark palette, color palette, typography variants, spacing, shape, elevations 0–24 and z-indices.",
    ThemedProvider: materialUi.ThemedProvider,
    useThemed: loose(materialUi.useThemed),
    Preview: MaterialUiPreview,
  },
  {
    id: 'material-design',
    name: 'Material Design 3',
    packageName: '@react-native-rethemed/material-design-tokens',
    description: 'The baseline type scale (15 text presets) and spacing.',
    ThemedProvider: materialDesign.ThemedProvider,
    useThemed: loose(materialDesign.useThemed),
  },
  {
    id: 'panda-css',
    name: 'Panda CSS',
    packageName: '@react-native-rethemed/panda-css-tokens',
    description:
      'The primitive color palette, radii, spacing, typography and shadows.',
    ThemedProvider: pandaCss.ThemedProvider,
    useThemed: loose(pandaCss.useThemed),
  },
];
