import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { FormularioLogin } from '@/components/auth/FormularioLogin';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

export const metadata: Metadata = { title: 'Entrar' };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ registrado?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-t-4 border-t-acao">
        <CardHeader className="py-5">
          <p className="font-dados text-xs font-medium text-acao">Acesso do organizador</p>
          <h1 className="text-2xl font-bold text-tinta sm:text-3xl">Entrar no Boletim</h1>
          <CardDescription>
            Use a conta do clube para gerenciar jogadores, rodadas e classificação.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 [&>form]:mt-0 [&>form]:max-w-none">
          {params.registrado === '1' && (
            <p
              role="status"
              className="flex items-start gap-2.5 rounded-sm border border-sucesso/35 border-l-4 border-l-sucesso bg-sucesso/10 px-3.5 py-3 text-sm text-tinta"
            >
              <CircleCheck
                size={18}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-sucesso"
                aria-hidden="true"
              />
              <span>Conta criada. Entre para cadastrar o primeiro torneio.</span>
            </p>
          )}

          <FormularioLogin />
        </CardContent>

        <CardFooter className="justify-between text-sm text-estrutura">
          <span>Ainda não tem conta?</span>
          <Link
            href="/registrar"
            className="inline-flex min-h-11 items-center font-semibold text-acao hover:underline"
          >
            Criar conta
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
