import { model, models, Schema, type Model, type Types } from 'mongoose';
import { STATUS_RODADA, type StatusRodada } from '@/types/dominio';

export { STATUS_RODADA };
export type { StatusRodada };

export interface IRodada {
  torneioId: Types.ObjectId;
  numero: number;
  status: StatusRodada;
  usuarioId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RodadaSchema = new Schema<IRodada>(
  {
    torneioId: {
      type: Schema.Types.ObjectId,
      ref: 'Torneio',
      required: true,
      index: true,
    },
    numero: {
      type: Number,
      required: [true, 'Informe o número da rodada.'],
      min: [1, 'A rodada deve começar em 1.'],
      max: [20, 'Não é possível passar da rodada 20.'],
    },
    status: {
      type: String,
      enum: [...STATUS_RODADA],
      default: 'Rascunho',
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

RodadaSchema.index({ torneioId: 1, numero: 1 }, { unique: true });

export const Rodada = (models.Rodada as Model<IRodada>) || model<IRodada>('Rodada', RodadaSchema);

export default Rodada;
