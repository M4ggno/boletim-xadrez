export interface JogadorDTO {
  id: string;
  nome: string;
  rating: number;
  categoria: string;
  clube: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface TorneioDTO {
  id: string;
  nome: string;
  local: string;
  dataInicio: string;
  formato: string;
  numeroRodadas: number;
  status: string;
  criadoEm: string;
}

export interface InscricaoDTO {
  id: string;
  torneioId: string;
  jogadorId: string;
  jogadorNome: string | null;
  confirmada: boolean;
  dataInscricao: string;
}

export interface RodadaDTO {
  id: string;
  torneioId: string;
  numero: number;
  status: string;
  criadoEm: string;
}

export interface PartidaDTO {
  id: string;
  rodadaId: string;
  torneioId: string;
  brancasId: string;
  pretasId: string;
  resultado: string;
  registradaEm: string | null;
}

export interface ClassificacaoDTO {
  jogadorId: string;
  nome: string;
  rating: number;
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  desempate: number;
}

export interface ListaDTO<T> {
  itens: T[];
  total: number;
}
