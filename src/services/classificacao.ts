import type { ClassificacaoDTO, JogadorDTO, PartidaDTO } from '@/types/dtos';

export function calcularClassificacao(
  jogadores: JogadorDTO[],
  partidas: PartidaDTO[],
): ClassificacaoDTO[] {
  const linhas = new Map<string, ClassificacaoDTO>();

  for (const jogador of jogadores) {
    linhas.set(jogador.id, {
      jogadorId: jogador.id,
      nome: jogador.nome,
      rating: jogador.rating,
      pontos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      desempate: jogador.rating,
    });
  }

  for (const partida of partidas) {
    if (partida.resultado === 'Pendente') continue;

    const brancas = linhas.get(partida.brancasId);
    const pretas = linhas.get(partida.pretasId);
    if (!brancas || !pretas) continue;

    if (partida.resultado === '1-0') {
      brancas.vitorias += 1;
      brancas.pontos += 1;
      pretas.derrotas += 1;
    } else if (partida.resultado === '0-1') {
      pretas.vitorias += 1;
      pretas.pontos += 1;
      brancas.derrotas += 1;
    } else if (partida.resultado === '½-½') {
      brancas.empates += 1;
      brancas.pontos += 0.5;
      pretas.empates += 1;
      pretas.pontos += 0.5;
    }
  }

  return [...linhas.values()].sort(
    (a, b) =>
      b.pontos - a.pontos ||
      b.desempate - a.desempate ||
      a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}
