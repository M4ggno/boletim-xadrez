'use client';

import { Erro } from '@/components/ui/estados';

export default function ErroJogadores({ reset }: { error: Error; reset: () => void }) {
  return <Erro mensagem="A listagem de jogadores não carregou." onTentarNovamente={reset} />;
}
