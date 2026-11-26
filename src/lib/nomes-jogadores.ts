import { Types } from 'mongoose';
import Jogador from '@/models/Jogador';

/** Busca os nomes dos jogadores do próprio organizador em uma única consulta. */
export async function buscarNomesJogadores(ids: string[], usuarioId: string) {
  const validos = [...new Set(ids)].filter((id) => Types.ObjectId.isValid(id));
  if (validos.length === 0) return new Map<string, string>();

  const jogadores = await Jogador.find({
    _id: { $in: validos.map((id) => new Types.ObjectId(id)) },
    usuarioId: new Types.ObjectId(usuarioId),
  })
    .select('nome')
    .lean();

  return new Map(jogadores.map((jogador) => [String(jogador._id), jogador.nome]));
}
