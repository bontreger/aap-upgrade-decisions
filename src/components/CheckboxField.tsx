import { Checkbox, FormGroup } from '@patternfly/react-core';

interface CheckboxFieldProps {
  label: string;
  fieldId: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function CheckboxField({
  label,
  fieldId,
  isChecked,
  onChange,
  description,
}: CheckboxFieldProps) {
  return (
    <FormGroup fieldId={fieldId}>
      <Checkbox
        id={fieldId}
        label={label}
        description={description}
        isChecked={isChecked}
        onChange={(_e, checked) => onChange(checked)}
      />
    </FormGroup>
  );
}
