import * as yup from 'yup';
import { STATUS_RODADA } from '@/types/dominio';

export const rodadaSchema = yup.object({
  torneioId: yup
    .string()
    .matches(/^[a-f\d]{24}$/i, 'Identificador inválido.')
    .required('Informe o torneio.'),
  numero: yup
    .number()
    .typeError('Informe um número válido.')
    .integer('Use um número inteiro de rodada.')
    .min(1, 'A rodada deve começar em 1.')
    .max(20, 'Não é possível passar da rodada 20.')
    .required('Informe o número da rodada.'),
  status: yup.string().oneOf([...STATUS_RODADA]).default('Rascunho'),
});

export const rodadaAtualizacaoSchema = rodadaSchema.partial();

export type RodadaForm = yup.InferType<typeof rodadaSchema>;
export type RodadaAtualizacaoForm = yup.InferType<typeof rodadaAtualizacaoSchema>;
