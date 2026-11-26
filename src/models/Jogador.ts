import { model, models, Schema, type Model, type Types } from 'mongoose';
import { CATEGORIAS_JOGADOR, type CategoriaJogador } from '@/types/dominio';

export { CATEGORIAS_JOGADOR };
export type { CategoriaJogador };

export interface IJogador {
  nome: string;
  rating: number;
  categoria: CategoriaJogador;
  clube?: string;
  ativo: boolean;
  usuarioId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JogadorSchema = new Schema<IJogador>(
  {
    nome: {
      type: String,
      required: [true, 'Informe o nome do jogador.'],
      trim: true,
      minlength: [2, 'O nome deve ter pelo menos 2 caracteres.'],
      maxlength: [80, 'O nome pode ter no máximo 80 caracteres.'],
    },
    rating: {
      type: Number,
      default: 1200,
      min: [0, 'O rating não pode ser negativo.'],
      max: [3000, 'O rating não pode ultrapassar 3000.'],
    },
    categoria: {
      type: String,
      enum: [...CATEGORIAS_JOGADOR],
      default: 'Iniciante',
    },
    clube: {
      type: String,
      trim: true,
      maxlength: [80, 'O clube pode ter no máximo 80 caracteres.'],
    },
    ativo: {
      type: Boolean,
      default: true,
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

JogadorSchema.index({ usuarioId: 1, nome: 1 });

export const Jogador = (models.Jogador as Model<IJogador>) || model<IJogador>('Jogador', JogadorSchema);

export default Jogador;
