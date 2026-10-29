import { defineConfig } from '@playwright/test';

const host = '127.0.0.1';
const port = 4323;
const hostURL = `http://${host}:${port}/?view=canvas&theme=light`;

const crossBrowserTests = [
  'src/actions/components/DrButton/DrButtonContract/DrButtonForm.pwtest.ts',
  'src/forms/components/DrInput/DrInputMaxLength/*.pwtest.ts',
  'src/forms/components/DrInput/DrInputNativeAttributes/*.pwtest.ts',
  'src/forms/components/DrInput/DrInputMasking/DrInputEditing.pwtest.ts',
  'src/forms/components/DrMaskedInput/DrMaskedInputEditing.pwtest.ts',
  'src/forms/components/DrRadioGroup/*.pwtest.ts',
  'src/forms/components/DrSelect/**/*.pwtest.ts',
  'src/dialogs/**/*.pwtest.ts',
  'src/overlays/**/*.pwtest.ts',
  'src/configuration/**/DrFrontProviderGallery.pwtest.ts',
  'src/configuration/**/DrConfigProviderGallery.pwtest.ts',
];

export default defineConfig({
  testDir: '.',
  testMatch: ['src/**/*.pwtest.ts', 'gallery/**/*.pwtest.ts'],
  testIgnore: ['**/.stryker-tmp/**'],
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: hostURL,
    colorScheme: 'light',
    locale: 'en-US',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
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
