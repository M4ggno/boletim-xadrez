# Boletim

Gerenciador de torneios de xadrez para clubes. O organizador cadastra jogadores, abre inscrições, gera rodadas, lança resultados e acompanha uma classificação calculada de verdade — tudo em português brasileiro, com foco em clareza e acessibilidade.

O nome vem do boletim impresso da mesa de torneio: a folha que todo mundo consulta para saber quem joga, quem venceu e quem lidera.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração das variáveis de ambiente](#configuração-das-variáveis-de-ambiente)
- [Criar o MongoDB Atlas gratuito](#criar-o-mongodb-atlas-gratuito)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Rotas](#rotas)
- [Autenticação e segurança](#autenticação-e-segurança)
- [Regras de negócio](#regras-de-negócio)
- [Interface e acessibilidade](#interface-e-acessibilidade)
- [Scripts](#scripts)
- [Verificações e testes locais](#verificações-e-testes-locais)
- [Deploy na Vercel](#deploy-na-vercel)
- [Solução de problemas](#solução-de-problemas)

---

## Tecnologias

| Camada | Escolha | Versão instalada |
| --- | --- | --- |
| Framework | Next.js App Router | 16.4.6 |
| UI | React | 19.3.1 |
| Linguagem | TypeScript strict | 5.9.3 |
| Estilos | Tailwind CSS v4 | 4.3.5 |
| Componentes | ShadCN/UI (Radix + CVA) + sonner | — |
| Banco | MongoDB Atlas + Mongoose (singleton tipado) | 9.13.1 |
| Autenticação | NextAuth v4 (Credentials + JWT), bcryptjs salt 10 | 4.24.15 |
| Formulários | React Hook Form + Yup | 7.92.0 / 1.7.1 |
| Dados no cliente | TanStack Query + Axios | 5.108.4 |
| Escrita no servidor | Server Actions | — |
| Estado de UI | Zustand (somente interface) | 5.1.0 |
| Ícones | lucide-react | 1.80.0 |

Não há Prisma, Drizzle, Zod, Redux, React Router nem Atomic Design. Busca de dados no cliente nunca usa `useEffect`: ela passa pelo TanStack Query.

---

## Requisitos

- Node.js 20 ou superior.
- npm 10 ou superior.
- Um cluster MongoDB Atlas (a camada gratuita M0 atende ao desenvolvimento e ao deploy).
- Conta na Vercel para publicar.

---

## Instalação

```bash
git clone <URL_DO_SEU_REPOSITORIO> boletim-xadrez
cd boletim-xadrez
npm install
cp .env.example .env.local
```

Preencha `.env.local` com seus valores reais e inicie:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## Configuração das variáveis de ambiente

Crie `.env.local` na raiz do projeto. Ele está no `.gitignore` e **nunca deve ser commitado**.

```dotenv
MONGODB_URI="mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/boletim?retryWrites=true&w=majority"
NEXTAUTH_SECRET="chave-aleatoria-longa-gerada-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

| Variável | Onde usar | Observação |
| --- | --- | --- |
| `MONGODB_URI` | Servidor | URI do cluster Atlas. Libere o IP da sua máquina em **Network Access** e crie o usuário em **Database Access**. |
| `NEXTAUTH_SECRET` | Servidor | Gere com `openssl rand -base64 32` (Git Bash/WSL) ou `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))` no PowerShell. Nunca reutilize uma chave de teste. |
| `NEXTAUTH_URL` | Desenvolvimento e produção | No local use `http://localhost:3000`; na Vercel use a URL final do domínio (neste projeto, `https://boletim-xadrez.m4gns.dev`). |

Para trocar de banco, altere apenas `MONGODB_URI`. As coleções são criadas pelo Mongoose na primeira escrita.

---

## Criar o MongoDB Atlas gratuito

Se você ainda não tem cluster, a camada **M0 (Free)** é permanente e não pede cartão de crédito.

1. Acesse <https://www.mongodb.com/atlas/database> e clique em **Sign Up**. Cadastre com e-mail ou Google e confirme o e-mail.
2. No painel, clique em **Create a cluster**. Escolha:
   - **M0 Free** (Shared);
   - provedor **AWS**;
   - região mais próxima (por exemplo, `sa-east-1` — São Paulo — se disponível);
   - nome do cluster: `boletim-cluster`.
   - Clique em **Create** e aguarde alguns minutos.
3. No menu lateral, abra **Database Access** → **Add New Database User**:
   - **Password**;
   - usuário e senha fortes (guarde a senha);
   - permissão **Read and write to any database**;
   - **Add User**.
4. Abra **Network Access** → **Add IP Address**:
   - para desenvolver na sua máquina, use **Add Current IP Address**;
   - para a Vercel, adicione também `0.0.0.0/0` (o plano gratuito da Vercel não tem IP de saída fixo). Use uma senha forte, pois essa regra permite conexão de qualquer origem.
5. Volte em **Database** → **Connect** → **Connect your application**:
   - Driver: **Node.js**, versão recente;
   - copie a URI, que terá o formato `mongodb+srv://USUARIO:SENHA@boletim-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`;
   - insira o nome do banco antes da interrogação: `mongodb+srv://USUARIO:SENHA@boletim-cluster.xxxxx.mongodb.net/boletim?retryWrites=true&w=majority`.
   - Se a senha tiver caracteres especiais (`@`, `#`, `/`, `:`, etc.), codifique-os na URI (`@` vira `%40`).
6. Cole a URI em `MONGODB_URI` no `.env.local` e gere o `NEXTAUTH_SECRET`.
7. Rode `npm run dev`, crie uma conta em `/registrar` e verifique a coleção `users` no Atlas. Se aparecer, a conexão está correta.
8. Na Vercel, use a **mesma URI** e o mesmo segredo em Environment Variables. Defina `NEXTAUTH_URL` com a URL final do projeto.

Dica: dá para usar o mesmo cluster Atlas no local e em produção. Assim, o banco de desenvolvimento e o de publicação têm a mesma configuração.

---

## Modelos

| Coleção | Responsabilidade | Detalhe importante |
| --- | --- | --- |
| `users` | Conta do organizador | `email` único; senha armazenada como hash bcrypt salt 10. |
| `jogadores` | Ficha do enxadrista | `usuarioId` isola por conta; rating inteiro entre 0 e 3000. |
| `torneios` | Evento do clube | Status: `Inscrições abertas`, `Em andamento`, `Encerrado`. |
| `inscricoes` | Vínculo jogador/torneio | Índice único por `(torneioId, jogadorId)`. |
| `rodadas` | Rodada do torneio | Número único por torneio; status `Rascunho`, `Publicada`, `Encerrada`. |
| `partidas` | Confronto | Índice único por `(rodadaId, brancasId, pretasId)` e validação que impede o mesmo jogador em ambos os lados. |

Toda consulta de leitura ou escrita é filtrada por `usuarioId`. Nenhum documento de outra conta aparece na interface, mesmo que o ID seja conhecido.

---

## Estrutura de pastas

```text
src/
├── app/
│   ├── (publico)/            # landing, login, cadastro
│   ├── (dashboard)/          # área privada (layout com getServerSession)
│   │   └── dashboard/
│   │       ├── jogadores/    # lista e [id]
│   │       ├── torneios/     # lista, [id], [id]/rodadas/[numero]
│   │       └── partidas/     # lançamento de resultados
│   ├── actions/              # Server Actions (escrita vinda de formulários)
│   ├── api/                  # Route Handlers (leitura/CRUD via Axios)
│   │   └── auth/[...nextauth]/
│   ├── globals.css           # tokens 60-30-10 e filete editorial
│   ├── icon.svg              # favicon (folha + torre)
│   ├── layout.tsx            # fontes, SessionProvider, QueryProvider, Toaster
│   └── not-found.tsx
├── components/
│   ├── auth/                 # formulários de login e cadastro
│   ├── dashboard/            # resumo com números reais
│   ├── formularios/          # Campo com rótulo e erro
│   ├── jogadores/            # lista, detalhe, confirmação
│   ├── layout/               # AppShell, Marca e título
│   ├── partidas/             # listas e página de rodada
│   ├── torneios/             # lista, detalhe e formulário
│   └── ui/                   # primitivos ShadCN e estados de interface
├── hooks/                    # useApiQuery
├── lib/                      # db, auth, guards, guards-pagina, serializers, validação
├── models/                   # esquemas Mongoose
├── providers/                # SessionProvider e QueryProvider
├── schemas/                  # schemas Yup (API e formulário)
├── services/                 # axios, query keys, cálculo da classificação
├── store/                    # Zustand (apenas UI)
└── types/                    # DTOs, domínio, ações, augmentação do NextAuth

public/
└── boletim-mesa.svg          # ilustração original da capa
```

### Servidor × cliente

- **Server Components** fazem a leitura inicial protegida e decidem `redirect('/login')` ou `notFound()` quando o registro não pertence à conta.
- **Route Handlers** em `/api` são o contrato HTTP usado pelo TanStack Query (leitura e CRUD auxiliar). Todos chamam `exigirSessao()` e retornam 401/403/404 conforme o caso.
- **Server Actions** tratam escrita originada de formulários (`criar`, `atualizar`, `excluir`, `inscrever`, `gerar rodada`, `registrar resultado`), revalidam os caminhos afetados e redirecionam quando necessário.
- Documentos Mongoose passam por `.lean()` e por serializadores em `src/lib/serializers.ts`, então a API devolve DTOs simples (strings de data/ID), nunca instâncias do Mongoose.

---

## Rotas

### Públicas

| Rota | Descrição |
| --- | --- |
| `/` | Apresentação do Boletim e chamada para criar conta. |
| `/registrar` | Cadastro do organizador (nome, e-mail, senha). |
| `/login` | Entrada com credenciais; mostra aviso quando `?registrado=1`. |

### Privadas

| Rota | Descrição |
| --- | --- |
| `/dashboard` | Resumo: jogadores, torneios em andamento e partidas pendentes. |
| `/dashboard/jogadores` | Lista com busca e criação em modal. |
| `/dashboard/jogadores/[id]` | Ficha com edição e remoção. |
| `/dashboard/torneios` | Lista e criação de torneio. |
| `/dashboard/torneios/[id]` | Abas: inscrições, rodadas e classificação. |
| `/dashboard/torneios/[id]/rodadas/[numero]` | Partidas da rodada e lançamento de resultado. |
| `/dashboard/partidas` | Todas as partidas, com filtro por torneio. |

### API

| Método | Rota | Uso |
| --- | --- | --- |
| GET/POST | `/api/jogadores` | Listar (com `q`, `categoria`, `pagina`) e criar. |
| GET/PATCH/DELETE | `/api/jogadores/[id]` | Detalhe, edição e exclusão. |
| GET/POST | `/api/torneios` | Listar (com `status`, `q`) e criar. |
| GET/PATCH/DELETE | `/api/torneios/[id]` | Detalhe, edição e exclusão em cascata. |
| GET | `/api/torneios/[id]/classificacao` | Tabela calculada a partir das partidas registradas. |
| GET/POST | `/api/inscricoes` | Listar por `torneioId` (com `jogadorNome`) e inscrever. |
| GET/PATCH/DELETE | `/api/inscricoes/[id]` | Detalhe, edição e cancelamento. |
| GET/POST | `/api/rodadas` | Listar por `torneioId` e criar. |
| GET/PATCH/DELETE | `/api/rodadas/[id]` | Detalhe, edição e exclusão (remove partidas). |
| GET/POST | `/api/partidas` | Listar com filtros e criar. |
| GET/PATCH/DELETE | `/api/partidas/[id]` | Detalhe, resultado e exclusão. |
| GET/POST | `/api/auth/[...nextauth]` | Único ponto de autenticação; exporta somente GET e POST. |

---

## Autenticação e segurança

- Senha nunca vai para o banco em texto puro: `bcrypt.hash(senha, 10)` no cadastro e `bcrypt.compare` no login.
- `authOptions` existe apenas em `src/lib/auth.ts`. A rota do NextAuth só faz `export { handler as GET, handler as POST }`.
- A sessão JWT expõe `session.user.id` via **module augmentation** em `src/types/next-auth.d.ts`.
- Todo handler, action e página privada chama `getServerSession(authOptions)` (direto ou pelo guard). A posse do registro é conferida comparando `usuarioId` com o ID da sessão.
- Respostas protegidas: **401** sem sessão, **403** para registro de outro organizador, **404** para ID inexistente ou inválido.
- Validação de entrada em duas camadas: Yup nos formulários e Yup no servidor antes de tocar no banco. Nenhum campo é confiado apenas ao cliente.
- Erros inesperados são logados no servidor e devolvidos ao cliente como mensagem genérica; detalhes de Mongoose não vazam.
- Não há segredos no repositório. `.env.local`, `.env.production` e variedades estão ignorados; apenas `.env.example` é versionado.

---

## Regras de negócio

1. **Cadastro:** e-mail único; senha com no mínimo 8 caracteres, letra maiúscula, minúscula e número.
2. **Inscrição:** só em torneio com status `Inscrições abertas`; um jogador não pode se inscrever duas vezes no mesmo torneio.
3. **Início:** exige pelo menos dois jogadores inscritos; muda o status para `Em andamento`.
4. **Rodada:** gerada automaticamente a partir dos inscritos ordenados por rating (maiores primeiro), dois a dois, com `brancas` e `pretas` definidos. Exige número par de inscritos e respeita o total de rodadas previsto.
5. **Partida:** só pode ser criada em torneio em andamento e rodada não encerrada; ambos os jogadores precisam estar inscritos; o mesmo jogador não pode aparecer duas vezes na rodada.
6. **Resultado:** `1-0`, `0-1`, `½-½` ou `Pendente`. Ao registrar, `registradaEm` é preenchido.
7. **Encerramento da rodada:** bloqueado enquanto houver partida pendente.
8. **Encerramento do torneio:** bloqueado enquanto houver partida pendente; muda o status para `Encerrado`.
9. **Classificação:** 1 ponto por vitória, 0,5 por empate, 0 por derrota. Ordem: pontos → rating (desempate) → nome (ordem alfabética pt-BR). A tabela é recalculada a cada resultado, não armazenada.
10. **Exclusão de torneio:** remove inscrições, rodadas e partidas associadas, sempre restritas ao organizador.

---

## Interface e acessibilidade

- **Paleta 60-30-10:** superfície `#E7E8E3` (60%), estrutura `#3C413C` (30%), ação `#1F4E79` (10%). Complementos: sucesso `#2B6B43`, aviso `#8A5A00`, erro `#A33232`. Contrastes medidos: ação/superfície 7,03:1, branco/ação 8,66:1, estrutura/superfície 8,47:1, sucesso 5,19:1, aviso 4,81:1, erro 5,57:1 — todos acima de 4,5:1 (WCAG AA para texto normal).
- **Identidade visual:** marca original em SVG (folha de resultados com torre), presente no favicon `src/app/icon.svg`, no componente `Marca` da interface e na ilustração editorial `public/boletim-mesa.svg` da capa. O filete duplo em `globals.css` remete ao boletim impresso.
- **Tipografia:** `Libre Baskerville` em títulos, `Noto Sans` em texto e interface, `IBM Plex Mono` com `tabular-nums` em números, datas e resultados.
- **Grid de 8 pt:** espaçamentos em múltiplos de 4/8 px; alvos de toque com no mínimo 44 px; campos com `font-size: 16px` para evitar zoom automático no iOS.
- **Cinco estados:** carregando, vazio, erro com nova tentativa, dados e operação pendente (botão desabilitado com texto de progresso) presentes nas listagens e ações.
- **Navegação:** `next/link` para rotas internas; sem `<img>` (ícones são SVG via lucide-react); sem `<a>` interno.
- **Leitores de tela:** `lang="pt-BR"`, `aria-label` em ícones e selects sem rótulo visível, `aria-current="page"`, `role="status"`/`role="alert"` nos feedbacks, foco visível com contorno de 2 px na cor de ação.
- **Movimento:** `prefers-reduced-motion` reduz animações e transições.
- A interface segue os princípios de Nielsen (feedback do sistema, visibilidade do estado, prevenção de erros e reconhecimento em vez de memorização), proximidade/semelhança da Gestalt e a Lei de Fitts nos alvos grandes. Não há dark mode nesta primeira entrega.

---

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run start      # serve o build de produção
npm run typecheck  # tsc --noEmit (strict, sem erros)
```

Utilitário de verificação (opcional):

```bash
node scripts/verificar-conexao.mjs
```

Ele lê `MONGODB_URI` do `.env.local` e testa a conexão com o Atlas sem imprimir a URI nem a senha. Não é necessário para rodar a aplicação.

---

## Verificações e testes locais

Gates executados antes da entrega:

- `npm run typecheck` — zero erros.
- `npm run build` — zero erros, 24 entradas de rota (inclui `/_not-found` e `/icon.svg`).
- `npm audit --omit=dev` — zero vulnerabilidades.
- Validação de API e interface com banco real: autenticação bcrypt, 401/403, CRUD, regras de rodada e classificação calculada; telas privadas e isolamento entre organizadores verificados com sessão real.
- Conexão com o Atlas confirmada por `scripts/verificar-conexao.mjs` sem exposição de segredos.

Para repetir, preencha `.env.local`, rode `npm run typecheck` e `npm run build`, inicie com `npm run dev` e use o aplicativo normalmente.

---

## Deploy na Vercel

Deploy de produção: **https://boletim-xadrez.m4gns.dev** — repositório: <https://github.com/M4ggno/boletim-xadrez> (privado).

1. Crie o cluster no **MongoDB Atlas**, libere o IP `0.0.0.0/0` em **Network Access** (ou use o range da Vercel) e crie um usuário com permissão de leitura/escrita no banco `boletim`.
2. Envie o projeto para GitHub/GitLab/Bitbucket. Confirme que `.env.local` **não** está no repositório.
3. Na Vercel, clique em **Add New → Project**, importe o repositório. O framework é detectado como Next.js.
4. Em **Environment Variables**, adicione:
   - `MONGODB_URI` com a URI `mongodb+srv://...`.
   - `NEXTAUTH_SECRET` com um valor novo gerado por `openssl rand -base64 32`.
   - `NEXTAUTH_URL` com a URL final do domínio (neste projeto, `https://boletim-xadrez.m4gns.dev`).
5. Deploy. A build roda `next build` automaticamente.
6. Acesse a URL gerada, crie a conta do organizador e cadastre o primeiro torneio.
7. Para domínio próprio, configure em **Settings → Domains** e ajuste `NEXTAUTH_URL` apenas se o login apresentar redirect incorreto.

A conexão com o Mongoose usa singleton com cache global, adequado ao modelo serverless da Vercel (evita abrir uma nova conexão a cada invocação).

---

## Solução de problemas

| Sintoma | Causa provável | Ação |
| --- | --- | --- |
| `MongoServerError: authentication failed` | Usuário/senha ou URI errados no Atlas | Confira `MONGODB_URI`, o usuário em Database Access e o IP em Network Access. |
| Login redireciona para `/login?error=...` | `NEXTAUTH_SECRET` ausente ou `NEXTAUTH_URL` incorreto | Defina a chave e confira a URL base. |
| Página privada volta para `/login` | Sessão expirada | Entre novamente; o JWT é válido por 7 dias. |
| `Não foi possível gerar a rodada` | Número ímpar de inscritos ou torneio não iniciado | Inscreva um número par e inicie o torneio. |
| `Ainda há partidas sem resultado` | Rodada com partida `Pendente` | Lance todos os resultados antes de encerrar. |
| Build falha apenas na Vercel | Variáveis faltando no ambiente de produção | Adicione `MONGODB_URI` e `NEXTAUTH_SECRET` em Environment Variables e faça novo deploy. |
| Página de outro organizador aparece com status 200 em ferramentas de inspeção | Com `loading.tsx`, o Next transmite o shell antes do `notFound()` | A fronteira de not-found é renderizada no cliente e a resposta é marcada com `noindex`; nenhum dado alheio é enviado. A checagem de posse também existe na API (403). |

---

## Estado da entrega

Base e autenticação, API e regras de negócio, interface, documentação e auditoria concluídos. Identidade visual original em SVG, primitivos Radix/CVA no padrão ShadCN/UI (configuração em `components.json`), inclusive `Select`, e tabela com aliases canônicos. O projeto usa somente MongoDB Atlas — não há Docker. Nenhum segredo foi commitado. O deploy depende apenas das variáveis de ambiente do seu próprio Atlas e da sua conta Vercel.
