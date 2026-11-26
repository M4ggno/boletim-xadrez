export const CATEGORIAS_JOGADOR = ['Iniciante', 'Intermediário', 'Avançado'] as const;
export type CategoriaJogador = (typeof CATEGORIAS_JOGADOR)[number];

export const FORMATOS_TORNEIO = ['Suíço', 'Eliminatória'] as const;
export type FormatoTorneio = (typeof FORMATOS_TORNEIO)[number];

export const STATUS_TORNEIO = ['Inscrições abertas', 'Em andamento', 'Encerrado'] as const;
export type StatusTorneio = (typeof STATUS_TORNEIO)[number];

export const STATUS_RODADA = ['Rascunho', 'Publicada', 'Encerrada'] as const;
export type StatusRodada = (typeof STATUS_RODADA)[number];

export const RESULTADOS_PARTIDA = ['Pendente', '1-0', '0-1', '½-½'] as const;
export type ResultadoPartida = (typeof RESULTADOS_PARTIDA)[number];
