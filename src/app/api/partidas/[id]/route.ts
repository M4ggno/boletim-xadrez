import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { toPartidaDTO } from '@/lib/serializers';
import { ErroValidacao, validarPayload } from '@/lib/validacao';
import Partida from '@/models/Partida';
import Rodada from '@/models/Rodada';
import { resultadoSchema } from '@/schemas/partida';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    const documento = await buscarDoUsuario(Partida, id, usuarioId);
    return NextResponse.json(toPartidaDTO(documento));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    const corpo: unknown = await request.json();
    const dados = await validarPayload(resultadoSchema, corpo);
    await dbConnect();

    const partida = await buscarDoUsuario(Partida, id, usuarioId);
    const rodada = await buscarDoUsuario(Rodada, String(partida.rodadaId), usuarioId);
    if (rodada.status === 'Encerrada') {
      throw new ErroValidacao('Esta rodada já foi encerrada.');
    }

    const atualizada = await Partida.findByIdAndUpdate(
      id,
      {
        $set: {
          resultado: dados.resultado,
          registradaEm: dados.resultado === 'Pendente' ? null : new Date(),
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!atualizada) {
      return NextResponse.json({ erro: 'Partida não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(toPartidaDTO(atualizada));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    await buscarDoUsuario(Partida, id, usuarioId);
    await Partida.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (erro) {
    return responderErro(erro);
  }
}
