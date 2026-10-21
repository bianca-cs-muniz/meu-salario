export const formatarData = (data: string | Date) => {
  return new Date(data).toLocaleDateString('pt-BR');
};

export const formatarHora = (data: string | Date, soHoraMinuto = false) => {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(soHoraMinuto ? {} : { second: '2-digit' }),
  });
};

export const formatarCelular = (value: string) => {
  value = value.replace(/\D/g, '').slice(0, 11);
  value = value.replace(/^(\d{2})(\d)/, '($1) $2');
  value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');

  return value;
};

export const formatarCep = (value: string) => {
  value = value.replace(/\D/g, '').slice(0, 8);
  value = value.replace(/^(\d{5})(\d)/, '$1-$2');

  return value;
};