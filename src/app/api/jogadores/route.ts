import { NextResponse, type NextRequest } from 'next/server';
import { Types, type QueryFilter } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { exigirSessao, responderErro } from '@/lib/guards';
import { toJogadorDTO } from '@/lib/serializers';
import { escaparRegex, validarPayload } from '@/lib/validacao';
import Jogador, { type IJogador } from '@/models/Jogador';
import { jogadorSchema } from '@/schemas/jogador';
import { CATEGORIAS_JOGADOR, type CategoriaJogador } from '@/types/dominio';
import type { JogadorDTO, ListaDTO } from '@/types/dtos';

async function lerFiltros(request: NextRequest): Promise<{
  q: string;
  categoria: string;
  pagina: number;
}> {
  const url = new URL(request.url);
  const pagina = Number(url.searchParams.get('pagina') ?? '1');
  return {
    q: (url.searchParams.get('q') ?? '').trim(),
    categoria: url.searchParams.get('categoria') ?? '',
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}

export async function GET(request: NextRequest) {
  try {
    const usuarioId = await exigirSessao();
    const filtros = await lerFiltros(request);
    await dbConnect();

    const consulta: QueryFilter<IJogador> = { usuarioId: new Types.ObjectId(usuarioId) };
    if (filtros.q) consulta.nome = { $regex: escaparRegex(filtros.q), $options: 'i' };
    if (filtros.categoria && CATEGORIAS_JOGADOR.some((opcao) => opcao === filtros.categoria)) {
      consulta.categoria = filtros.categoria as CategoriaJogador;
    }

    const [documentos, total] = await Promise.all([
      Jogador.find(consulta)
        .sort({ nome: 1 })
        .skip((filtros.pagina - 1) * 20)
        .limit(20)
        .lean(),
      Jogador.countDocuments(consulta),
    ]);

    const resposta: ListaDTO<JogadorDTO> = {
      itens: documentos.map(toJogadorDTO),
      total,
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
    const dados = await validarPayload(jogadorSchema, corpo);
    await dbConnect();

    const documento = await Jogador.create({
      ...dados,
      usuarioId: new Types.ObjectId(usuarioId),
    });

    return NextResponse.json(toJogadorDTO(documento), { status: 201 });
  } catch (erro) {
    return responderErro(erro);
  }
}
