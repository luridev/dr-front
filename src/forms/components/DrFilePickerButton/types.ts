export type DrFilePickerButtonProps = {
  accept?: string;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
};

export type DrFilePickerButtonEmits = {
  select: [file: File];
};
