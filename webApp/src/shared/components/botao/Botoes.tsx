import type { ReactNode } from 'react';
import { Fantasma, Grupo, Perigo, Primario, Secundario } from './styles';

interface IBotao {
  titulo?: ReactNode;
  children?: ReactNode;
  /** Mostra "Salvando…" e desabilita o botão. */
  carregando?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  startIcon?: ReactNode;
  larguraTotal?: boolean;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

const conteudo = ({ titulo, children, carregando, startIcon }: IBotao) =>
  carregando ? 'Salvando…' : (
    <>
      {startIcon}
      {titulo ?? children}
    </>
  );

const classes = ({ larguraTotal, className }: IBotao, extra?: string) =>
  [larguraTotal ? 'larguraTotal' : '', extra ?? '', className ?? ''].filter(Boolean).join(' ') || undefined;

export const BotaoPrimario = (props: IBotao) => (
  <Primario
    type={props.type ?? 'button'}
    disabled={props.disabled || props.carregando}
    onClick={props.onClick}
    className={classes(props)}
    aria-label={props['aria-label']}
  >
    {conteudo(props)}
  </Primario>
);

export const BotaoSecundario = (props: IBotao) => (
  <Secundario
    type={props.type ?? 'button'}
    disabled={props.disabled || props.carregando}
    onClick={props.onClick}
    className={classes(props)}
    aria-label={props['aria-label']}
  >
    {conteudo(props)}
  </Secundario>
);

/** Botão só com texto. `perigo` deixa o texto na cor de alerta (ex.: Excluir). */
export const BotaoFantasma = ({ perigo, ...props }: IBotao & { perigo?: boolean }) => (
  <Fantasma
    type={props.type ?? 'button'}
    disabled={props.disabled || props.carregando}
    onClick={props.onClick}
    className={classes(props, perigo ? 'perigo' : '')}
    aria-label={props['aria-label']}
  >
    {conteudo(props)}
  </Fantasma>
);

export const BotaoPerigo = (props: IBotao) => (
  <Perigo
    type={props.type ?? 'button'}
    disabled={props.disabled || props.carregando}
    onClick={props.onClick}
    className={classes(props)}
    aria-label={props['aria-label']}
  >
    {conteudo(props)}
  </Perigo>
);

interface IBotaoGrupo {
  children: ReactNode;
  /** `fim`: alinha à direita a partir de sm. `entre`: empilha no celular e separa nas pontas a partir de sm. */
  alinhamento?: 'inicio' | 'fim' | 'entre';
}

export const BotaoGrupo = ({ children, alinhamento = 'inicio' }: IBotaoGrupo) => (
  <Grupo className={alinhamento}>{children}</Grupo>
);
