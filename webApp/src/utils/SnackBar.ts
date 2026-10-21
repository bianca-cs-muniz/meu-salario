import { type BaseVariant, enqueueSnackbar } from 'notistack';

export const snackBar = (mensagem: string, variante: BaseVariant, tempoDeDuracao = 3800) => {
  enqueueSnackbar(mensagem, { variant: variante, autoHideDuration: tempoDeDuracao });
};
