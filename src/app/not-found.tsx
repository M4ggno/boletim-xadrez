import { LinkButton } from '@/components/ui/link-button';

export default function NaoEncontrado() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-dados text-sm tracking-widest text-acao">404</p>
      <h1 className="mt-3 text-3xl font-bold">Página não encontrada</h1>
      <p className="mt-3 text-estrutura/85">O endereço não existe ou o registro foi removido.</p>
      <LinkButton href="/" className="mt-6">
        Voltar ao início
      </LinkButton>
    </main>
  );
}
