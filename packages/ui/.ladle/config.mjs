// Component catalog (P0-F8): `pnpm --filter @socioboard/ui catalog`. Stories live next to the
// components as `*.stories.tsx`.
/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.tsx',
  viteConfig: '.ladle/vite.config.mjs',
  defaultStory: 'foundations--tokens',
  addons: {
    // Our own theme switch drives the `.dark` class (see components.tsx); keep Ladle's control.
    theme: { enabled: true, defaultState: 'light' },
    rtl: { enabled: false },
    width: { enabled: true, options: { phone: 390, tablet: 768, desktop: 1280 }, defaultState: 0 },
  },
};
