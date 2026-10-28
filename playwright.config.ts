import { defineConfig } from '@playwright/test';

const host = '127.0.0.1';
const port = 4323;
const hostURL = `http://${host}:${port}/?view=canvas&theme=light`;

const crossBrowserTests = [
  'src/actions/components/DrButton/DrButtonContract/DrButtonForm.pwtest.ts',
  'src/forms/components/DrInput/DrInputMaxLength/*.pwtest.ts',
  'src/forms/components/DrSelect/**/*.pwtest.ts',
  'src/dialogs/**/*.pwtest.ts',
  'src/overlays/**/*.pwtest.ts',
  'src/configuration/**/DrFrontProviderGallery.pwtest.ts',
  'src/configuration/**/DrConfigProviderGallery.pwtest.ts',
];

export default defineConfig({
  testDir: '.',
  testMatch: ['src/**/*.pwtest.ts', 'gallery/**/*.pwtest.ts'],
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: hostURL,
    colorScheme: 'light',
    locale: 'ru-RU',
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'components', use: { browserName: 'chromium' } },
    { name: 'firefox', testMatch: crossBrowserTests, use: { browserName: 'firefox' } },
    { name: 'webkit', testMatch: crossBrowserTests, use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run test:e2e:serve',
    url: hostURL,
    reuseExistingServer: false,
  },
});
