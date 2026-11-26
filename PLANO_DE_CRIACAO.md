# PLANO DE CRIAÇÃO — **Boletim** (gestão de torneios de xadrez)

> **Status:** Concluído. Quatro ondas entregues; `npm run typecheck` e `npm run build` passaram (23 rotas, incluindo `/icon.svg`), `npm audit --omit=dev` sem vulnerabilidades. Validação real de API e interface com banco MongoDB, incluindo redirect de página privada, sessão, quatro telas do dashboard, login, cadastro e isolamento de registro alheio. Identidade visual original em SVG, interface polida com ShadCN/UI e MongoDB Atlas como único banco (sem Docker). README pt-BR, `.env.example` e `.gitignore` finalizados. Publicar na Vercel com `MONGODB_URI` e `NEXTAUTH_SECRET` do próprio Atlas.
> **Pasta de destino:** `C:\Users\filho\OneDrive\Desktop\boletim-xadrez`
> **Idioma:** pt-BR (interface, código de domínio, documentação e commits).
> **Como usar:** aprove este documento → executo a Onda 1 → paro no gate → repito até a Onda 4 → auditoria final → deploy. Cada gate é bloqueante: se falhar, corrige antes de avançar.

---

## 1. FASE 1 — Plano de Arquitetura e Direção de Arte

### 1.1 Tema e regras de negócio

**Boletim** é o sistema de um clube de xadrez para registrar torneios, inscrições, rodadas, partidas e classificação. O nome vem do boletim impresso que o clube afixa após cada rodada — isso define a voz da interface e o visual (papel de boletim, tinta, ardósia).

**Ator:** organizador autenticado. Todo registro pertence a um `User` via `usuarioId`. Não há papel de "jogador logado" nesta versão: jogadores são entidades gerenciadas pelo clube.

**Regras de negócio (implementadas no servidor, nunca só no cliente):**

1. Um torneio tem status `Inscrições abertas` → `Em andamento` → `Encerrado`. Só é possível inscrever no primeiro; só é possível registrar resultado no segundo.
2. Um jogador não pode se inscrever duas vezes no mesmo torneio (`índice único` em `Inscricao` + checagem explícita com mensagem humana).
3. Um jogador não pode aparecer em duas partidas da mesma rodada — validação no `pre('validate')` de `Partida`, além do índice único por `(rodadaId, brancasId)` e `(rodadaId, pretasId)`.
4. `brancasId` e `pretasId` devem ser diferentes e ambos inscritos no torneio.
5. Resultado permitido: `Pendente`, `1-0`, `0-1`, `½-½`. Pontuação: vitória = 1, empate = 0,5, derrota = 0. A classificação conta **somente partidas com resultado registrado**.
6. Desempate adotado (simples e explicável na apresentação): `rating` inicial do jogador, depois ordem alfabética. Nada de estatística inventada.
7. Exclusão de torneio com partidas registradas exige `AlertDialog` de confirmação e remove inscrições, rodadas e partidas ligadas em uma única operação controlada pelo servidor.
8. Números exibidos (inscritos, rodadas realizadas, partidas pendentes, classificação) são **sempre calculados a partir do MongoDB**.

### 1.2 Modelos Mongoose (além de `User`)

Todos com `{ timestamps: true }`, `usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }` e guarda contra recompilação (`models.Nome || model('Nome', Schema)`).

| Modelo | Campos principais | Validações / índices de domínio |
|---|---|---|
| `User` | `nome`, `email` (`unique`, `lowercase`, `trim`), `password` (`required`, `select: false`) | hash bcrypt com salt 10 no cadastro; `.select('+password')` no login |
| `Jogador` | `nome`, `rating` (padrão 1200), `categoria` (`Iniciante`/`Intermediário`/`Avançado`), `clube?`, `ativo` (padrão `true`) | nome 2–80 chars; rating 0–3000 |
| `Torneio` | `nome`, `local`, `dataInicio`, `formato` (`Suíço`/`Eliminatória`), `numeroRodadas` (1–20), `status` | transição de status validada nas Server Actions |
| `Inscricao` | `torneioId`, `jogadorId`, `confirmada` (padrão `true`), `dataInscricao` | `unique (torneioId, jogadorId)` |
| `Rodada` | `torneioId`, `numero`, `status` (`Rascunho`/`Publicada`/`Encerrada`) | `unique (torneioId, numero)` |
| `Partida` | `rodadaId`, `torneioId`, `brancasId`, `pretasId`, `resultado`, `registradaEm?` | `unique (rodadaId, brancasId)` e `(rodadaId, pretasId)`; `pre('validate')` impede duplicidade e jogador contra si |

**Serialização:** `.lean()` em todas as leituras + helpers em `src/lib/serializers.ts` (`toJogadorDTO`, `toTorneioDTO`, `toRodadaDTO`, `toPartidaDTO`, `toInscricaoDTO`), convertendo `_id`, `usuarioId` e `Date` para `string`/ISO. Tipos em `src/types/dtos.ts`. Nenhum documento Mongoose cru cruza a fronteira Server → Client.

**Cálculo puro:** `src/services/classificacao.ts` → `calcularClassificacao(jogadores: JogadorDTO[], partidas: PartidaDTO[]): ClassificacaoDTO[]`. Sem dependência de banco, testável e reutilizável na API e na página do torneio.

### 1.3 Mapa completo de rotas

**App Router (Server Components por padrão; `params`/`searchParams` sempre `Promise<...>` + `await`):**

```
src/app/
├─ layout.tsx                       # raiz: fontes, SessionProvider, TanstackProvider, <Toaster/>
├─ globals.css                      # tokens 60-30-10, grid 8pt, cursor pointer
├─ page.tsx                         # landing pública (copy funcional, zero estatística fictícia)
├─ not-found.tsx / error.tsx        # globais
├─ (publico)/layout.tsx             # cabeçalho mínimo, logo topo-esquerda → "/"
├─ (publico)/login/page.tsx
├─ (publico)/registrar/page.tsx
├─ (app)/layout.tsx                 # getServerSession → redirect('/login') se ausente; AppShell
├─ (app)/dashboard/page.tsx         # torneios ativos, partidas pendentes (números reais)
├─ (app)/dashboard/loading.tsx | error.tsx | not-found.tsx
├─ (app)/dashboard/jogadores/page.tsx
├─ (app)/dashboard/jogadores/novo/page.tsx
├─ (app)/dashboard/jogadores/[id]/page.tsx
├─ (app)/dashboard/jogadores/[id]/editar/page.tsx
├─ (app)/dashboard/jogadores/loading.tsx | error.tsx
├─ (app)/dashboard/torneios/page.tsx
├─ (app)/dashboard/torneios/novo/page.tsx
├─ (app)/dashboard/torneios/[id]/page.tsx              # abas: Inscrições / Rodadas / Classificação
├─ (app)/dashboard/torneios/[id]/editar/page.tsx
├─ (app)/dashboard/torneios/[id]/rodadas/[numero]/page.tsx  # Promise<{ id: string; numero: string }>
├─ (app)/dashboard/torneios/loading.tsx | error.tsx
├─ (app)/dashboard/partidas/page.tsx                   # searchParams Promise<{ torneio?: string; status?: string }>
├─ (app)/dashboard/partidas/[id]/page.tsx
├─ (app)/dashboard/partidas/loading.tsx | error.tsx
├─ actions/
│  ├─ auth-actions.ts                # registrarUsuario(prevState, formData)
│  ├─ jogador-actions.ts             # criar / atualizar / excluir
│  ├─ torneio-actions.ts             # criar / atualizar / excluir / inscrever / cancelar inscrição / iniciar / encerrar / gerar rodada
│  └─ partida-actions.ts             # registrar resultado / excluir partida
└─ api/
   ├─ auth/[...nextauth]/route.ts    # SOMENTE `export { handler as GET, handler as POST }`
   ├─ jogadores/route.ts (GET, POST) | jogadores/[id]/route.ts (GET, PATCH, DELETE)
   ├─ torneios/route.ts (GET, POST)  | torneios/[id]/route.ts (GET, PATCH, DELETE)
   ├─ torneios/[id]/classificacao/route.ts (GET)
   ├─ inscricoes/route.ts (GET, POST) | inscricoes/[id]/route.ts (GET, PATCH, DELETE)
   ├─ rodadas/route.ts (GET, POST)   | rodadas/[id]/route.ts (GET, PATCH, DELETE)
   └─ partidas/route.ts (GET, POST)  | partidas/[id]/route.ts (GET, PATCH, DELETE)
```

**Papéis sem redundância:**

- **Route Handlers + TanStack Query:** listagens com busca/filtros, tabelas, actions rápidas (registrar resultado, inscrever), classificação. `useQuery`/`useMutation` com `queryKey` centralizada e `invalidateQueries` após mutação.
- **Server Actions + `revalidatePath`:** formulários de cadastro/edição com `FormData`, `useActionState` e `useFormStatus`, progressivo sem JS. Quando a action toca dados também lidos por `useQuery`, o componente cliente invalida a `queryKey` correspondente após retorno de sucesso.
- **Zustand:** somente estado de UI local — `menuAberta`, `dialogoInscricaoJogadorId`, `dialogoResultadoPartidaId`, `densidadeTabela`. Nunca dados remotos.

### 1.4 Fronteira Server Components × Client Components

| Server (padrão) | Client (`'use client'` apenas nas folhas) |
|---|---|
| `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` (error é Client por contrato do Next), route handlers, `actions/`, `lib/db.ts`, `lib/auth.ts`, models, serializadores, `services/classificacao.ts` | `SessionProvider.tsx`, `TanstackProvider.tsx`, `AppShell` (menu via Zustand), `UserMenu` (`useSession`/`signOut`), tabelas com `useQuery`, barra de busca/filtros, formulários com RHF + Yup + `useActionState`/`useFormStatus`, `RegistrarResultadoButton`, `ConfirmDeleteDialog` (AlertDialog), `<Toaster/>` |

Regras: nenhum documento Mongoose em prop de Client; nenhum `useEffect` para fetch; `<Image>` e `<Link>` em 100% dos casos; um componente principal por arquivo, PascalCase, hooks com `use*`, `memo`/`useMemo`/`useCallback` só com ganho real.

### 1.5 Direção visual autoral

**Paleta derivada do universo do clube: ardósia de tabuleiro + tinta azul de boletim + madeira escura de peça.** Original, sem reaproveitar hexadecimais de exemplo de guia e sem gradientes.

| Papel | Hex | Uso | Contraste medido sobre superfície |
|---|---|---|---|
| Superfície dominante (60%) | `#E7E8E3` — ardósia clara fosca | fundo, areas de leitura, tabelas | — |
| Estrutura (30%) | `#3C413C` — ardósia escura dessaturada | texto, bordas, barra lateral | **8,47:1** |
| Ação primária (10%) | `#1F4E79` — tinta de boletim | **somente** CTA principal e foco | **7,03:1** (branco sobre ele: **8,66:1**) |
| Sucesso | `#2B6B43` | resultado registrado, classificação publicada | **5,19:1** |
| Aviso | `#8A5A00` | partida pendente, rodada em rascunho | **4,81:1** |
| Erro | `#A33232` | exclusão, validação falha | **5,57:1** |

WCAG 2.1 AA atendido para texto normal (≥ 4,5:1) e componentes (≥ 3:1). Semântica por cor **sempre acompanhada de ícone `lucide-react` (strokeWidth 1.75) e texto explícito**. A cor de ação nunca aparece em título estático nem em enfeite. Sem dark mode nesta entrega; se for adicionado depois: nunca `#000000`, elevação por luminosidade e acento dessaturado 20–30%.

**Tipografia (`next/font/google`):**
- Títulos: **Libre Baskerville** — serif de boletim impresso, hierarquia clara (salto de escala 32 → 24 → 18px).
- Interface/corpo: **Noto Sans** — acentuação pt-BR completa e alta legibilidade em tabelas densas.
- Dados: **IBM Plex Mono** com `tabular-nums` — resultados (`1–0`, `½–½`), datas, rating e pontuação alinhados em coluna.

Corpo ≥ 16px em inputs mobile, line-height 1,5 em parágrafos e 1,15 em títulos, largura de linha 45–75 caracteres, grid de 8pt (micro-ajuste de 4px).

**Composição anti-template:** a tela principal é um **boletim**: linhas alinhadas à esquerda com divisores e colunas monoespaçadas, não um grid de cards idênticos. Scan em F no dashboard; Z no login. Um único CTA dominante por tela. Sem hero central, sem dois botões pílula, sem "10k+ / 99,9%", sem emoji, sem CAIXA ALTA decorativa, sem numeração 01/02/03 fora de sequência real, sem gradiente, sem `blur-3xl`, sem glassmorphism em card estático, sem fade-up em cascata, sem setinha automática em todo botão. Copy concreta: "Abrir inscrições", "Lançar rodada", "Registrar resultado", "Publicar boletim". Shelters escurecidos apenas em `Dialog`/`AlertDialog`.

**Cinco estados obrigatórios em cada listagem principal (jogadores, torneios, partidas):**

| Estado | Implementação |
|---|---|
| Ideal | Dados reais do Atlas via `.lean()` + DTO; tabela/boletim com colunas alinhadas |
| Empty | "Nenhum jogador cadastrado ainda." + CTA direto "Cadastrar primeiro jogador" |
| Loading | `loading.tsx` com skeleton da **mesma geometria** da tabela (linhas e colunas reais) |
| Partial | Cabeçalho, filtros e paginação estáveis com 1 item; escala para dezenas sem quebrar layout |
| Error | `error.tsx` com `reset()` + alerta inline "Não foi possível carregar… Tente novamente" |

Feedback < 400ms: `useFormStatus` no botão, skeleton de rota, toast Sonner objetivo, `AlertDialog` antes de exclusão definitiva, ESC para fechar overlays, mensagens que dizem o que falhou e como corrigir. Alvos de toque ≥ 44×44px (`min-h-11`), inputs ≥ 16px no mobile.

---

## 2. Contrato da API (fixar antes de implementar)

Padrão de autenticação em **todo** handler privado:

```ts
const session = await getServerSession(authOptions);
if (!session?.user?.id) return NextResponse.json({ erro: 'Faça login para continuar.' }, { status: 401 });
const doc = await Model.findById(id).lean();
if (!doc) return NextResponse.json({ erro: 'Registro não encontrado.' }, { status: 404 });
if (String(doc.usuarioId) !== session.user.id)
  return NextResponse.json({ erro: 'Você não pode acessar este registro.' }, { status: 403 });
```

| Método | Rota | Payload / resposta | Status |
|---|---|---|---|
| GET | `/api/jogadores?q=&categoria=&pagina=` | `JogadorDTO[]` + contagem real | 200 / 401 |
| POST | `/api/jogadores` | `{ nome, rating, categoria, clube? }` | 201 / 400 / 401 |
| GET/PATCH/DELETE | `/api/jogadores/[id]` | DTO / `{ nome?, rating?... }` / vazio | 200 / 400 / 401 / 403 / 404 |
| GET/POST | `/api/torneios` | filtros `status`, `dataInicio` / `{ nome, local, dataInicio, formato, numeroRodadas }` | 200 / 201 / 400 / 401 |
| GET/PATCH/DELETE | `/api/torneios/[id]` | DTO / alterações / cascata controlada | 200 / 400 / 401 / 403 / 404 |
| GET | `/api/torneios/[id]/classificacao` | `ClassificacaoDTO[]` calculada | 200 / 401 / 403 / 404 |
| GET/POST | `/api/inscricoes?torneioId=` | lista / `{ torneioId, jogadorId }` (bloqueia duplicata) | 200 / 201 / 400 / 401 / 403 |
| GET/PATCH/DELETE | `/api/inscricoes/[id]` | DTO / `confirmada` / cancelar | 200 / 401 / 403 / 404 |
| GET/POST | `/api/rodadas?torneioId=` | lista / `{ torneioId, numero }` | 200 / 201 / 400 / 401 |
| GET/PATCH/DELETE | `/api/rodadas/[id]` | DTO / `status` / exclusão | 200 / 401 / 403 / 404 |
| GET/POST | `/api/partidas?torneioId=&rodada=&status=` | lista / `{ rodadaId, brancasId, pretasId, resultado? }` | 200 / 201 / 400 / 401 / 403 |
| GET/PATCH/DELETE | `/api/partidas/[id]` | DTO / `{ resultado }` / exclusão | 200 / 400 / 401 / 403 / 404 |

Atualização sempre com `findByIdAndUpdate(..., { new: true, runValidators: true })`. Validação Yup tanto no cliente quanto no servidor (src/schemas/), tipos via `yup.InferType<typeof schema>`.

---

## 3. Plano de criação em quatro ondas

### Onda 1 — Fundação e autenticação

- [ ] `package.json` com Next.js 16 + React 19, `next-auth@^4.24.13`, `mongoose`, `bcryptjs`, `react-hook-form`, `yup`, `@hookform/resolvers/yup`, `@tanstack/react-query`, `axios`, `zustand`, `lucide-react`, `sonner`, primitives Radix/ShadCN copy-paste; `.npmrc` com `legacy-peer-deps=true` se o instalador reclamar de peer
- [ ] `tsconfig.json` estrito, `next.config.ts` (sem `images.domains`; `remotePatterns` específicos se houver avatar externo), Tailwind CSS v4 (`@import "tailwindcss"`, `@theme inline`, `@layer base` com cursor pointer)
- [ ] `src/lib/db.ts`: Singleton com `declare global` tipado para `conn` e `promise` — nunca `(global as any)`
- [ ] `src/lib/auth.ts` com `CredentialsProvider`, `session.strategy: 'jwt'`, `.select('+password')`, `bcrypt.compare`; callbacks `jwt` (`token.id = user.id`) e `session` (`session.user.id = token.id`)
- [ ] `src/types/next-auth.d.ts` (module augmentation), `src/app/api/auth/[...nextauth]/route.ts` (só GET/POST), `src/providers/SessionProvider.tsx`
- [ ] `src/models/` (User + 5 modelos), `src/lib/utils.ts` (`cn`), `.env.example`, `.gitignore`
- [ ] `layout.tsx` raiz com fontes, providers e `<Toaster/>` único; `(publico)/` landing, login e registrar
- [ ] **Gate 1:** `npx tsc --noEmit` limpo; login/cadastro funcionando contra Atlas; `<Toaster/>` montado uma vez

### Onda 2 — Contratos, dados e escrita no servidor

- [ ] `src/schemas/*.ts` (Yup: jogador, torneio, inscricao, rodada, partida, registro de usuário) e `src/types/dtos.ts`
- [ ] `src/lib/serializers.ts` + `src/services/classificacao.ts` + `src/services/api.ts` (Axios) + `src/services/queryKeys.ts`
- [ ] Helpers `src/lib/guards.ts`: `exigirSessao()` e `exigirPropriedade(modelo, id, userId)` reutilizados por handlers e actions
- [ ] Todos os Route Handlers do mapa, com `await params`, `await searchParams`, `new`/`runValidators`, status semânticos
- [ ] Server Actions em `src/app/actions/` com Yup, `revalidatePath`, retorno `{ ok, erro? }`, `redirect()` **fora** de `try/catch`
- [ ] **Gate 2:** `npx tsc --noEmit` limpo; POST sem sessão → 401; GET de registro de outro usuário → 403; duplicata de inscrição e de jogador na rodada → 400

### Onda 3 — Interface e estado

- [ ] `src/providers/TanstackProvider.tsx` (`useState(() => new QueryClient())`, `staleTime: 30_000`)
- [ ] `src/store/ui-store.ts` (Zustand com seletores atômicos)
- [ ] `src/components/ui/` (button, input, label, table, badge, dialog, alert-dialog, skeleton, select, tabs, sonner)
- [ ] `src/components/layout/` (AppShell, UserMenu), `src/components/auth/`, `src/components/jogadores/`, `src/components/torneios/`, `src/components/partidas/`
- [ ] Telas do mapa com os cinco estados; tabela-boletim em F; detalhe do torneio com abas Inscrições / Rodadas / Classificação
- [ ] Formulários: RHF + `yupResolver`, `useActionState`, `useFormStatus`, invalidateQueries após sucesso
- [ ] **Gate 3:** `npx tsc --noEmit` limpo; mobile 375px com inputs ≥ 16px e alvos ≥ 44px; sem `<img>`/`<a>` interno; sem `useEffect` de fetch

### Onda 4 — Resiliência, entrega e deploy

- [ ] `loading.tsx`, `error.tsx` (com `reset()`), `not-found.tsx` nos segmentos principais
- [ ] Auditoria final: parâmetros assíncronos, nenhuma exportação extra em `route.ts` do NextAuth, nenhuma pasta `atoms/molecules/organisms/templates`, nenhum clichê visual
- [ ] `.env.example` documentado; `README.md` completo (visão geral, arquitetura, Atlas com Network Access `0.0.0.0/0`, `.env.local`, comandos, identidade visual, deploy Vercel)
- [ ] **Gate 4:** `npx tsc --noEmit` **e** `npm run build` sem erros; teste de bloqueio de página privada e de `DELETE` sem sessão; deploy na Vercel com `MONGODB_URI` e `NEXTAUTH_SECRET`

---

## 4. Checklist de verificação final (copiar e marcar na auditoria)

- [ ] `npx tsc --noEmit` — zero erros
- [ ] `npm run build` — zero erros
- [ ] Nenhum `useEffect` fazendo `fetch`/Axios
- [ ] Nenhum `params.id`/`searchParams` síncrono; tudo `Promise` + `await`
- [ ] `route.ts` do NextAuth exporta apenas `GET` e `POST`; `authOptions` isolada em `src/lib/auth.ts`
- [ ] Toda rota privada, handler e action chama `getServerSession(authOptions)` **e** confere `usuarioId`
- [ ] `.lean()` + DTOs em toda passagem Server → Client; sem `ObjectId`/`Date` cru em prop
- [ ] Bcrypt salt 10; `password` com `select: false`; `session.user.id` tipado por module augmentation
- [ ] Yup exclusivamente (sem Zod); `InferType` nos formulários; sem `any`, `@ts-ignore` ou lint error
- [ ] Zustand apenas para UI; TanStack Query para dados remotos; `revalidatePath` + `invalidateQueries` coordenados
- [ ] `<Image>`/`<Link>` nativos; `'use client'` só nas folhas
- [ ] Sonner com um único `<Toaster/>`; cursor pointer no CSS base; ícones `lucide-react` com strokeWidth 1.75
- [ ] 5 estados de UI em jogadores, torneios e partidas; skeleton com geometria real
- [ ] WCAG AA (contrastes medidos na §1.5), alvos ≥ 44px, inputs ≥ 16px, sem cor sem texto/ícone
- [ ] Sem Atomic Design, sem gradientes proibidos, sem blur decorativo, sem dados fictícios
- [ ] `.env.example` + `.gitignore` protegendo `.env.local`; README completo em pt-BR

## 5. Deploy (Vercel)

1. MongoDB Atlas: Cluster → **Network Access → Add IP Address → `0.0.0.0/0`** (necessário para as funções serverless da Vercel); criar usuário com permissão `readWrite` no DB do projeto.
2. Vercel → Project → Settings → Environment Variables: `MONGODB_URI`, `NEXTAUTH_SECRET` (gerar com `openssl rand -base64 32`). `NEXTAUTH_URL` fica apenas no `.env.local`; em produção o NextAuth v4 usa `VERCEL_URL`.
3. `npm run build` local antes do push; conferir os gates acima.
4. Após o deploy: testar `/login`, criar um jogador, criar um torneio, inscrever, gerar rodada, registrar resultado e conferir a classificação — sempre com dados reais no Atlas.

---

## 6. Aprovação

Aguardando validação da **Fase 1** (tema, regras, modelos, rotas, fronteira Server/Client e direção visual). Com a confirmação, inicio a **Onda 1** e paro no Gate 1.
