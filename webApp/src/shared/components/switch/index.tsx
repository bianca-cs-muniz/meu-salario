import type { ChangeEvent, FC } from 'react';
import { FormControlLabelCustomizado, Label, SwitchCustomizado } from './styles';

interface IInputSwitche {
  checked: boolean;
  disabled?: boolean;
  label: string;
  className?: string;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const InputSwitche: FC<IInputSwitche> = ({ checked, handleChange, label, className, disabled }) => {
  return (
    <FormControlLabelCustomizado className={className}>
      <SwitchCustomizado onChange={handleChange} checked={checked} disabled={disabled} />
      {label && <Label>{label}</Label>}
    </FormControlLabelCustomizado>
  );
};
