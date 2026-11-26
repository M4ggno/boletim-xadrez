import { CircleAlert, LoaderCircle, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Carregando({ rotulo = 'Carregando…' }: { rotulo?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-md border border-estrutura/18 bg-papel px-6 py-10 text-sm font-medium text-estrutura"
    >
      <LoaderCircle className="animate-spin text-acao" size={24} strokeWidth={1.75} aria-hidden="true" />
      <span>{rotulo}</span>
    </div>
  );
}

export function Vazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: { rotulo: string; onClick: () => void };
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-4 rounded-md border border-dashed border-estrutura/30 bg-papel px-6 py-10 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-estrutura/20 bg-superficie text-estrutura">
        <SearchX size={22} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="max-w-md space-y-1">
        <p className="font-titulo text-lg font-bold text-tinta">{titulo}</p>
        <p className="text-sm text-estrutura/85">{descricao}</p>
      </div>
      {acao && (
        <Button type="button" onClick={acao.onClick}>
          {acao.rotulo}
        </Button>
      )}
    </div>
  );
}

export function Erro({
  mensagem,
  onTentarNovamente,
}: {
  mensagem: string;
  onTentarNovamente: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-44 flex-col items-center justify-center gap-4 rounded-md border border-erro/35 bg-papel px-6 py-10 text-center"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-erro/30 bg-erro/10 text-erro">
        <CircleAlert size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="max-w-md space-y-1">
        <p className="font-titulo text-lg font-bold text-tinta">Não foi possível carregar</p>
        <p className="text-sm text-estrutura/85">{mensagem}</p>
      </div>
      <Button type="button" variant="secundario" onClick={onTentarNovamente}>
        Tentar novamente
      </Button>
    </div>
  );
}
