import { test as base } from '@playwright/test';
import type { ConsoleMessage, Page, Request } from '@playwright/test';
import type { ComponentTest, HostWindow, MountParams, StoryProps } from '~/tests/playwright/types';

const componentTest: ComponentTest = base;

export { expect } from '@playwright/test';

export async function openReadyHost(page: Page, baseURL: string): Promise<void> {
  const pageErrors: Array<string> = [];
  const consoleErrors: Array<string> = [];
  const failedRequests: Array<string> = [];
  const recordPageError = (error: Error) => pageErrors.push(error.message);

  const recordConsoleError = (message: ConsoleMessage) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  };

  const recordFailedRequest = (request: Request) => {
    failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown error'}`);
  };

  page.on('pageerror', recordPageError);
  page.on('console', recordConsoleError);
  page.on('requestfailed', recordFailedRequest);

  try {
    const response = await page.goto(baseURL);

    if (response?.ok() !== true) {
      throw new Error(`Component host returned an invalid HTTP response at ${baseURL}.`);
    }

    await page.waitForFunction(() => {
      const hostWindow = window as unknown as HostWindow;

      return (
        document.documentElement.dataset.hostReady === 'true' &&
        typeof hostWindow.mount === 'function' &&
        typeof hostWindow.unmount === 'function'
      );
    });
  } catch (error) {
    const diagnostics = [
      ...pageErrors.map((message) => `pageerror: ${message}`),
      ...consoleErrors.map((message) => `console.error: ${message}`),
      ...failedRequests.map((message) => `requestfailed: ${message}`),
    ];

    const diagnosticDetails = diagnostics.length === 0 ? 'Browser diagnostics: none.' : diagnostics.join('\n');

    throw new Error(`Component host did not become ready at ${page.url()}.\n${diagnosticDetails}`, {
      cause: error,
    });
  } finally {
    page.off('pageerror', recordPageError);
    page.off('console', recordConsoleError);
    page.off('requestfailed', recordFailedRequest);
  }
}

export const test = componentTest.extend({
  mount: async ({ baseURL, page }, use) => {
    const callMount = (params: MountParams) =>
      page.evaluate(async (mountParams) => {
        const hostWindow = window as unknown as HostWindow;

        await hostWindow.mount(mountParams);
      }, params);

    await use(async (storyId, props) => {
      if (baseURL == null) {
        throw new Error('mount() requires `baseURL` to point at the component host.');
      }

      await openReadyHost(page, baseURL);

      await callMount({ story: storyId, props });

      return Object.assign(page.locator('#root'), {
        update: (newProps?: unknown) => callMount({ story: storyId, props: newProps as StoryProps | undefined }),
        unmount: () => page.evaluate(async () => {
          const hostWindow = window as unknown as HostWindow;

          await hostWindow.unmount();
        }),
      });
    });
  },
});
