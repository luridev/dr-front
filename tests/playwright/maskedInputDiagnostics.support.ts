import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { installMaskRecorder } from '~/tests/playwright/maskedInputDiagnostics.browser.support';
import type { Locator, Page, TestInfo } from '@playwright/test';
import type * as BrowserDiagnostics from '~/tests/playwright/maskedInputDiagnostics.browser.support';
import type { HostWindow, MaskDiagnosticWindow } from '~/tests/playwright/types';

const browserModuleURL = `/@fs/${fileURLToPath(new URL('./maskedInputDiagnostics.browser.support.ts', import.meta.url)).replaceAll('\\', '/')}`;

export async function installMaskDiagnostics(page: Page) {
  await page.addInitScript(installMaskRecorder);

  const transforms = [
    {
      url: '**/useDrMaskedInputEditor.ts*',
      from: 'created = true;',
      to: 'created = true; window.__drMaskDiagnostic.track(control, "dr-front");',
    },
    {
      url: '**/DrMaskedInputGallery.story.vue',
      from: 'updates.value.push(next);',
      to: 'window.__drMaskDiagnostic.record("vue:update:modelValue:before", undefined, { next, model: value.value, updates: [...updates.value] }); updates.value.push(next);',
    },
  ];

  for (const transform of transforms) {
    await page.route(transform.url, async (route) => {
      const response = await route.fetch();
      let body = await response.text();

      if (body.split(transform.from).length !== 2) {
        throw new Error(`Diagnostic injection anchor changed: ${transform.url}`);
      }

      body = body.replace(transform.from, transform.to);

      if (transform.url.includes('Gallery')) {
        const anchor = 'const lastEvent = ref("");';

        if (!body.includes(anchor)) {
          throw new Error('Diagnostic Vue state anchor changed.');
        }

        body = body.replace(anchor, `${anchor}\nwindow.__drMaskDiagnostic.readVue = () => ({ model: value.value, updates: [...updates.value], status: status.value });`);
        const assignment = /(function handleUpdate\(next\)\s*\{[\s\S]*?value\.value = next;)/;

        if (!assignment.test(body)) {
          throw new Error('Diagnostic Vue update anchor changed.');
        }

        body = body.replace(assignment, '$1 window.__drMaskDiagnostic.record("vue:update:modelValue:after");');
      }

      await route.fulfill({ response, body });
    });
  }
}

export async function diagnosticFill(input: Locator, value: string) {
  if (process.env.DR_MASK_DIAGNOSTICS !== '1') {
    return input.fill(value);
  }

  await input.evaluate((element: HTMLInputElement, entered) => {
    (window as unknown as MaskDiagnosticWindow).__drMaskDiagnostic.record('before-fill', element, { entered });
  }, value);

  await input.fill(value);

  await input.evaluate(async (element: HTMLInputElement, moduleURL) => {
    const { recordAfterVue } = await import(moduleURL) as typeof BrowserDiagnostics;
    await recordAfterVue(element, 'after-fill:vue-nextTick');
  }, browserModuleURL);
}

export async function saveMaskDiagnostics(page: Page, testInfo: TestInfo, label: string) {
  const records = await page.evaluate(() => (window as unknown as MaskDiagnosticWindow).__drMaskDiagnostic.records);
  const path = testInfo.outputPath(`${label}.json`);
  await writeFile(path, JSON.stringify(records, null, 2));
  await testInfo.attach(label, { path, contentType: 'application/json' });
}

export async function saveMaskRuntime(page: Page, testInfo: TestInfo) {
  const session = await page.context().browser()?.newBrowserCDPSession();

  if (session == null) {
    throw new Error('Masked input diagnostics require Chromium.');
  }

  try {
    const runtime = {
      environment: Object.fromEntries([
        'CI', 'GITHUB_ACTIONS', 'RUNNER_OS', 'RUNNER_ARCH', 'DISPLAY', 'WAYLAND_DISPLAY',
        'LANG', 'LC_ALL', 'TZ', 'NODE_OPTIONS', 'PLAYWRIGHT_BROWSERS_PATH', 'DR_MASK_DIAGNOSTICS',
      ].map((key) => [key, process.env[key] ?? null])),
      chromium: await session.send('Browser.getVersion'),
      commandLine: await session.send('Browser.getBrowserCommandLine').catch((error: unknown) => ({
        unavailable: String(error),
        source: 'Actual launch command is recorded by DEBUG=pw:browser in targeted.log.',
      })),
      workers: testInfo.config.workers,
      project: testInfo.project.name,
      use: testInfo.project.use,
      webServer: testInfo.config.webServer,
      node: process.version,
    };

    const path = testInfo.outputPath('runtime.json');
    await writeFile(path, JSON.stringify(runtime, null, 2));
    await testInfo.attach('runtime', { path, contentType: 'application/json' });
  } finally {
    await session.detach();
  }
}

// Run after the existing scenario, including when its assertion fails. Fresh pages
// isolate controls from one another and leave the original scenario untouched.
export async function compareNativeMask(page: Page, baseURL: string, testInfo: TestInfo) {
  for (const source of ['native-imask', 'dr-front']) {
    for (const action of ['fill', 'sequential']) {
      const comparison = await page.context().newPage();
      const label = `${source}-${action}`;

      try {
        await installMaskDiagnostics(comparison);
        await comparison.goto(baseURL);
        await comparison.waitForFunction(() => document.documentElement.dataset.hostReady === 'true');

        if (source === 'native-imask') {
          await comparison.evaluate(async (moduleURL) => {
            const { mountNativeMask } = await import(moduleURL) as typeof BrowserDiagnostics;
            mountNativeMask();
          }, browserModuleURL);
        } else {
          await comparison.evaluate(async () => {
            await (window as unknown as HostWindow).mount({
              story: 'forms/components/DrMaskedInput/DrMaskedInputGallery', props: { externalValue: '123456' },
            });
          });
        }

        const input = source === 'native-imask'
          ? comparison.locator('#native-mask')
          : comparison.getByRole('textbox', { name: 'Code', exact: true });

        if (action === 'fill') {
          await diagnosticFill(input, '654321');
        } else {
          await input.evaluate((element: HTMLInputElement) => {
            (window as unknown as MaskDiagnosticWindow).__drMaskDiagnostic.record('before-sequential', element);
          });

          await input.press('ControlOrMeta+A');
          await input.pressSequentially('654321');

          await input.evaluate(async (element: HTMLInputElement, moduleURL) => {
            const { recordAfterVue } = await import(moduleURL) as typeof BrowserDiagnostics;
            await recordAfterVue(element, 'after-sequential:vue-nextTick');
          }, browserModuleURL);
        }

        await comparison.screenshot({ path: testInfo.outputPath(`${label}.png`) });
      } finally {
        await saveMaskDiagnostics(comparison, testInfo, label);
        await comparison.close();
      }
    }
  }
}
