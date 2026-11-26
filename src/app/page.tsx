import Image from 'next/image';
import Link from 'next/link';
import { Marca } from '@/components/layout/Marca';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';

const etapas = [
  {
    numero: '1',
    titulo: 'Cadastre quem joga',
    texto:
      'Mantenha a ficha do clube com rating, categoria e situação ativa para inscrever em qualquer torneio.',
  },
  {
    numero: '2',
    titulo: 'Conduza as rodadas',
    texto:
      'Abra inscrições, gere os emparceiramentos de cada rodada e registre vitórias, empates ou derrotas na hora.',
  },
  {
    numero: '3',
    titulo: 'Publique a classificação',
    texto:
      'Pontos e desempates são recalculados a cada resultado lançado, sem fórmulas quebradas nem retrabalho.',
  },
];

export default function PaginaInicial() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-papel">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="inline-flex min-h-11 items-center">
            <Marca tamanho="grande" comSubtitulo />
          </Link>

          <p className="hidden font-dados text-xs text-estrutura md:block">
            Edição do organizador — inscrições, rodadas e classificação
          </p>

          <nav aria-label="Acesso ao sistema" className="flex items-center gap-2 sm:gap-3">
            <LinkButton href="/login" variant="terciario">
              Entrar
            </LinkButton>
            <LinkButton href="/registrar">Criar conta</LinkButton>
          </nav>
        </div>
        <div className="regua-boletim" aria-hidden="true" />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div>
            <p className="font-dados text-sm font-medium text-acao">
              Para clubes e torneios presenciais
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.12] text-tinta sm:text-5xl">
              O boletim do clube, sem planilha solta.
            </h1>
            <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-estrutura sm:text-lg">
              Cadastre jogadores, abra inscrições, lance os resultados de cada rodada e acompanhe a
              classificação atualizada em um só caderno.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/registrar">Criar conta de organizador</LinkButton>
              <LinkButton href="/login" variant="secundario">
                Entrar no boletim
              </LinkButton>
            </div>

            <div className="mt-8 border-t border-estrutura/20 pt-5">
              <p className="max-w-[54ch] text-sm text-estrutura">
                Cada número exibido no painel nasce das partidas registradas pelo clube. Sem dados
                fictícios e sem planilhas paralelas.
              </p>
            </div>
          </div>

          <figure>
            <Card className="p-3 sm:p-4">
              <div className="overflow-hidden rounded-sm border border-estrutura/15 bg-superficie">
                <Image
                  src="/boletim-mesa.svg"
                  alt="Ilustração editorial do Boletim: folha de resultados com classificação por rodada, torre azul e peões sobre a mesa do clube"
                  width={800}
                  height={560}
                  priority
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-estrutura">
                <span>Folha de resultados e classificação por rodada</span>
                <span className="font-dados text-acao">Suíço e Eliminatória</span>
              </figcaption>
            </Card>
          </figure>
        </section>

        <section aria-labelledby="como-funciona" className="mt-16 sm:mt-20">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="como-funciona" className="text-2xl font-bold text-tinta sm:text-3xl">
                Da inscrição à mesa final
              </h2>
              <p className="mt-1.5 text-sm text-estrutura sm:text-base">
                Um fluxo direto para conduzir o torneio durante o expediente do clube.
              </p>
            </div>
          </div>

          <Card>
            <ol className="grid divide-y divide-estrutura/16 md:grid-cols-3 md:divide-x md:divide-y-0">
              {etapas.map((etapa) => (
                <li key={etapa.numero} className="p-6">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-acao/30 bg-acao/10 font-dados text-sm font-semibold text-acao">
                    {etapa.numero}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-tinta">{etapa.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-estrutura">{etapa.texto}</p>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      </main>

      <footer className="border-t border-estrutura/20 bg-papel">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center">
          <Marca />
          <div className="flex flex-wrap items-center gap-4 text-sm text-estrutura">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center font-medium text-acao hover:underline"
            >
              Entrar
            </Link>
            <Link
              href="/registrar"
              className="inline-flex min-h-11 items-center font-medium text-acao hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
