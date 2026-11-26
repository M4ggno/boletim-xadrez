'use server';

import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, erroParaAcao, exigirSessao } from '@/lib/guards';
import { ErroValidacao, exigirId, validarPayload } from '@/lib/validacao';
import Inscricao from '@/models/Inscricao';
import Jogador from '@/models/Jogador';
import Partida from '@/models/Partida';
import Rodada from '@/models/Rodada';
import Torneio from '@/models/Torneio';
import { torneioAtualizacaoSchema, torneioSchema } from '@/schemas/torneio';
import type { EstadoAcao } from '@/types/acoes';

function lerFormulario(formData: FormData) {
  return {
    nome: formData.get('nome'),
    local: formData.get('local'),
    dataInicio: formData.get('dataInicio'),
    formato: formData.get('formato'),
    numeroRodadas: formData.get('numeroRodadas'),
    status: formData.get('status') ?? undefined,
  };
}

function revalidarTorneio(id: string) {
  revalidatePath('/dashboard/torneios');
  revalidatePath(`/dashboard/torneios/${id}`);
}

export async function criarTorneioAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  let idCriado = '';

  try {
    const usuarioId = await exigirSessao();
    const dados = await validarPayload(torneioSchema, lerFormulario(formData));
    await dbConnect();

    const documento = await Torneio.create({
      ...dados,
      usuarioId: new Types.ObjectId(usuarioId),
    });
    idCriado = String(documento._id);

    revalidatePath('/dashboard/torneios');
    return { ok: true, mensagem: 'Torneio criado.', id: idCriado };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function atualizarTorneioAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const id = exigirId(formData.get('id'));
    const usuarioId = await exigirSessao();
    const dados = await validarPayload(torneioAtualizacaoSchema, lerFormulario(formData));
    await dbConnect();

    await buscarDoUsuario(Torneio, id, usuarioId);
    await Torneio.findByIdAndUpdate(id, { $set: dados }, { new: true, runValidators: true });

    revalidarTorneio(id);
    return { ok: true, mensagem: 'Torneio atualizado.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function excluirTorneioAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const id = exigirId(formData.get('id'));
    const usuarioId = await exigirSessao();
    await dbConnect();
    await buscarDoUsuario(Torneio, id, usuarioId);

    await Promise.all([
      Partida.deleteMany({ torneioId: id, usuarioId }),
      Rodada.deleteMany({ torneioId: id, usuarioId }),
      Inscricao.deleteMany({ torneioId: id, usuarioId }),
    ]);
    await Torneio.findByIdAndDelete(id);

    revalidatePath('/dashboard/torneios');
    return { ok: true, mensagem: 'Torneio removido.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function inscreverJogadorAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const usuarioId = await exigirSessao();
    const torneioId = exigirId(formData.get('torneioId'));
    const jogadorId = exigirId(formData.get('jogadorId'));
    await dbConnect();

    const torneio = await buscarDoUsuario(Torneio, torneioId, usuarioId);
    if (torneio.status !== 'Inscrições abertas') {
      throw new ErroValidacao('As inscrições deste torneio estão encerradas.');
    }
    await buscarDoUsuario(Jogador, jogadorId, usuarioId);

    const jaInscrito = await Inscricao.exists({ torneioId, jogadorId, usuarioId });
    if (jaInscrito) {
      throw new ErroValidacao('Este jogador já está inscrito no torneio.');
    }

    await Inscricao.create({
      torneioId: new Types.ObjectId(torneioId),
      jogadorId: new Types.ObjectId(jogadorId),
      confirmada: true,
      dataInscricao: new Date(),
      usuarioId: new Types.ObjectId(usuarioId),
    });

    revalidarTorneio(torneioId);
    return { ok: true, mensagem: 'Jogador inscrito.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function cancelarInscricaoAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const usuarioId = await exigirSessao();
    const id = exigirId(formData.get('id'));
    await dbConnect();

    const inscricao = await buscarDoUsuario(Inscricao, id, usuarioId);
    const torneioId = String(inscricao.torneioId);
    const torneio = await buscarDoUsuario(Torneio, torneioId, usuarioId);
    if (torneio.status !== 'Inscrições abertas') {
      throw new ErroValidacao('Não é possível cancelar inscrições após o início do torneio.');
    }

    await Inscricao.findByIdAndDelete(id);
    revalidarTorneio(torneioId);
    return { ok: true, mensagem: 'Inscrição cancelada.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function iniciarTorneioAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const usuarioId = await exigirSessao();
    const id = exigirId(formData.get('id'));
    await dbConnect();

    const torneio = await buscarDoUsuario(Torneio, id, usuarioId);
    if (torneio.status !== 'Inscrições abertas') {
      throw new ErroValidacao('Este torneio já foi iniciado.');
    }

    const inscritos = await Inscricao.countDocuments({ torneioId: id, usuarioId });
    if (inscritos < 2) {
      throw new ErroValidacao('Inscreva pelo menos dois jogadores antes de iniciar.');
    }

    await Torneio.findByIdAndUpdate(id, { status: 'Em andamento' }, { runValidators: true });
    revalidarTorneio(id);
    return { ok: true, mensagem: 'Torneio iniciado.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function encerrarTorneioAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const usuarioId = await exigirSessao();
    const id = exigirId(formData.get('id'));
    await dbConnect();

    const torneio = await buscarDoUsuario(Torneio, id, usuarioId);
    if (torneio.status !== 'Em andamento') {
      throw new ErroValidacao('Só é possível encerrar um torneio em andamento.');
    }

    const pendentes = await Partida.countDocuments({ torneioId: id, resultado: 'Pendente', usuarioId });
    if (pendentes > 0) {
      throw new ErroValidacao('Registre o resultado das partidas pendentes antes de encerrar.');
    }

    await Torneio.findByIdAndUpdate(id, { status: 'Encerrado' }, { runValidators: true });
    revalidarTorneio(id);
    return { ok: true, mensagem: 'Torneio encerrado.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function gerarRodadaAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const usuarioId = await exigirSessao();
    const torneioId = exigirId(formData.get('torneioId'));
    await dbConnect();

    const torneio = await buscarDoUsuario(Torneio, torneioId, usuarioId);
    if (torneio.status !== 'Em andamento') {
      throw new ErroValidacao('Inicie o torneio antes de gerar rodadas.');
    }

    const jaCriadas = await Rodada.countDocuments({ torneioId, usuarioId });
    const numero = jaCriadas + 1;
    if (numero > torneio.numeroRodadas) {
      throw new ErroValidacao('Todas as rodadas previstas já foram geradas.');
    }

    const inscricoes = await Inscricao.find({ torneioId, usuarioId }).select('jogadorId').lean();
    const jogadores = await Jogador.find({
      _id: { $in: inscricoes.map((item) => item.jogadorId) },
      usuarioId,
    })
      .sort({ rating: -1, nome: 1 })
      .lean();

    if (jogadores.length < 2 || jogadores.length % 2 !== 0) {
      throw new ErroValidacao('A rodada exige um número par de jogadores inscritos.');
    }

    const rodada = await Rodada.create({
      torneioId: new Types.ObjectId(torneioId),
      numero,
      status: 'Publicada',
      usuarioId: new Types.ObjectId(usuarioId),
    });

    const partidas = [];
    for (let indice = 0; indice < jogadores.length; indice += 2) {
      partidas.push({
        rodadaId: rodada._id,
        torneioId: new Types.ObjectId(torneioId),
        brancasId: jogadores[indice]._id,
        pretasId: jogadores[indice + 1]._id,
        resultado: 'Pendente',
        usuarioId: new Types.ObjectId(usuarioId),
      });
    }
    await Partida.insertMany(partidas);

    revalidarTorneio(torneioId);
    revalidatePath(`/dashboard/torneios/${torneioId}/rodadas/${numero}`);
    return { ok: true, mensagem: `Rodada ${numero} gerada.` };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}
