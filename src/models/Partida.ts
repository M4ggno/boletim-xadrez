import { model, models, Schema, type Model, type Types } from 'mongoose';
import { RESULTADOS_PARTIDA, type ResultadoPartida } from '@/types/dominio';

export { RESULTADOS_PARTIDA };
export type { ResultadoPartida };

export interface IPartida {
  rodadaId: Types.ObjectId;
  torneioId: Types.ObjectId;
  brancasId: Types.ObjectId;
  pretasId: Types.ObjectId;
  resultado: ResultadoPartida;
  registradaEm?: Date;
  usuarioId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PartidaSchema = new Schema<IPartida>(
  {
    rodadaId: {
      type: Schema.Types.ObjectId,
      ref: 'Rodada',
      required: true,
      index: true,
    },
    torneioId: {
      type: Schema.Types.ObjectId,
      ref: 'Torneio',
      required: true,
      index: true,
    },
    brancasId: {
      type: Schema.Types.ObjectId,
      ref: 'Jogador',
      required: true,
    },
    pretasId: {
      type: Schema.Types.ObjectId,
      ref: 'Jogador',
      required: true,
    },
    resultado: {
      type: String,
      enum: [...RESULTADOS_PARTIDA],
      default: 'Pendente',
      index: true,
    },
    registradaEm: {
      type: Date,
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

PartidaSchema.index({ rodadaId: 1, brancasId: 1 }, { unique: true });
PartidaSchema.index({ rodadaId: 1, pretasId: 1 }, { unique: true });

PartidaSchema.pre('validate', async function () {
  const participantes = [this.brancasId, this.pretasId];

  if (String(this.brancasId) === String(this.pretasId)) {
    this.invalidate('pretasId', 'O adversário precisa ser diferente do jogador das brancas.');
    return;
  }

  const jaTemPartida = await Partida.exists({
    rodadaId: this.rodadaId,
    _id: { $ne: this._id },
    $or: [
      { brancasId: { $in: participantes } },
      { pretasId: { $in: participantes } },
    ],
  });

  if (jaTemPartida) {
    this.invalidate('brancasId', 'Um desses jogadores já tem partida nesta rodada.');
  }
});

export const Partida = (models.Partida as Model<IPartida>) || model<IPartida>('Partida', PartidaSchema);

export default Partida;
