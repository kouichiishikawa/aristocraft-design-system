import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '@aristocraft/tokens/css';
import './preview.css';

const preview: Preview = {
  parameters: {
    // Fail a story's test on any axe violation (WCAG 2.2 AA is the project's bar).
    a11y: { test: 'error' },
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i } },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
