import { NextResponse, type NextRequest } from 'next/server';
import { Types, type QueryFilter } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { buscarNomesJogadores } from '@/lib/nomes-jogadores';
import { toInscricaoDTO } from '@/lib/serializers';
import { ErroValidacao, validarPayload } from '@/lib/validacao';
import Inscricao, { type IInscricao } from '@/models/Inscricao';
import Jogador from '@/models/Jogador';
import Torneio from '@/models/Torneio';
import { inscricaoSchema } from '@/schemas/inscricao';
import type { InscricaoDTO, ListaDTO } from '@/types/dtos';

export async function GET(request: NextRequest) {
  try {
    const usuarioId = await exigirSessao();
    const torneioId = new URL(request.url).searchParams.get('torneioId') ?? '';
    await dbConnect();

    const consulta: QueryFilter<IInscricao> = { usuarioId: new Types.ObjectId(usuarioId) };
    if (torneioId) {
      await buscarDoUsuario(Torneio, torneioId, usuarioId);
      consulta.torneioId = new Types.ObjectId(torneioId);
    }

    const documentos = await Inscricao.find(consulta).sort({ dataInscricao: -1 }).lean();
    const nomes = await buscarNomesJogadores(
      documentos.map((documento) => String(documento.jogadorId)),
      usuarioId,
    );
    const resposta: ListaDTO<InscricaoDTO> = {
      itens: documentos.map((documento) =>
        toInscricaoDTO(documento, nomes.get(String(documento.jogadorId)) ?? null),
      ),
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
    const dados = await validarPayload(inscricaoSchema, corpo);
    await dbConnect();

    const torneio = await buscarDoUsuario(Torneio, dados.torneioId, usuarioId);
    if (torneio.status !== 'Inscrições abertas') {
      throw new ErroValidacao('As inscrições deste torneio estão encerradas.');
    }

    const jogador = await buscarDoUsuario(Jogador, dados.jogadorId, usuarioId);

    const jaInscrito = await Inscricao.exists({
      torneioId: new Types.ObjectId(dados.torneioId),
      jogadorId: new Types.ObjectId(dados.jogadorId),
    });
    if (jaInscrito) {
      throw new ErroValidacao('Este jogador já está inscrito no torneio.');
    }

    const documento = await Inscricao.create({
      torneioId: new Types.ObjectId(dados.torneioId),
      jogadorId: new Types.ObjectId(dados.jogadorId),
      confirmada: true,
      dataInscricao: new Date(),
      usuarioId: new Types.ObjectId(usuarioId),
    });

    return NextResponse.json(toInscricaoDTO(documento, jogador.nome), { status: 201 });
  } catch (erro) {
    return responderErro(erro);
  }
}
