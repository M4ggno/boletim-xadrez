import * as yup from 'yup';
import { FORMATOS_TORNEIO, STATUS_TORNEIO } from '@/types/dominio';

export const torneioSchema = yup.object({
  nome: yup
    .string()
    .trim()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres.')
    .max(100, 'O nome pode ter no máximo 100 caracteres.')
    .required('Informe o nome do torneio.'),
  local: yup
    .string()
    .trim()
    .min(2, 'Informe o local do torneio.')
    .max(100, 'O local pode ter no máximo 100 caracteres.')
    .required('Informe o local do torneio.'),
  dataInicio: yup.date().typeError('Informe uma data válida.').required('Informe a data de início.'),
  formato: yup.string().oneOf([...FORMATOS_TORNEIO]).default('Suíço'),
  numeroRodadas: yup
    .number()
    .typeError('Informe um número válido.')
    .integer('Use um número inteiro de rodadas.')
    .min(1, 'O torneio precisa ter pelo menos 1 rodada.')
    .max(20, 'O torneio pode ter no máximo 20 rodadas.')
    .required('Informe o número de rodadas.'),
  status: yup.string().oneOf([...STATUS_TORNEIO]).default('Inscrições abertas'),
});

export const torneioAtualizacaoSchema = torneioSchema.partial();

/** O input type="date" entrega uma string; a API/action recebe um Date. */
export const torneioFormSchema = yup.object({
  nome: yup
    .string()
    .trim()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres.')
    .max(100, 'O nome pode ter no máximo 100 caracteres.')
    .required('Informe o nome do torneio.'),
  local: yup
    .string()
    .trim()
    .min(2, 'Informe o local do torneio.')
    .max(100, 'O local pode ter no máximo 100 caracteres.')
    .required('Informe o local do torneio.'),
  dataInicio: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.')
    .test('data-real', 'Informe uma data válida.', (valor) => {
      if (!valor) return false;
      const data = new Date(`${valor}T00:00:00`);
      return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
    })
    .required('Informe a data de início.'),
  formato: yup.string().oneOf([...FORMATOS_TORNEIO]).default('Suíço'),
  numeroRodadas: yup
    .number()
    .typeError('Informe um número válido.')
    .integer('Use um número inteiro de rodadas.')
    .min(1, 'O torneio precisa ter pelo menos 1 rodada.')
    .max(20, 'O torneio pode ter no máximo 20 rodadas.')
    .required('Informe o número de rodadas.'),
  status: yup.string().oneOf([...STATUS_TORNEIO]).default('Inscrições abertas'),
});

export type TorneioForm = yup.InferType<typeof torneioFormSchema>;
export type TorneioAtualizacaoForm = yup.InferType<typeof torneioAtualizacaoSchema>;
