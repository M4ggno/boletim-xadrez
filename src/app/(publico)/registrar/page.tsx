import type { Metadata } from 'next';
import Link from 'next/link';
import { FormularioRegistro } from '@/components/auth/FormularioRegistro';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

export const metadata: Metadata = { title: 'Criar conta' };

export default function PaginaRegistrar() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-t-4 border-t-acao">
        <CardHeader className="py-5">
          <p className="font-dados text-xs font-medium text-acao">Cadastro do clube</p>
          <h1 className="text-2xl font-bold text-tinta sm:text-3xl">Criar conta de organizador</h1>
          <CardDescription>
            Uma conta por clube. Seus jogadores, torneios e resultados ficam ligados a ela.
          </CardDescription>
        </CardHeader>

        <CardContent className="[&>form]:mt-0 [&>form]:max-w-none">
          <FormularioRegistro />
        </CardContent>

        <CardFooter className="justify-between text-sm text-estrutura">
          <span>Já possui cadastro?</span>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center font-semibold text-acao hover:underline"
          >
            Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
