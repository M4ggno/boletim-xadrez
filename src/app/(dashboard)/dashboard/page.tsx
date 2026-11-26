import type { Metadata } from 'next';
import { Resumo } from '@/components/dashboard/Resumo';
import { TituloPagina } from '@/components/layout/TituloPagina';
import { LinkButton } from '@/components/ui/link-button';

export const metadata: Metadata = { title: 'Visão geral' };

export default function PaginaDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TituloPagina
          titulo="Visão geral"
          descricao="O estado do clube em um golpe de vista: quem joga, o que está aberto e o que falta lançar."
        />
        <LinkButton href="/dashboard/torneios">Abrir torneios</LinkButton>
      </div>
      <Resumo />
    </div>
  );
}
