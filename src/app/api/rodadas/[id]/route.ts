import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { toRodadaDTO } from '@/lib/serializers';
import { ErroValidacao, validarPayload } from '@/lib/validacao';
import Partida from '@/models/Partida';
import Rodada from '@/models/Rodada';
import { rodadaAtualizacaoSchema } from '@/schemas/rodada';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    const documento = await buscarDoUsuario(Rodada, id, usuarioId);
    return NextResponse.json(toRodadaDTO(documento));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    const corpo: unknown = await request.json();
    const dados = await validarPayload(rodadaAtualizacaoSchema, corpo);
    await dbConnect();

    const rodada = await buscarDoUsuario(Rodada, id, usuarioId);

    if (dados.status === 'Encerrada' && rodada.status !== 'Encerrada') {
      const pendentes = await Partida.countDocuments({
        rodadaId: rodada._id,
        resultado: 'Pendente',
        usuarioId,
      });
      if (pendentes > 0) {
        throw new ErroValidacao('Ainda há partidas sem resultado nesta rodada.');
      }
    }

    const atualizada = await Rodada.findByIdAndUpdate(
      id,
      { $set: dados },
      { new: true, runValidators: true },
    ).lean();

    if (!atualizada) {
      return NextResponse.json({ erro: 'Rodada não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(toRodadaDTO(atualizada));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    await buscarDoUsuario(Rodada, id, usuarioId);
    await Partida.deleteMany({ rodadaId: id, usuarioId });
    await Rodada.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (erro) {
    return responderErro(erro);
  }
}
