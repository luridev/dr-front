export type DrInputNativeAttributesProps = {
  overrideAttrs?: boolean;
};

export type DrInputNativeAttributesField = 'plain' | 'masked' | 'number' | 'date' | 'time';

export type DrInputNativeAttributesFocus = {
  field: DrInputNativeAttributesField;
  native: boolean;
  fromInput: boolean;
};
