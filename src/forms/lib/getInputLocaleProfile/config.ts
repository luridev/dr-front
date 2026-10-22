export const inputLocaleDateTimeOptions = {
  calendar: 'gregory',
  numberingSystem: 'latn',
  timeZone: 'UTC',
} as const satisfies Intl.DateTimeFormatOptions;

export const inputLocaleSamples = {
  number: 1234567.89,
  date: Date.UTC(2026, 10, 22),
  am: Date.UTC(2026, 10, 22, 9),
  pm: Date.UTC(2026, 10, 22, 21),
} as const;
