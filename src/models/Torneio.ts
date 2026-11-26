import { model, models, Schema, type Model, type Types } from 'mongoose';
import {
  FORMATOS_TORNEIO,
  STATUS_TORNEIO,
  type FormatoTorneio,
  type StatusTorneio,
} from '@/types/dominio';

export { FORMATOS_TORNEIO, STATUS_TORNEIO };
export type { FormatoTorneio, StatusTorneio };

export interface ITorneio {
  nome: string;
  local: string;
  dataInicio: Date;
  formato: FormatoTorneio;
  numeroRodadas: number;
  status: StatusTorneio;
  usuarioId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TorneioSchema = new Schema<ITorneio>(
  {
    nome: {
      type: String,
      required: [true, 'Informe o nome do torneio.'],
      trim: true,
      minlength: [2, 'O nome deve ter pelo menos 2 caracteres.'],
      maxlength: [100, 'O nome pode ter no máximo 100 caracteres.'],
    },
    local: {
      type: String,
      required: [true, 'Informe o local do torneio.'],
      trim: true,
      maxlength: [100, 'O local pode ter no máximo 100 caracteres.'],
    },
    dataInicio: {
      type: Date,
      required: [true, 'Informe a data de início.'],
    },
    formato: {
      type: String,
      enum: [...FORMATOS_TORNEIO],
      default: 'Suíço',
    },
    numeroRodadas: {
      type: Number,
      required: [true, 'Informe o número de rodadas.'],
      min: [1, 'O torneio precisa ter pelo menos 1 rodada.'],
      max: [20, 'O torneio pode ter no máximo 20 rodadas.'],
    },
    status: {
      type: String,
      enum: [...STATUS_TORNEIO],
      default: 'Inscrições abertas',
      index: true,
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const Torneio = (models.Torneio as Model<ITorneio>) || model<ITorneio>('Torneio', TorneioSchema);

export default Torneio;
