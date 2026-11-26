import { model, models, Schema, type Model, type Types } from 'mongoose';

export interface IInscricao {
  torneioId: Types.ObjectId;
  jogadorId: Types.ObjectId;
  confirmada: boolean;
  dataInscricao: Date;
  usuarioId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InscricaoSchema = new Schema<IInscricao>(
  {
    torneioId: {
      type: Schema.Types.ObjectId,
      ref: 'Torneio',
      required: true,
      index: true,
    },
    jogadorId: {
      type: Schema.Types.ObjectId,
      ref: 'Jogador',
      required: true,
      index: true,
    },
    confirmada: {
      type: Boolean,
      default: true,
    },
    dataInscricao: {
      type: Date,
      default: Date.now,
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

InscricaoSchema.index({ torneioId: 1, jogadorId: 1 }, { unique: true });

export const Inscricao =
  (models.Inscricao as Model<IInscricao>) || model<IInscricao>('Inscricao', InscricaoSchema);

export default Inscricao;
