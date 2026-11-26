import type { Types } from 'mongoose';
import type {
  InscricaoDTO,
  JogadorDTO,
  PartidaDTO,
  RodadaDTO,
  TorneioDTO,
} from '@/types/dtos';

interface Identificador {
  toString(): string;
}

interface JogadorLean {
  _id: Identificador;
  nome: string;
  rating: number;
  categoria: string;
  clube?: string | null;
  ativo: boolean;
  createdAt: Date;
}

interface TorneioLean {
  _id: Identificador;
  nome: string;
  local: string;
  dataInicio: Date;
  formato: string;
  numeroRodadas: number;
  status: string;
  createdAt: Date;
}

interface InscricaoLean {
  _id: Identificador;
  torneioId: Identificador;
  jogadorId: Identificador;
  confirmada: boolean;
  dataInscricao: Date;
}

interface RodadaLean {
  _id: Identificador;
  torneioId: Identificador;
  numero: number;
  status: string;
  createdAt: Date;
}

interface PartidaLean {
  _id: Identificador;
  rodadaId: Identificador;
  torneioId: Identificador;
  brancasId: Identificador;
  pretasId: Identificador;
  resultado: string;
  registradaEm?: Date | null;
}

function comoId(valor: Identificador | Types.ObjectId): string {
  return String(valor);
}

export function toJogadorDTO(doc: JogadorLean): JogadorDTO {
  return {
    id: comoId(doc._id),
    nome: doc.nome,
    rating: doc.rating,
    categoria: doc.categoria,
    clube: doc.clube ?? null,
    ativo: doc.ativo,
    criadoEm: new Date(doc.createdAt).toISOString(),
  };
}

export function toTorneioDTO(doc: TorneioLean): TorneioDTO {
  return {
    id: comoId(doc._id),
    nome: doc.nome,
    local: doc.local,
    dataInicio: new Date(doc.dataInicio).toISOString(),
    formato: doc.formato,
    numeroRodadas: doc.numeroRodadas,
    status: doc.status,
    criadoEm: new Date(doc.createdAt).toISOString(),
  };
}

export function toInscricaoDTO(doc: InscricaoLean, jogadorNome: string | null = null): InscricaoDTO {
  return {
    id: comoId(doc._id),
    torneioId: comoId(doc.torneioId),
    jogadorId: comoId(doc.jogadorId),
    jogadorNome,
    confirmada: doc.confirmada,
    dataInscricao: new Date(doc.dataInscricao).toISOString(),
  };
}

export function toRodadaDTO(doc: RodadaLean): RodadaDTO {
  return {
    id: comoId(doc._id),
    torneioId: comoId(doc.torneioId),
    numero: doc.numero,
    status: doc.status,
    criadoEm: new Date(doc.createdAt).toISOString(),
  };
}

export function toPartidaDTO(doc: PartidaLean): PartidaDTO {
  return {
    id: comoId(doc._id),
    rodadaId: comoId(doc.rodadaId),
    torneioId: comoId(doc.torneioId),
    brancasId: comoId(doc.brancasId),
    pretasId: comoId(doc.pretasId),
    resultado: doc.resultado,
    registradaEm: doc.registradaEm ? new Date(doc.registradaEm).toISOString() : null,
  };
}
