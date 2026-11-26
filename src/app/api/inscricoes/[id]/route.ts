import { NextResponse, type NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { buscarNomesJogadores } from '@/lib/nomes-jogadores';
import { toInscricaoDTO } from '@/lib/serializers';
import { validarPayload } from '@/lib/validacao';
import Inscricao from '@/models/Inscricao';
import Jogador from '@/models/Jogador';
import { inscricaoSchema } from '@/schemas/inscricao';

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    const documento = await buscarDoUsuario(Inscricao, id, usuarioId);
    const nomes = await buscarNomesJogadores([String(documento.jogadorId)], usuarioId);
    return NextResponse.json(toInscricaoDTO(documento, nomes.get(String(documento.jogadorId)) ?? null));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    const corpo: unknown = await request.json();
    const dados = await validarPayload(inscricaoSchema.partial(), corpo);
    await dbConnect();

    await buscarDoUsuario(Inscricao, id, usuarioId);
    if (dados.jogadorId) {
      await buscarDoUsuario(Jogador, dados.jogadorId, usuarioId);
    }

    const atualizada = await Inscricao.findByIdAndUpdate(
      id,
      { $set: dados },
      { new: true, runValidators: true },
    ).lean();

    if (!atualizada) {
      return NextResponse.json({ erro: 'Inscrição não encontrada.' }, { status: 404 });
    }

    const nomes = await buscarNomesJogadores([String(atualizada.jogadorId)], usuarioId);
    return NextResponse.json(toInscricaoDTO(atualizada, nomes.get(String(atualizada.jogadorId)) ?? null));
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(_request: NextRequest, context: Contexto) {
  try {
    const usuarioId = await exigirSessao();
    const { id } = await context.params;
    await dbConnect();

    await buscarDoUsuario(Inscricao, id, usuarioId);
    await Inscricao.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (erro) {
    return responderErro(erro);
  }
}
