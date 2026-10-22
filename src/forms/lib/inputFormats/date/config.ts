let temporalPlainDateMin: Temporal.PlainDate | undefined;
let temporalPlainDateMax: Temporal.PlainDate | undefined;

export function getTemporalPlainDateMin() {
  temporalPlainDateMin ??= Temporal.PlainDate.from({
    year: -271_821,
    month: 4,
    day: 19,
  });

  return temporalPlainDateMin;
}

export function getTemporalPlainDateMax() {
  temporalPlainDateMax ??= Temporal.PlainDate.from({
    year: 275_760,
    month: 9,
    day: 13,
  });

  return temporalPlainDateMax;
}
