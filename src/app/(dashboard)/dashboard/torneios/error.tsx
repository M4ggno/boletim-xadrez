'use client';

import { Erro } from '@/components/ui/estados';

export default function ErroTorneios({ reset }: { error: Error; reset: () => void }) {
  return <Erro mensagem="A listagem de torneios não carregou." onTentarNovamente={reset} />;
}
