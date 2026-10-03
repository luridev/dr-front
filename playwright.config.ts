import { defineConfig } from '@playwright/test';

const host = '127.0.0.1';
const port = 4323;
const hostURL = `http://${host}:${port}/?view=canvas&theme=light`;

export default defineConfig({
  testDir: '.',
  testMatch: ['src/**/*.pwtest.ts', 'gallery/**/*.pwtest.ts'],
  projects: [{
    name: 'components',
    use: {
      baseURL: hostURL,
      browserName: 'chromium',
      colorScheme: 'light',
      locale: 'ru-RU',
      serviceWorkers: 'block',
    },
  }],
  webServer: {
    command: 'npm run test:e2e:serve',
    url: hostURL,
    reuseExistingServer: false,
  },
});
