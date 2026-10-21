import { Container } from './styles';

export const MensagemErro = ({ texto }: { texto?: string | null }) => {
  if (!texto) return null;
  return (
    <Container component="p" role="alert">
      {texto}
    </Container>
  );
};
