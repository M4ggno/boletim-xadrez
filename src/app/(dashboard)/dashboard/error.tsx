'use client';

import { Erro } from '@/components/ui/estados';

export default function ErroDashboard({ reset }: { error: Error; reset: () => void }) {
  return <Erro mensagem="O painel não carregou. Verifique sua sessão e tente novamente." onTentarNovamente={reset} />;
}
