import { describe, expect, it, vi } from 'vitest';
import { customRef, nextTick, ref, shallowRef } from 'vue';
import { useDrInputTimeModel } from '@/forms/components/DrInputTime/composables/useDrInputTimeModel/useDrInputTimeModel';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { createTestEffectScopeCollector } from '~/tests/vitest/lib/createTestEffectScopeCollector/createTestEffectScopeCollector';
import type * as Vue from 'vue';
import type { ModelRef } from 'vue';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';
import type { TimeInputSmallestUnit, TimeInputStatus } from '@/forms/lib/inputFormats/time/types';

vi.mock('vue', async (importOriginal) => ({
  ...await importOriginal<typeof Vue>(),
  onMounted: (callback: () => void) => { callback(); },
}));

const scopes = createTestEffectScopeCollector();
const fullTime = '23:45:56.123456789';

function setupTime(value: string | null = fullTime, initialUnit: TimeInputSmallestUnit = 'minute') {
  const source = shallowRef(value === null ? null : Temporal.PlainTime.from(value));
  const writes: Array<Temporal.PlainTime | null> = [];

  const model = customRef<Temporal.PlainTime | null>(() => ({
    get: () => source.value,
    set: (next: Temporal.PlainTime | null) => {
      writes.push(next);
      source.value = next;
    },
  })) as ModelRef<Temporal.PlainTime | null>;

  const profile = shallowRef<InputLocaleProfile['time']>(getInputLocaleProfile('en-US').time);
  const smallestUnit = ref(initialUnit);
  const disabled = ref(false);
  const statuses: Array<TimeInputStatus> = [];

  const result = scopes.run(() => useDrInputTimeModel({
    model,
    profile,
    smallestUnit,
    disabled,
    onStatusUpdate: (status) => { statuses.push(status); },
  }));

  return { ...result, source, writes, profile, smallestUnit, disabled, statuses };
}

describe('useDrInputTimeModel', () => {
  it.each([
    ['minute', '11:45'], ['second', '11:45:56'], ['millisecond', '11:45:56.123'],
    ['microsecond', '11:45:56.123456'], ['nanosecond', '11:45:56.123456789'],
  ] as const)('toggles only the hour at %s precision without reformatting text', async (unit, display) => {
    const result = setupTime(fullTime, unit);

    expect(result.inputValue.value).toBe(display);
    expect(result.period.value).toBe('pm');

    result.togglePeriod();
    await nextTick();

    expect(String(result.source.value)).toBe('11:45:56.123456789');
    expect(result.inputValue.value).toBe(display);
    expect(result.period.value).toBe('am');
    expect(result.writes).toHaveLength(1);

    result.togglePeriod();
    await nextTick();

    expect(String(result.source.value)).toBe(fullTime);
    expect(result.inputValue.value).toBe(display);
    expect(result.writes).toHaveLength(2);
    expect(result.statuses).toEqual(['valid']);
  });

  it.each(['11:11:5', '11:11:56.', 'invalid'])(
    'keeps unfinished or invalid text %s through a period change and retains hidden precision',
    async (draft) => {
      const result = setupTime(fullTime, 'second');

      result.updateInputValue(draft);
      await nextTick();
      const status = result.statuses.at(-1);

      expect(result.source.value).toBeNull();
      result.togglePeriod();
      await nextTick();

      expect(result.inputValue.value).toBe(draft);
      expect(result.source.value).toBeNull();
      expect(result.period.value).toBe('am');
      expect(result.statuses.at(-1)).toBe(status);
      expect(result.writes).toEqual([null]);

      result.updateInputValue('11:11:56');
      await nextTick();
      expect(String(result.source.value)).toBe('11:11:56.123456789');
    },
  );

  it('keeps a valid fractional draft unchanged when toggling its period', async () => {
    const result = setupTime(fullTime, 'millisecond');

    result.updateInputValue('11:45:56.1');
    await nextTick();
    result.togglePeriod();
    await nextTick();

    expect(result.inputValue.value).toBe('11:45:56.1');
    expect(String(result.source.value)).toBe('11:45:56.100456789');
  });

  it('does not create a time from an empty field or restore hidden fields after clearing', async () => {
    const result = setupTime();

    result.updateInputValue('');
    await nextTick();
    result.togglePeriod();
    await nextTick();

    expect(result.inputValue.value).toBe('');
    expect(result.source.value).toBeNull();
    expect(result.writes).toEqual([null]);

    result.updateInputValue('12:00');
    await nextTick();
    expect(String(result.source.value)).toBe('00:00:00');
    result.togglePeriod();
    await nextTick();
    expect(String(result.source.value)).toBe('12:00:00');
  });

  it('takes the period and hidden precision from external valid models', async () => {
    const result = setupTime();

    result.source.value = Temporal.PlainTime.from('01:02:03.004005006');
    await nextTick();
    expect(result.period.value).toBe('am');
    expect(result.inputValue.value).toBe('01:02');
    expect(result.writes).toEqual([]);

    result.togglePeriod();
    await nextTick();
    expect(String(result.source.value)).toBe('13:02:03.004005006');
  });

  it('reformats from the same model through locales and precision without model writes', async () => {
    const result = setupTime();
    const original = result.source.value;

    for (const [locale, display] of [['ru-RU', '23:45'], ['en-US', '11:45'], ['en-GB', '23:45']] as const) {
      result.profile.value = getInputLocaleProfile(locale).time;
      await nextTick();
      expect(result.inputValue.value).toBe(display);
      expect(result.source.value).toBe(original);
      expect(result.writes).toEqual([]);
    }

    result.smallestUnit.value = 'nanosecond';
    await nextTick();
    expect(result.inputValue.value).toBe(fullTime);
    expect(result.source.value).toBe(original);
    expect(result.writes).toEqual([]);
  });

  it.each([
    ['millisecond', '123'], ['microsecond', '123456'], ['nanosecond', '123456789'],
  ] as const)('changes the fractional separator at %s precision without writing or rounding the model', async (unit, fraction) => {
    const result = setupTime(fullTime, unit);
    const original = result.source.value;

    for (const [locale, hour, separator] of [
      ['ru-RU', '23', ','], ['en-US', '11', '.'], ['en-GB', '23', '.'], ['ru-RU', '23', ','],
    ] as const) {
      result.profile.value = getInputLocaleProfile(locale).time;
      await nextTick();
      expect(result.inputValue.value).toBe(`${hour}:45:56${separator}${fraction}`);
      expect(result.source.value).toBe(original);
      expect(String(result.source.value)).toBe(fullTime);
      expect(result.period.value).toBe('pm');
      expect(result.writes).toEqual([]);
    }

    result.source.value = Temporal.PlainTime.from('01:02:03.004005006');
    result.smallestUnit.value = 'nanosecond';
    await nextTick();
    expect(result.inputValue.value).toBe('01:02:03,004005006');
    expect(result.period.value).toBe('am');
    expect(result.writes).toEqual([]);
  });

  it('keeps localized short fractions, resets unfinished drafts on separator changes and does not echo models', async () => {
    const result = setupTime(fullTime, 'nanosecond');
    result.profile.value = getInputLocaleProfile('ru-RU').time;
    await nextTick();
    result.updateInputValue('23:45:56,');
    await nextTick();
    expect(result.inputValue.value).toBe('23:45:56,');
    expect(result.source.value).toBeNull();
    expect(result.statuses.at(-1)).toBe('incomplete');

    result.updateInputValue('23:45:56,12');
    await nextTick();
    expect(result.inputValue.value).toBe('23:45:56,12');
    expect(String(result.source.value)).toBe('23:45:56.12');
    expect(result.statuses.at(-1)).toBe('valid');

    result.updateInputValue('23:45:56,');
    await nextTick();
    const writes = result.writes.length;
    result.profile.value = getInputLocaleProfile('en-GB').time;
    await nextTick();
    expect(result.inputValue.value).toBe('');
    expect(result.source.value).toBeNull();
    expect(result.statuses.at(-1)).toBe('empty');
    expect(result.writes).toHaveLength(writes);
  });

  it.each(['minute', 'second'] as const)('preserves a %s draft for equivalent cycles and clears it on a 24h/12h change', async (unit) => {
    const result = setupTime(fullTime, unit);
    result.profile.value = getInputLocaleProfile('ru-RU').time;
    await nextTick();
    expect(result.fractionalSecondSeparator.value).toBe(',');
    result.updateInputValue('23:4');
    await nextTick();
    result.profile.value = getInputLocaleProfile('en-GB').time;
    await nextTick();

    expect(result.fractionalSecondSeparator.value).toBe('.');
    expect(result.inputValue.value).toBe('23:4');
    expect(result.statuses.at(-1)).toBe('incomplete');

    result.profile.value = getInputLocaleProfile('en-US').time;
    await nextTick();
    expect(result.inputValue.value).toBe('');
    expect(result.source.value).toBeNull();
    expect(result.writes).toEqual([null]);
    expect(result.statuses.at(-1)).toBe('empty');
  });

  it('falls back to 24h without day-period labels and blocks period changes when locked', async () => {
    const result = setupTime();
    result.disabled.value = true;
    result.togglePeriod();
    expect(result.period.value).toBe('pm');
    expect(result.writes).toEqual([]);

    result.disabled.value = false;
    result.profile.value = { hourCycle: 12, dayPeriods: null, fractionalSecondSeparator: '.' };
    await nextTick();
    expect(result.hourCycle.value).toBe(24);
    expect(result.inputValue.value).toBe('23:45');
    result.togglePeriod();
    expect(result.writes).toEqual([]);
    result.updateInputValue('00:10');
    await nextTick();
    expect(String(result.source.value)).toBe('00:10:56.123456789');
  });
});
