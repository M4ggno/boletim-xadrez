import { NextResponse, type NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { toJogadorDTO, toPartidaDTO } from '@/lib/serializers';
import Inscricao from '@/models/Inscricao';
import Jogador from '@/models/Jogador';
import Partida from '@/models/Partida';
import Torneio from '@/models/Torneio';
import { calcularClassificacao } from '@/services/classificacao';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    await buscarDoUsuario(Torneio, id, usuarioId);

    const inscricoes = await Inscricao.find({
      torneioId: new Types.ObjectId(id),
      usuarioId: new Types.ObjectId(usuarioId),
    })
      .select('jogadorId')
      .lean();

    const idsJogadores = inscricoes.map((inscricao) => inscricao.jogadorId);

    const [jogadores, partidas] = await Promise.all([
      Jogador.find({ _id: { $in: idsJogadores }, usuarioId: new Types.ObjectId(usuarioId) }).lean(),
      Partida.find({
        torneioId: new Types.ObjectId(id),
        usuarioId: new Types.ObjectId(usuarioId),
      }).lean(),
    ]);

    return NextResponse.json(
      calcularClassificacao(jogadores.map(toJogadorDTO), partidas.map(toPartidaDTO)),
    );
  } catch (erro) {
    return responderErro(erro);
  }
}
