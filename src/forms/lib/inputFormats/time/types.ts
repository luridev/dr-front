export type TimeInputSmallestUnit = 'minute' | 'second' | 'millisecond' | 'microsecond' | 'nanosecond';

export type TimeInputStatus = 'empty' | 'incomplete' | 'invalid' | 'valid';

export type TimeInputParseResult =
  | {
    status: Exclude<TimeInputStatus, 'valid'>;
  }
  | {
    status: 'valid';
    value: Temporal.PlainTime;
  };
