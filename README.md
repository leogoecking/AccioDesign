# AccioDesign

**Laboratório visual local para experimentar, personalizar e aprovar interfaces e identidades visuais antes da implementação por agentes de IA ou equipes de engenharia.**

Construído sobre [Puck](https://github.com/puckeditor/puck), [shadcn/ui](https://ui.shadcn.com/), [Tweakcn](https://github.com/jnsahaj/tweakcn), [Tailwind CSS v4](https://tailwindcss.com/) e [React Router 7](https://reactrouter.com/), o AccioDesign une composição visual por blocos administrativos com um provador de temas em tempo real — tudo rodando localmente, sem dependência de serviços pagos, autenticação ou nuvem proprietária.

---

## Objetivo

Antes de iniciar o desenvolvimento de um sistema administrativo, painel operacional ou aplicação web — especialmente em fluxos assistidos por agentes de IA — é comum precisar validar layout, hierarquia de informação, paleta semântica, tipografia, arredondamento e contraste **em componentes reais**.

O AccioDesign resolve essa etapa como um **laboratório visual local**:

1. **Monte** telas administrativas arrastando componentes reais de dashboard (`Header`, `AppSidebar`, `Stats`, `KpiCard`, `DataTable`, `FilterBar`, `FormBlock` etc.).
2. **Experimente** identidades visuais com presets do Tweakcn e ajuste tokens em tempo real dentro do iframe de preview, sem afetar a interface do próprio editor.
3. **Aprove e persista** o layout e o tema escolhido localmente em JSON estruturado, prontos para inspeção em página publicada e futura exportação para ferramentas e agentes.

---

## Funcionalidades disponíveis (Implementadas)

### Editor Visual (Puck + React Router 7)
- Edição visual com drag-and-drop, slots aninhados, edição inline (`contentEditable`), responsividade por viewports e histórico nativo (**Undo / Redo**).
- Rotas dinâmicas: qualquer caminho `/minha-rota/edit` abre o editor visual; ao publicar, `/minha-rota` passa a renderizar a página publicada com SSR e hidratação React.
- Persistência local em arquivo ([database.json](./database.json)) por padrão, incluindo um painel operacional demonstrativo pré-configurado em `/`.

### Catálogo Administrativo (`shadcn/ui` + `Radix UI`)
19 componentes configurados em [app/puck/index.tsx](./app/puck/index.tsx), organizados em 6 categorias no painel do Puck e editáveis pelas propriedades nativas:

- **Navegação:** `Header`, `AppSidebar`, `BreadcrumbNav`, `Footer`
- **Layout:** `PageHeader`, `DashboardGrid`, `TabsSection`, `Bento`, `Divider`
- **Cards:** `DashboardCard`, `CardGrid`, `UserSummaryCard`
- **Indicadores:** `Stats`, `KpiCard`, `StatusBadgeGroup`
- **Tabelas:** `DataTable` (com busca ao vivo no cliente), `KeyValueTable`
- **Formulários:** `FormBlock`, `FilterBar`

Todos os componentes respeitam o contexto `EditorModeProvider`, evitando navegação acidental de links ou submissão de formulários durante a edição e mantendo comportamento interativo na página publicada.

### Provador Visual de Identidades (Tweakcn)
Integrado como plugin nativo na barra lateral esquerda do Puck (**Tema**) e na barra superior de ações rápidas:

- **Catálogo visual com 43 presets:** tema padrão do AccioDesign + todos os **42 presets built-in do Tweakcn**, exibidos com nome e amostras de cores.
- **Personalização em tempo real:**
  - Cores semânticas (`primary`, `secondary`, `background`, `foreground`, `card`, `popover`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5` e tokens `sidebar-*`).
  - Tipografia (`font-sans`, `font-serif`, `font-mono` com carregamento dinâmico de Google Fonts e `letter-spacing`).
  - Bordas (`radius`), escala de espaçamento (`spacing`) e sombras (`shadow-color`, `opacity`, `blur`, `spread`, `offset-x/y`).
  - Alternância instantânea entre **Light** e **Dark**.
- **Isolamento do editor e paridade publicada:** o tema é aplicado exclusivamente ao `#preview-frame` do Puck durante a edição (a UI do editor permanece neutra) e é renderizado no SSR + hidratação da página publicada.
- **Persistência local, exportação e importação segura:**
  - Tema ativo salvo no documento da página (`root.props.theme`) em `database.json` ao publicar.
  - Biblioteca local de snapshots nomeados em `localStorage`.
  - Exportação em **JSON estruturado** (`schemaVersion: "1.0"`, preparado para evolução futura) e **CSS Tailwind v4** (`OKLCH`, `HSL`, `HEX` ou `RGB`).
  - Importação de JSON com allowlist estrita de tokens e sanitização contra CSS/HTML inseguro.

---

## Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Framework & Roteamento | React 19, React Router 7 (SSR framework mode) |
| Bundler & Build | Vite 6, TypeScript 5.8 (`strict` + `verbatimModuleSyntax`) |
| Editor Visual | `@puckeditor/core` 0.24 |
| Design System & UI | Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (`radix-rhea`), Radix UI, Lucide |
| Temas & Tokens | Módulos adaptados do Tweakcn (Apache 2.0) |

---

## Instalação e execução local

### Pré-requisitos
- **Node.js** `>= 20.0.0`
- **npm** (ou gerenciador compatível)

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/leogoecking/AccioDesign.git
cd AccioDesign

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Após iniciar o servidor:
- **Página publicada (painel demonstrativo):** `http://localhost:5173/`
- **Editor visual (Puck + Tweakcn):** `http://localhost:5173/edit`
- **Nova página em qualquer rota:** acesse `http://localhost:5173/minha-pagina/edit`, monte a interface e clique em **Publish** para visualizar em `http://localhost:5173/minha-pagina`.

### Scripts disponíveis

```bash
npm run typecheck   # Gera rotas tipadas do React Router e executa tsc
npm run build       # Gera os bundles client e SSR em ./build
npm run start       # Inicia o servidor de produção via react-router-serve
```

---

## Projetos open source utilizados

- **[Puck](https://github.com/puckeditor/puck)** — Editor visual open source para React (MIT).
- **[puck-configs](https://github.com/puckeditor/puck-configs)** — Configurações de referência `shadcn-twblocks` que serviram de base para os blocos iniciais.
- **[Tweakcn](https://github.com/jnsahaj/tweakcn)** — Presets, gerador de tokens Tailwind v4, sombras e manipulação de temas (Apache 2.0).
- **[shadcn/ui](https://github.com/shadcn-ui/ui)** — Primitivos e convenções de interface (MIT).
- **[Radix UI](https://github.com/radix-ui/primitives)** — Primitivos acessíveis de UI (MIT).
- **[Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)**, **[React Router](https://github.com/remix-run/react-router)**, **[Vite](https://github.com/vitejs/vite)** e **[Lucide](https://lucide.dev)**.

---

## Roadmap

### Implementado
- [x] Estrutura base com Puck + React Router 7 + Vite + Tailwind CSS v4
- [x] Catálogo administrativo shadcn/ui com 19 blocos em 6 categorias
- [x] Integração do Tweakcn como plugin nativo no Puck (`Tema`), com 43 presets, editor de tokens em tempo real e Light/Dark
- [x] Isolamento visual do editor host em relação ao iframe de preview e paridade com a página publicada
- [x] Persistência local (`database.json` + `localStorage`), exportação JSON/CSS v4 e importação JSON sanitizada

### Planejado (próximas etapas)
- [ ] **Integração com TokenBridge:** sincronização bidirecional e validação de contratos de design tokens para handoff padronizado.
- [ ] **Exportação para agentes de IA:** geração de pacotes de contexto (estrutura de componentes Puck + tokens aprovados + diretrizes visuais) prontos para consumo por agentes implementadores.
- [ ] **Biblioteca de templates administrativos:** páginas iniciais prontas (visão executiva, CRUD/tabelas, configurações e onboarding) para acelerar experimentações.
- [ ] **Comparação rápida entre identidades:** visualização lado a lado e histórico nomeado de variações aprovadas.

---

## Licenciamento e créditos

O **AccioDesign** é licenciado sob a **Apache License, Version 2.0**. Consulte:
- [LICENSE](./LICENSE) — texto integral da licença Apache 2.0;
- [NOTICE](./NOTICE) — avisos legais do projeto e atribuições;
- [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) — mapeamento detalhado de módulos reutilizados, origens e adaptações realizadas.
