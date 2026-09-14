export type DateInputStatus = 'empty' | 'incomplete' | 'invalid' | 'out-of-range' | 'valid';

export type DateInputParseResult =
  | {
    status: Exclude<DateInputStatus, 'valid'>;
  }
  | {
    status: 'valid';
    value: Temporal.PlainDate;
  };
