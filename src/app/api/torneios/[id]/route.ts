import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { toTorneioDTO } from '@/lib/serializers';
import { validarPayload } from '@/lib/validacao';
import Inscricao from '@/models/Inscricao';
import Partida from '@/models/Partida';
import Rodada from '@/models/Rodada';
import Torneio from '@/models/Torneio';
import { torneioAtualizacaoSchema } from '@/schemas/torneio';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    const documento = await buscarDoUsuario(Torneio, id, usuarioId);
    return NextResponse.json(toTorneioDTO(documento));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    const corpo: unknown = await request.json();
    const dados = await validarPayload(torneioAtualizacaoSchema, corpo);
    await dbConnect();

    await buscarDoUsuario(Torneio, id, usuarioId);

    const atualizado = await Torneio.findByIdAndUpdate(
      id,
      { $set: dados },
      { new: true, runValidators: true },
    ).lean();

    if (!atualizado) {
      return NextResponse.json({ erro: 'Torneio não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(toTorneioDTO(atualizado));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    await buscarDoUsuario(Torneio, id, usuarioId);

    await Promise.all([
      Partida.deleteMany({ torneioId: id, usuarioId }),
      Rodada.deleteMany({ torneioId: id, usuarioId }),
      Inscricao.deleteMany({ torneioId: id, usuarioId }),
    ]);
    await Torneio.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (erro) {
    return responderErro(erro);
  }
}
