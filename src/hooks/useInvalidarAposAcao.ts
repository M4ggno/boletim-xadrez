'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { EstadoAcao } from '@/types/acoes';

/**
 * Invalida as queries depois de uma Server Action bem-sucedida.
 *
 * O estado do useActionState é um objeto novo a cada execução, então usar a
 * identidade do objeto evita perder invalidações quando a mensagem se repete
 * (ex.: inscrever dois jogadores seguidos).
 */
export function useInvalidarAposAcao(estados: EstadoAcao[], chaves: QueryKey[]) {
  const queryClient = useQueryClient();
  const jaInvalidados = useRef(new Set<EstadoAcao>());

  useEffect(() => {
    for (const estado of estados) {
      if (!estado.ok || jaInvalidados.current.has(estado)) continue;
      jaInvalidados.current.add(estado);

      for (const chave of chaves) {
        void queryClient.invalidateQueries({ queryKey: chave });
      }
    }
  }, [estados, chaves, queryClient]);
}
