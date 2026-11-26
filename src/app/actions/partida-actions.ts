'use server';

import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { buscarDoUsuario, erroParaAcao, exigirSessao } from '@/lib/guards';
import { ErroValidacao, exigirId, validarPayload } from '@/lib/validacao';
import Partida from '@/models/Partida';
import Rodada from '@/models/Rodada';
import { resultadoSchema } from '@/schemas/partida';
import type { EstadoAcao } from '@/types/acoes';

export async function registrarResultadoAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const usuarioId = await exigirSessao();
    const id = exigirId(formData.get('id'));
    const dados = await validarPayload(resultadoSchema, {
      resultado: formData.get('resultado'),
    });
    await dbConnect();

    const partida = await buscarDoUsuario(Partida, id, usuarioId);
    const rodada = await buscarDoUsuario(Rodada, String(partida.rodadaId), usuarioId);
    if (rodada.status === 'Encerrada') {
      throw new ErroValidacao('Esta rodada já foi encerrada.');
    }

    await Partida.findByIdAndUpdate(
      id,
      {
        $set: {
          resultado: dados.resultado,
          registradaEm: dados.resultado === 'Pendente' ? null : new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    const torneioId = String(partida.torneioId);
    revalidatePath('/dashboard/partidas');
    revalidatePath(`/dashboard/torneios/${torneioId}`);
    revalidatePath(`/dashboard/torneios/${torneioId}/rodadas/${rodada.numero}`);
    return { ok: true, mensagem: 'Resultado registrado.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

export async function excluirPartidaAction(
  _estadoAnterior: EstadoAcao,
  formData: FormData,
): Promise<EstadoAcao> {
  try {
    const usuarioId = await exigirSessao();
    const id = exigirId(formData.get('id'));
    await dbConnect();

    const partida = await buscarDoUsuario(Partida, id, usuarioId);
    const torneioId = String(partida.torneioId);
    const rodadaId = String(partida.rodadaId);

    await Partida.findByIdAndDelete(id);
    revalidatePath('/dashboard/partidas');
    revalidatePath(`/dashboard/torneios/${torneioId}`);
    revalidatePath(`/dashboard/torneios/${torneioId}/rodadas/${await numeroDaRodada(rodadaId, usuarioId)}`);
    return { ok: true, mensagem: 'Partida removida.' };
  } catch (erro) {
    return erroParaAcao(erro);
  }
}

async function numeroDaRodada(rodadaId: string, usuarioId: string): Promise<number> {
  const rodada = await Rodada.findOne({ _id: rodadaId, usuarioId })
    .select('numero')
    .lean();
  return rodada?.numero ?? 1;
}
