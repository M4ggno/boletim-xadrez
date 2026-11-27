import { NextResponse, type NextRequest } from 'next/server';
import { Types, type QueryFilter } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { exigirSessao, responderErro } from '@/lib/guards';
import { toTorneioDTO } from '@/lib/serializers';
import { escaparRegex, validarPayload } from '@/lib/validacao';
import Torneio, { type ITorneio } from '@/models/Torneio';
import { torneioSchema } from '@/schemas/torneio';
import { STATUS_TORNEIO, type StatusTorneio } from '@/types/dominio';
import type { ListaDTO, TorneioDTO } from '@/types/dtos';

async function lerFiltros(request: NextRequest): Promise<{ status: string; q: string }> {
  const url = new URL(request.url);
  return {
    status: url.searchParams.get('status') ?? '',
    q: (url.searchParams.get('q') ?? '').trim(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const usuarioId = await exigirSessao();
    const filtros = await lerFiltros(request);
    await dbConnect();

    const consulta: QueryFilter<ITorneio> = { usuarioId: new Types.ObjectId(usuarioId) };
    if (filtros.status && STATUS_TORNEIO.some((opcao) => opcao === filtros.status)) {
      consulta.status = filtros.status as StatusTorneio;
    }
    if (filtros.q) consulta.nome = { $regex: escaparRegex(filtros.q), $options: 'i' };

    const documentos = await Torneio.find(consulta).sort({ dataInicio: -1 }).lean();
    const resposta: ListaDTO<TorneioDTO> = {
      itens: documentos.map(toTorneioDTO),
      total: documentos.length,
    };
    return NextResponse.json(resposta);
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function POST(request: NextRequest) {
  try {
    const usuarioId = await exigirSessao();
    const corpo: unknown = await request.json();
    const dados = await validarPayload(torneioSchema, corpo);
    await dbConnect();

    const documento = await Torneio.create({
      ...dados,
      usuarioId: new Types.ObjectId(usuarioId),
    });

    return NextResponse.json(toTorneioDTO(documento), { status: 201 });
  } catch (erro) {
    return responderErro(erro);
  }
}
