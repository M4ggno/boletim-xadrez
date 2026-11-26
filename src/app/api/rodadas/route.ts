import { NextResponse, type NextRequest } from 'next/server';
import { Types, type QueryFilter } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { toRodadaDTO } from '@/lib/serializers';
import { ErroValidacao, validarPayload } from '@/lib/validacao';
import Rodada, { type IRodada } from '@/models/Rodada';
import Torneio from '@/models/Torneio';
import { rodadaSchema } from '@/schemas/rodada';
import type { ListaDTO, RodadaDTO } from '@/types/dtos';

export async function GET(request: NextRequest) {
  try {
    const usuarioId = await exigirSessao();
    const torneioId = new URL(request.url).searchParams.get('torneioId') ?? '';
    await dbConnect();

    const consulta: QueryFilter<IRodada> = { usuarioId: new Types.ObjectId(usuarioId) };
    if (torneioId) {
      await buscarDoUsuario(Torneio, torneioId, usuarioId);
      consulta.torneioId = new Types.ObjectId(torneioId);
    }

    const documentos = await Rodada.find(consulta).sort({ numero: 1 }).lean();
    const resposta: ListaDTO<RodadaDTO> = {
      itens: documentos.map(toRodadaDTO),
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
    const dados = await validarPayload(rodadaSchema, corpo);
    await dbConnect();

    const torneio = await buscarDoUsuario(Torneio, dados.torneioId, usuarioId);
    if (torneio.status === 'Encerrado') {
      throw new ErroValidacao('Não é possível criar rodadas em um torneio encerrado.');
    }

    const jaExiste = await Rodada.exists({
      torneioId: new Types.ObjectId(dados.torneioId),
      numero: dados.numero,
    });
    if (jaExiste) {
      throw new ErroValidacao('Essa rodada já existe neste torneio.');
    }

    const documento = await Rodada.create({
      torneioId: new Types.ObjectId(dados.torneioId),
      numero: dados.numero,
      status: dados.status,
      usuarioId: new Types.ObjectId(usuarioId),
    });

    return NextResponse.json(toRodadaDTO(documento), { status: 201 });
  } catch (erro) {
    return responderErro(erro);
  }
}
