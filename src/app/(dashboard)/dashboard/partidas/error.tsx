'use client';

import { Erro } from '@/components/ui/estados';

export default function ErroPartidas({ reset }: { error: Error; reset: () => void }) {
  return <Erro mensagem="A listagem de partidas não carregou." onTentarNovamente={reset} />;
}
