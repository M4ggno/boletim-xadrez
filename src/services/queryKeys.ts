export const queryKeys = {
  jogadores: {
    todos: ['jogadores'] as const,
    lista: (filtros: object) => ['jogadores', 'lista', filtros] as const,
    detalhe: (id: string) => ['jogadores', 'detalhe', id] as const,
  },
  torneios: {
    todos: ['torneios'] as const,
    lista: (filtros: object) => ['torneios', 'lista', filtros] as const,
    detalhe: (id: string) => ['torneios', 'detalhe', id] as const,
  },
  inscricoes: {
    todos: ['inscricoes'] as const,
    lista: (torneioId: string) => ['inscricoes', 'lista', torneioId] as const,
  },
  rodadas: {
    todos: ['rodadas'] as const,
    lista: (torneioId: string) => ['rodadas', 'lista', torneioId] as const,
  },
  partidas: {
    todos: ['partidas'] as const,
    lista: (filtros: object) => ['partidas', 'lista', filtros] as const,
    detalhe: (id: string) => ['partidas', 'detalhe', id] as const,
  },
  classificacao: (torneioId: string) => ['classificacao', torneioId] as const,
  classificacoes: ['classificacao'] as const,
};
