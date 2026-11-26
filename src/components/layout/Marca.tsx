import { cn } from '@/lib/utils';

/** Folha de resultados com torre: a marca editorial do Boletim. */
export function Marca({
  className,
  comTexto = true,
  comSubtitulo = false,
  tamanho = 'padrao',
}: {
  className?: string;
  comTexto?: boolean;
  comSubtitulo?: boolean;
  tamanho?: 'padrao' | 'grande';
}) {
  const dimensao = tamanho === 'grande' ? 40 : 34;

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 40 40"
        width={dimensao}
        height={dimensao}
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="3"
          y="2"
          width="34"
          height="36"
          rx="2.5"
          fill="#F6F5F0"
          stroke="#3C413C"
          strokeWidth="2.25"
        />
        <path d="M8 8.5h24" stroke="#3C413C" strokeWidth="2" strokeLinecap="square" />
        <path
          d="M8 11.5h24"
          stroke="#3C413C"
          strokeOpacity=".45"
          strokeWidth="1"
          strokeLinecap="square"
        />
        <path
          d="M8 17h10M8 22h10M8 27h7M8 32h8.5"
          stroke="#3C413C"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <g fill="#1F4E79">
          <path d="M21 14.5h2.8v2.5h2.4v-2.5H29v2.5h2.4v-2.5H34v6.25H21z" />
          <rect x="22" y="21.75" width="11" height="1.6" rx="0.4" />
          <path d="M23 24.25h9l1.4 7H21.6z" />
          <rect x="20" y="32" width="15" height="3.25" rx="0.8" />
        </g>
      </svg>
      {comTexto && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-titulo font-bold tracking-[-0.025em] text-tinta',
              tamanho === 'grande' ? 'text-2xl' : 'text-xl',
            )}
          >
            Boletim
          </span>
          {comSubtitulo && (
            <span className="mt-1 font-dados text-[11px] font-medium tracking-[0.06em] text-estrutura">
              Torneios de xadrez
            </span>
          )}
        </span>
      )}
    </span>
  );
}
