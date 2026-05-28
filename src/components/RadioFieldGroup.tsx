import { FormGroup, Radio } from '@patternfly/react-core';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}

interface RadioFieldGroupProps<T extends string> {
  label: string;
  fieldId: string;
  value: T | null;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  isRequired?: boolean;
}

export function RadioFieldGroup<T extends string>({
  label,
  fieldId,
  value,
  options,
  onChange,
  isRequired,
}: RadioFieldGroupProps<T>) {
  return (
    <FormGroup label={label} fieldId={fieldId} isRequired={isRequired}>
      {options.map((opt) => (
        <Radio
          key={opt.value}
          id={`${fieldId}-${opt.value}`}
          name={fieldId}
          label={
            opt.disabled && opt.disabledReason
              ? `${opt.label} (${opt.disabledReason})`
              : opt.label
          }
          isChecked={value === opt.value}
          isDisabled={opt.disabled}
          className={opt.disabled ? 'os-option-disabled' : undefined}
          onChange={() => onChange(opt.value)}
        />
      ))}
    </FormGroup>
  );
}
