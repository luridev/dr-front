export type IntegerInputStatus = 'empty' | 'incomplete' | 'invalid' | 'out-of-range' | 'valid';

export type IntegerInputParseResult =
  | {
    status: Exclude<IntegerInputStatus, 'valid'>;
  }
  | {
    status: 'valid';
    value: number;
  };
