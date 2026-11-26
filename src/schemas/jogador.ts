import * as yup from 'yup';
import { CATEGORIAS_JOGADOR } from '@/types/dominio';

export const jogadorSchema = yup.object({
  nome: yup
    .string()
    .trim()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres.')
    .max(80, 'O nome pode ter no máximo 80 caracteres.')
    .required('Informe o nome do jogador.'),
  rating: yup
    .number()
    .typeError('Informe um rating válido.')
    .integer('O rating deve ser um número inteiro.')
    .min(0, 'O rating não pode ser negativo.')
    .max(3000, 'O rating não pode ultrapassar 3000.')
    .default(1200),
  categoria: yup.string().oneOf([...CATEGORIAS_JOGADOR]).default('Iniciante'),
  clube: yup.string().trim().max(80, 'O clube pode ter no máximo 80 caracteres.').default(''),
  ativo: yup.boolean().default(true),
});

export const jogadorAtualizacaoSchema = jogadorSchema.partial();

export type JogadorForm = yup.InferType<typeof jogadorSchema>;
export type JogadorAtualizacaoForm = yup.InferType<typeof jogadorAtualizacaoSchema>;
