import type { ComponentProps, ReactNode } from 'react';
import type { CheckboxProps } from '@mui/material';
import { CaixaMarcacao, ContainerCheckBox, Entrada, Rotulo, Selecao } from './styles';

interface ICampo {
  label?: string;
  dica?: string;
  error?: boolean;
}

/** Campo de texto, e-mail, senha ou data. Aceita `{...register('campo')}`. */
type IInputComum = ComponentProps<'input'> & ICampo & { type?: 'text' | 'email' | 'password' | 'date' };

export const InputComum = ({ label, dica, error, ...props }: IInputComum) => {
  const campo = <Entrada aria-invalid={error || undefined} {...props} />;
  if (!label) return campo;
  return (
    <Rotulo>
      {label}
      {campo}
      {dica && <span className="dica">{dica}</span>}
    </Rotulo>
  );
};

/** Select nativo com o mesmo visual do campo de texto. Opções como `children` (`<option>`). */
type IInputSelecao = ComponentProps<'select'> & ICampo & { children: ReactNode };

export const InputSelecao = ({ label, dica, error, children, ...props }: IInputSelecao) => {
  const campo = (
    <Selecao aria-invalid={error || undefined} {...props}>
      {children}
    </Selecao>
  );
  if (!label) return campo;
  return (
    <Rotulo>
      {label}
      {campo}
      {dica && <span className="dica">{dica}</span>}
    </Rotulo>
  );
};

type IInputCheckBox = CheckboxProps & { label?: string };

export const InputCheckBox = ({ label, ...props }: IInputCheckBox) => (
  <ContainerCheckBox component="label">
    <CaixaMarcacao {...props} />
    {label}
  </ContainerCheckBox>
);
