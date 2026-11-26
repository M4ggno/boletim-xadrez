import * as yup from 'yup';

const idValido = yup
  .string()
  .matches(/^[a-f\d]{24}$/i, 'Identificador inválido.')
  .required('Campo obrigatório.');

export const inscricaoSchema = yup.object({
  torneioId: idValido,
  jogadorId: idValido,
});

export type InscricaoForm = yup.InferType<typeof inscricaoSchema>;
