import { renderToString } from 'vue/server-renderer';
import { createLocalizationApp } from '~/tests/localization/app.support';
import type { LocalizationOptions } from '~/tests/localization/types.support';

export async function renderLocalization(options: LocalizationOptions) {
  const { app, state } = createLocalizationApp(options);
  const warnings: Array<string> = [];

  app.config.warnHandler = (message) => {
    warnings.push(message);
  };

  const html = await renderToString(app);

  return {
    html,
    warnings,
    updates: [state.numberUpdates, state.dateUpdates, state.timeUpdates, state.maskedUpdates],
    textareaUpdates: state.textareaUpdates,
  };
}
