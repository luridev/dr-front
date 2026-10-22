export type InputLocaleDatePart = 'day' | 'month' | 'year';

export type InputLocaleProfile = Readonly<{
  number: Readonly<{
    group: string;
    decimal: string;
  }>;
  date: Readonly<{
    order: readonly [InputLocaleDatePart, InputLocaleDatePart, InputLocaleDatePart];
    separators: readonly [string, string];
  }>;
  time: Readonly<{
    hourCycle: 12 | 24;
    dayPeriods: Readonly<{ am: string; pm: string }> | null;
  }>;
}>;
