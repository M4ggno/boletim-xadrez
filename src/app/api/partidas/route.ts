import { NextResponse, type NextRequest } from 'next/server';
import { Types, type QueryFilter } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, exigirSessao, responderErro } from '@/lib/guards';
import { toPartidaDTO } from '@/lib/serializers';
import { ErroValidacao, escaparRegex, exigirId, validarPayload } from '@/lib/validacao';
import Inscricao from '@/models/Inscricao';
import Jogador from '@/models/Jogador';
import Partida, { type IPartida } from '@/models/Partida';
import Rodada from '@/models/Rodada';
import Torneio from '@/models/Torneio';
import { partidaSchema } from '@/schemas/partida';
import { RESULTADOS_PARTIDA, type ResultadoPartida } from '@/types/dominio';
import type { ListaDTO, PartidaDTO } from '@/types/dtos';

async function lerFiltros(request: NextRequest): Promise<{
  torneioId: string;
  rodadaId: string;
  resultado: string;
  q: string;
}> {
  const url = new URL(request.url);
  return {
    torneioId: url.searchParams.get('torneioId') ?? '',
    rodadaId: url.searchParams.get('rodadaId') ?? '',
    resultado: url.searchParams.get('resultado') ?? '',
    q: (url.searchParams.get('q') ?? '').trim(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const usuarioId = await exigirSessao();
    const filtros = await lerFiltros(request);
    await dbConnect();

    const consulta: QueryFilter<IPartida> = { usuarioId: new Types.ObjectId(usuarioId) };
    if (filtros.torneioId) consulta.torneioId = new Types.ObjectId(exigirId(filtros.torneioId));
    if (filtros.rodadaId) consulta.rodadaId = new Types.ObjectId(exigirId(filtros.rodadaId));
    if (filtros.resultado && RESULTADOS_PARTIDA.some((opcao) => opcao === filtros.resultado)) {
      consulta.resultado = filtros.resultado as ResultadoPartida;
    }
    if (filtros.q) {
      const jogadores = await Jogador.find({
        usuarioId: new Types.ObjectId(usuarioId),
        nome: { $regex: escaparRegex(filtros.q), $options: 'i' },
      })
        .select('_id')
        .lean();
      const ids = jogadores.map((jogador) => jogador._id);
      if (ids.length === 0) {
        return NextResponse.json({ itens: [], total: 0 });
      }
      consulta.$or = [{ brancasId: { $in: ids } }, { pretasId: { $in: ids } }];
    }

    const documentos = await Partida.find(consulta).sort({ createdAt: 1 }).lean();
    const resposta: ListaDTO<PartidaDTO> = {
      itens: documentos.map(toPartidaDTO),
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
    const dados = await validarPayload(partidaSchema, corpo);
    await dbConnect();

    const torneio = await buscarDoUsuario(Torneio, dados.torneioId, usuarioId);
    if (torneio.status !== 'Em andamento') {
      throw new ErroValidacao('O torneio precisa estar em andamento para receber partidas.');
    }

    const rodada = await buscarDoUsuario(Rodada, dados.rodadaId, usuarioId);
    if (String(rodada.torneioId) !== dados.torneioId) {
      throw new ErroValidacao('A rodada escolhida não pertence a este torneio.');
    }
    if (rodada.status === 'Encerrada') {
      throw new ErroValidacao('Esta rodada já foi encerrada.');
    }

    await buscarDoUsuario(Jogador, dados.brancasId, usuarioId);
    await buscarDoUsuario(Jogador, dados.pretasId, usuarioId);

    const inscricoes = await Inscricao.countDocuments({
      torneioId: new Types.ObjectId(dados.torneioId),
      jogadorId: { $in: [new Types.ObjectId(dados.brancasId), new Types.ObjectId(dados.pretasId)] },
      usuarioId: new Types.ObjectId(usuarioId),
    });
    if (inscricoes !== 2) {
      throw new ErroValidacao('Os dois jogadores precisam estar inscritos no torneio.');
    }

    const documento = await Partida.create({
      rodadaId: new Types.ObjectId(dados.rodadaId),
      torneioId: new Types.ObjectId(dados.torneioId),
      brancasId: new Types.ObjectId(dados.brancasId),
      pretasId: new Types.ObjectId(dados.pretasId),
      resultado: dados.resultado,
      usuarioId: new Types.ObjectId(usuarioId),
    });

    return NextResponse.json(toPartidaDTO(documento), { status: 201 });
  } catch (erro) {
    return responderErro(erro);
  }
}
