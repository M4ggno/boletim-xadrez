'use client';

import { Confirmacao } from '@/components/ui/confirmacao';

export function ConfirmacaoExclusao({
  aberto,
  onAlterar,
  titulo,
  descricao,
  rotuloConfirmar,
  onConfirmar,
  pendente,
}: {
  aberto: boolean;
  onAlterar: (aberto: boolean) => void;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  onConfirmar: () => void;
  pendente?: boolean;
}) {
  return (
    <Confirmacao
      aberto={aberto}
      onAlterar={onAlterar}
      titulo={titulo}
      descricao={pendente ? 'Removendo…' : descricao}
      rotuloConfirmar={pendente ? 'Removendo…' : rotuloConfirmar}
      onConfirmar={onConfirmar}
    />
  );
}
