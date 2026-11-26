import * as yup from 'yup';
import { RESULTADOS_PARTIDA } from '@/types/dominio';

const idValido = yup
  .string()
  .matches(/^[a-f\d]{24}$/i, 'Identificador inválido.')
  .required('Campo obrigatório.');

export const partidaSchema = yup.object({
  rodadaId: idValido,
  torneioId: idValido,
  brancasId: idValido,
  pretasId: idValido,
  resultado: yup.string().oneOf([...RESULTADOS_PARTIDA]).default('Pendente'),
});

export const resultadoSchema = yup.object({
  resultado: yup.string().oneOf([...RESULTADOS_PARTIDA]).required('Escolha um resultado.'),
});

export type PartidaForm = yup.InferType<typeof partidaSchema>;
export type ResultadoForm = yup.InferType<typeof resultadoSchema>;
