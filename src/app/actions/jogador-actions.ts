'use server';

import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, erroParaAcao, exigirSessao } from '@/lib/guards';
import { exigirId, validarPayload } from '@/lib/validacao';
import Jogador from '@/models/Jogador';
import { jogadorAtualizacaoSchema, jogadorSchema } from '@/schemas/jogador';
import type { EstadoAcao } from '@/types/acoes';

function lerFormulario(formData: FormData) {
  const bruto: Record<string, unknown> = {
    nome: formData.get('nome'),
    rating: formData.get('rating'),
    categoria: formData.get('categoria'),
    clube: formData.get('clube') ?? '',
  };
  if (formData.has('ativo')) {
    bruto.ativo = formData.get('ativo') === 'true';
  }
  return bruto;
}

export async function criarJogadorAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  let idCriado = '';

  try {
    const usuarioId = await exigirSessao();
    const dados = await validarPayload(jogadorSchema, lerFormulario(formData));
    await dbConnect();

    const documento = await Jogador.create({
      ...dados,
      usuarioId: new Types.ObjectId(usuarioId),
    });
    idCriado = String(documento._id);

    revalidatePath('/dashboard/jogadores');
    return { ok: true, mensagem: 'Jogador cadastrado.', id: idCriado };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function atualizarJogadorAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const id = exigirId(formData.get('id'));
    const usuarioId = await exigirSessao();
    const dados = await validarPayload(jogadorAtualizacaoSchema, lerFormulario(formData));
    await dbConnect();

    await buscarDoUsuario(Jogador, id, usuarioId);

    await Jogador.findByIdAndUpdate(id, { $set: dados }, { new: true, runValidators: true });

    revalidatePath('/dashboard/jogadores');
    revalidatePath(`/dashboard/jogadores/${id}`);
    return { ok: true, mensagem: 'Dados do jogador atualizados.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function excluirJogadorAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const id = exigirId(formData.get('id'));
    const usuarioId = await exigirSessao();
    await dbConnect();
    await buscarDoUsuario(Jogador, id, usuarioId);

    await Jogador.findByIdAndDelete(id);
    revalidatePath('/dashboard/jogadores');
    return { ok: true, mensagem: 'Jogador removido.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}
