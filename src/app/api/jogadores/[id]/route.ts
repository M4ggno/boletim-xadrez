import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { toJogadorDTO } from '@/lib/serializers';
import { validarPayload } from '@/lib/validacao';
import Jogador from '@/models/Jogador';
import { jogadorAtualizacaoSchema } from '@/schemas/jogador';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    const documento = await buscarDoUsuario(Jogador, id, usuarioId);
    return NextResponse.json(toJogadorDTO(documento));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    const corpo: unknown = await request.json();
    const dados = await validarPayload(jogadorAtualizacaoSchema, corpo);
    await dbConnect();

    await buscarDoUsuario(Jogador, id, usuarioId);

    const atualizado = await Jogador.findByIdAndUpdate(
      id,
      { $set: dados },
      { new: true, runValidators: true },
    ).lean();

    if (!atualizado) {
      return NextResponse.json({ erro: 'Registro não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(toJogadorDTO(atualizado));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    await buscarDoUsuario(Jogador, id, usuarioId);
    await Jogador.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (erro) {
    return responderErro(erro);
  }
}
