'use client';

import { useQuery, type QueryKey } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useApiQuery<T>(chave: QueryKey, caminho: string, habilitado = true) {
  return useQuery({
    queryKey: chave,
    queryFn: async () => (await api.get<T>(caminho)).data,
    enabled: habilitado,
  });
}
