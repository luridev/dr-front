import { dictionaries } from '@/configuration/config';
import type {
  DrConfigContext, DrMessageKey, DrTranslate, DrTranslationRequest, MessageArguments,
} from '@/configuration/types';

export function createTranslator(context: DrConfigContext): DrTranslate {
  return <K extends DrMessageKey>(key: K, ...args: MessageArguments<K>) => {
    const { language, translators } = context.value;

    if (!Object.hasOwn(dictionaries[language], key)) {
      throw new Error(`Dr Front: unknown message "${key}".`);
    }

    const request = (args.length === 0
      ? { language, key }
      : { language, key, params: args[0] }) as DrTranslationRequest;

    for (const translate of translators) {
      const result = translate(request);

      if (result !== undefined) {
        return result;
      }
    }

    const message = dictionaries[language][key] as (...params: MessageArguments<K>) => string;

    return message(...args);
  };
}
