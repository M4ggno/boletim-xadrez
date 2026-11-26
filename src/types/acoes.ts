export interface EstadoAcao {
  ok: boolean;
  erro?: string;
  mensagem?: string;
  id?: string;
}

export const estadoInicialAcao: EstadoAcao = { ok: false };

/** Estado do cadastro de organizador (fora dos arquivos "use server"). */
export interface RegistroEstado {
  ok: boolean;
  erro?: string;
}

export const estadoInicialRegistro: RegistroEstado = { ok: false };
