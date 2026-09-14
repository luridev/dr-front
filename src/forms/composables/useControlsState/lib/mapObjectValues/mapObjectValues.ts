export function mapObjectValues<TObject extends Record<string, unknown>, TValue>(
  object: TObject,
  mapValue: <TKey extends keyof TObject>(key: TKey, value: TObject[TKey]) => TValue,
): {
  [TKey in keyof TObject]: TValue;
} {
  const result = {} as {
    [TKey in keyof TObject]: TValue;
  };

  for (const key of Object.keys(object) as Array<keyof TObject>) {
    result[key] = mapValue(key, object[key]);
  }

  return result;
}
