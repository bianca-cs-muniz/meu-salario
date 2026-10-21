/**
 * Gera uma feature CRUD no front seguindo o padrão do projeto.
 *
 * Uso:  npm run create:feature <nomeDaFeature> [rotaDaApi]
 * Ex.:  npm run create:feature produto            → consome /produto
 *       npm run create:feature itemPedido         → consome /item-pedido
 */
import fs from 'fs/promises';
import path from 'path';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const [nome, rotaApiArg] = process.argv.slice(2);

if (!nome || !/^[a-z][a-zA-Z0-9]*$/.test(nome)) {
  console.error('Uso: npm run create:feature <nomeEmCamelCase> [rotaDaApi]');
  process.exit(1);
}

const Nome = capitalize(nome);
const rotaApi = rotaApiArg ?? `/${kebab(nome)}`;
const base = path.join(process.cwd(), 'src', 'features', nome);

try {
  await fs.access(base);
  console.error(`❌ Feature "${nome}" já existe.`);
  process.exit(1);
} catch { /* não existe, segue */ }

const arquivos = {
  /* ---------- SERVICE ---------- */
  'services/index.tsx': `
import { httpClient } from '@services/httpClient';

export interface I${Nome} {
  id: number;
  nome: string;
  created_at: string;
}

export type Criar${Nome}Dto = Omit<I${Nome}, 'id' | 'created_at'>;
export type Editar${Nome}Dto = Partial<Criar${Nome}Dto>;

class ${Nome}Service {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '${rotaApi}';
  }

  async buscar(): Promise<I${Nome}[]> {
    const { data } = await this.httpClient.get<I${Nome}[]>(this.path);
    return data;
  }

  async buscarPorId(id: number): Promise<I${Nome}> {
    const { data } = await this.httpClient.get<I${Nome}>(\`\${this.path}/\${id}\`);
    return data;
  }

  async criar(dto: Criar${Nome}Dto): Promise<I${Nome}> {
    const { data } = await this.httpClient.post<I${Nome}>(this.path, dto);
    return data;
  }

  async editar(id: number, dto: Editar${Nome}Dto): Promise<I${Nome}> {
    const { data } = await this.httpClient.put<I${Nome}>(\`\${this.path}/\${id}\`, dto);
    return data;
  }

  async deletar(id: number): Promise<void> {
    await this.httpClient.delete(\`\${this.path}/\${id}\`);
  }
}

export default new ${Nome}Service();
`,

  /* ---------- QUERIES (TanStack) ---------- */
  'hooks/queryes.tsx': `
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { snackBar } from '@utils/SnackBar';
import type { IAxiosError } from '@services/httpClient';
import ${nome}Service, { type Criar${Nome}Dto, type Editar${Nome}Dto } from '../services';

const QUERY_KEY = ['${nome}'];

const erro = (error: IAxiosError, padrao: string) =>
  snackBar(error?.response?.data?.error ?? padrao, 'error');

export const use${Nome}Lista = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => ${nome}Service.buscar(),
  });

  return { lista: data, estaCarregando: isLoading };
};

export const use${Nome}PorId = (id?: number) => {
  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => ${nome}Service.buscarPorId(id!),
    enabled: !!id,
  });

  return { item: data, estaCarregando: isLoading };
};

export const use${Nome}Mutacoes = () => {
  const queryClient = useQueryClient();
  const invalidar = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const criar = useMutation({
    mutationFn: (dto: Criar${Nome}Dto) => ${nome}Service.criar(dto),
    onSuccess: () => { snackBar('Criado com sucesso', 'success'); invalidar(); },
    onError: (e: IAxiosError) => erro(e, 'Erro ao criar'),
  });

  const editar = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Editar${Nome}Dto }) => ${nome}Service.editar(id, dto),
    onSuccess: () => { snackBar('Salvo com sucesso', 'success'); invalidar(); },
    onError: (e: IAxiosError) => erro(e, 'Erro ao salvar'),
  });

  const deletar = useMutation({
    mutationFn: (id: number) => ${nome}Service.deletar(id),
    onSuccess: () => { snackBar('Removido com sucesso', 'success'); invalidar(); },
    onError: (e: IAxiosError) => erro(e, 'Erro ao remover'),
  });

  return {
    criar: criar.mutateAsync,
    estaCriando: criar.isPending,
    editar: editar.mutateAsync,
    estaEditando: editar.isPending,
    deletar: deletar.mutateAsync,
    estaDeletando: deletar.isPending,
  };
};
`,

  /* ---------- FORMULÁRIO (RHF + Zod) ---------- */
  'hooks/index.tsx': `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { use${Nome}Mutacoes } from './queryes';

const ${Nome}Schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório *'),
});

export type ${Nome}Form = z.infer<typeof ${Nome}Schema>;

export const use${Nome}Formulario = (onFechar?: () => void) => {
  const { criar, estaCriando } = use${Nome}Mutacoes();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<${Nome}Form>({
    resolver: zodResolver(${Nome}Schema),
  });

  const handleSalvar = handleSubmit(async (dados) => {
    await criar(dados);
    reset();
    onFechar?.();
  });

  return { register, control, errors, handleSalvar, estaCriando };
};
`,

  /* ---------- PÁGINA ---------- */
  'pages/styles.tsx': `
import { Box, styled } from '@mui/material';

export const Corpo = styled(Box)\`
  padding: 32px;
  gap: 32px;
  display: flex;
  flex-direction: column;
  width: 100%;
\`;
`,

  'pages/index.tsx': `
import { useState } from 'react';
import { ModalCustomizado } from '@shared/components/modal';
import { Cabecalho } from '../components/cabecalho';
import { Lista } from '../components/lista';
import { Novo } from '../components/novo';
import { Corpo } from './styles';

export const ${Nome}Pagina = () => {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <Corpo>
      <Cabecalho onNovo={() => setModalAberto(true)} />
      <Lista />

      <ModalCustomizado open={modalAberto} onClose={() => setModalAberto(false)} title="Novo">
        <Novo onFechar={() => setModalAberto(false)} />
      </ModalCustomizado>
    </Corpo>
  );
};
`,

  /* ---------- CABEÇALHO ---------- */
  'components/cabecalho/styles.tsx': `
import { Box, styled } from '@mui/material';

export const Container = styled(Box)\`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 16px;

  .textos {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .botao {
    width: 200px;
  }
\`;
`,

  'components/cabecalho/index.tsx': `
import { Plus } from 'lucide-react';
import { Tipografias } from '@shared/components/tipografias';
import { BotaoCustomizado } from '@shared/components/botao';
import { Container } from './styles';

export const Cabecalho = ({ onNovo }: { onNovo: () => void }) => {
  return (
    <Container>
      <div className="textos">
        <Tipografias.Titulo>${Nome}</Tipografias.Titulo>
        <Tipografias.Legenda>Gerencie os registros de ${nome}</Tipografias.Legenda>
      </div>
      <div className="botao">
        <BotaoCustomizado.BotaoPrimario titulo="Novo" startIcon={<Plus size={20} />} onClick={onNovo} />
      </div>
    </Container>
  );
};
`,

  /* ---------- LISTA ---------- */
  'components/lista/index.tsx': `
import { Trash2, FileText } from 'lucide-react';
import { IconButton } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { CardsComponent } from '@shared/components/cards';
import { Tipografias } from '@shared/components/tipografias';
import { BackDropCustomizado } from '@shared/components/backDrop';
import { use${Nome}Lista, use${Nome}Mutacoes } from '../../hooks/queryes';

export const Lista = () => {
  const { lista, estaCarregando } = use${Nome}Lista();
  const { deletar } = use${Nome}Mutacoes();
  const confirmar = useConfirm();

  const handleDeletar = async (id: number) => {
    const { confirmed } = await confirmar({
      title: 'Remover registro?',
      description: 'Essa ação não pode ser desfeita.',
      confirmationText: 'Remover',
      cancellationText: 'Cancelar',
    });
    if (confirmed) await deletar(id);
  };

  return (
    <>
      <BackDropCustomizado aberto={estaCarregando} />
      <CardsComponent
        emptyState={<Tipografias.Legenda>Nenhum registro encontrado.</Tipografias.Legenda>}
        items={lista.map((item) => ({
          label: item.nome,
          icon: <FileText size={18} />,
          legenda: (
            <Tipografias.LegendaSimples>
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </Tipografias.LegendaSimples>
          ),
          botao: (
            <IconButton onClick={() => handleDeletar(item.id)}>
              <Trash2 size={18} color="#EB000B" />
            </IconButton>
          ),
        }))}
      />
    </>
  );
};
`,

  /* ---------- NOVO (formulário no modal) ---------- */
  'components/novo/styles.tsx': `
import { Box, styled } from '@mui/material';

export const Formulario = styled(Box)\`
  display: flex;
  flex-direction: column;
  gap: 16px;
\`;

export const ContainerBotao = styled(Box)\`
  display: flex;
  gap: 12px;
  margin-top: 8px;
\`;
`,

  'components/novo/index.tsx': `
import { Plus } from 'lucide-react';
import { InputCustomizado } from '@shared/components/input';
import { BotaoCustomizado } from '@shared/components/botao';
import { use${Nome}Formulario } from '../../hooks';
import { ContainerBotao, Formulario } from './styles';

export const Novo = ({ onFechar }: { onFechar: () => void }) => {
  const { register, errors, handleSalvar, estaCriando } = use${Nome}Formulario(onFechar);

  return (
    <Formulario>
      <InputCustomizado.InputComum
        label="Nome *"
        placeholder="Digite o nome"
        {...register('nome')}
        error={!!errors.nome}
        helperText={errors.nome?.message}
      />

      <ContainerBotao>
        <BotaoCustomizado.BotaoSecundario titulo="Cancelar" onClick={onFechar} />
        <BotaoCustomizado.BotaoPrimario
          titulo={estaCriando ? 'Salvando...' : 'Salvar'}
          startIcon={<Plus size={20} />}
          disabled={estaCriando}
          onClick={handleSalvar}
        />
      </ContainerBotao>
    </Formulario>
  );
};
`,
};

for (const [arquivo, conteudo] of Object.entries(arquivos)) {
  const destino = path.join(base, arquivo);
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, conteudo.trimStart());
}

const CONST = kebab(nome).replace(/-/g, '_').toUpperCase();
console.log(`✅ Feature "${nome}" criada em src/features/${nome}`);
console.log('👉 Próximos passos:');
console.log(`   1. src/constants/rotas.ts      → ${CONST}: '/${kebab(nome)}',`);
console.log(`   2. src/Router/index.tsx        → <Route path={rotas.${CONST}} element={<${Nome}Pagina />} />`);
console.log(`      import { ${Nome}Pagina } from '@features/${nome}/pages';`);
console.log('   3. barraLateral/index.tsx     → adicione o item no array "itens"');
console.log(`   4. Ajuste a interface I${Nome} e os campos do formulário.`);
