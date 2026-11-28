# Validação e regressões

[Voltar ao README](../README.md)

## Verificações do repositório

Execute na raiz do AccioDesign.

```bash
npm test
npm run typecheck
npm run build
```

`npm test` compila a suíte com esbuild e usa `node:test`. Os testes cobrem templates, persistência, temas, catálogo, estrutura do frontend e determinismo do ZIP. A suíte também confere o frontmatter YAML, as referências e o Engineering Quality Gate nas duas entradas da skill, compara os cinco arquivos portáteis com a fonte canônica e verifica a ausência de `.agents` no ZIP. O typecheck gera tipos de rota e executa o TypeScript. O build gera o cliente e o servidor em `build/`, executável por `npm run start`.

## Testes de navegador e pacote

Para evitar usar dados de trabalho, inicie um servidor dedicado em um terminal.

```bash
ACCIO_DATA_DIR="$(mktemp -d)" npm run dev -- --host 127.0.0.1 --port 5199 --strictPort
```

Em outro terminal, execute os comandos abaixo na raiz do projeto. Os scripts de navegador usam Chromium via agent-browser. Os testes do frontend usam também `npm` e `unzip`. A comparação de imagens usa ImageMagick. O ambiente deve ter os executáveis disponíveis no `PATH`.

```bash
bash tests/export.browser.sh
bash tests/navigation.browser.sh
bash tests/editor-save.browser.sh
node tests/executable-export.mjs
```

Os três primeiros verificam o download, a proteção de alterações pendentes, a navegação e o salvamento. O último exporta os três templates e a estrutura em branco, extrai os ZIPs e executa instalação, typecheck e build fora do repositório. Em seguida, substitua `<diretório-impresso>` pelo caminho que o script exibiu.

```bash
node tests/executable-export.browser.mjs <diretório-impresso>
```

A comparação executa os builds independentes, mede estilos e estados renderizados, testa a busca da tabela administrativa e grava os PNGs e o relatório em `capturas/` no diretório temporário. Na validação original da exportação React foram comparados 12 pares em 1440×900, 768×1024 e 390×844. Sistema administrativo e Em branco coincidiram. Dashboard operacional e Central de atendimento tiveram diferença normalizada de até 0,018% na configuração testada.

## Runtime React

```bash
node tests/stable-export-runtime.browser.mjs
```

O teste extrai um frontend, instala, compila e usa Chromium para atualizar um formulário aninhado em abas. Verifica foco, conteúdo digitado, identidade dos nós do DOM, aba ativa, atualização dos dados e inclusão, remoção e reordenação de blocos e slots. Na validação da estabilização, o campo permaneceu focado com o texto digitado durante as três atualizações, e os 12 PNGs de comparação permaneceram idênticos aos da validação anterior.

## Responsividade

```bash
ACCIO_TEST_RESPONSIVE=1 node tests/executable-export.mjs
node tests/responsive-layout.browser.mjs <diretório-impresso>
bash tests/responsive-width-controls.browser.sh
```

A matriz inclui os três templates, a estrutura em branco, uma composição com os 30 blocos e dois documentos com shell curto em modo Fluido e legado. Cada cenário usa uma combinação de largura, navegação, densidade e tema em Experimentar, Editar, Apresentar e no frontend exportado. O script redimensiona a janela, mede largura, altura e overflow, e verifica a identidade do nó de layout. A regressão do shell longo rola até o último formulário. O relatório `responsividade.json` fica ao lado dos sete pacotes extraídos, dentro de `TMPDIR` ou do diretório temporário do sistema. O último comando verifica a persistência da largura ao alternar entre os modos.

Na validação da responsividade global, as 168 verificações passaram em 390×844, 768×1024, 1366×768, 1920×1080, 2560×1440 e 3440×1440. O shell curto ocupou a altura disponível em modo Fluido, o longo permitiu rolar até o formulário e a página permaneceu sem overflow horizontal. A grade passou de uma para quatro colunas e a tabela rolou na própria região. Dos 21 pares comparados, 15 coincidiram, com diferença normalizada máxima de 0,016%.

## Descoberta da skill

Os testes de descoberta anteriores usaram Codex CLI 0.172.0 via `skills/list` e Antigravity CLI 1.5.18 pelos comandos disponíveis em uma sessão ACP, com a skill em um workspace temporário. A distribuição global passou pela homologação do operador nos dois agentes.

Na mudança para a distribuição portátil, o Skills CLI 1.9.0 instalou a skill de `leogoecking/AccioDesign` no escopo global de um ambiente isolado com Codex, Antigravity e Antigravity CLI selecionados. Foram conferidos os cinco arquivos em `~/.agents/skills/acciodesign/` e a instalação adicional para Antigravity em `~/.gemini/config/skills/acciodesign/`. A atualização por nome e escopo confirmou que a instalação já estava atualizada. Veja instalação e resolução de duplicidade no [README](../README.md#instalação-e-ativação).

A instalação local a partir da pasta portátil e a remoção no escopo do projeto também foram testadas nesse ambiente. A cópia global permaneceu disponível. Ao abrir um ZIP novo extraído, o Codex CLI listou uma única entrada global ativa e o Antigravity CLI via ACP expôs um único comando `acciodesign`. A verificação consultou apenas a descoberta local.

## Distribuição portátil e documentação

Dois downloads do mesmo projeto no build de produção foram idênticos. Após a extração, os cinco arquivos da skill correspondiam à fonte canônica, com referências válidas na entrada portátil e na entrada legada. O teste de navegador confirmou o download e a ausência de `.agents`. Os três templates e a estrutura em branco passaram por instalação, typecheck, build e execução independente. Na comparação em Chromium, seis dos 12 pares de capturas coincidiram, com diferença normalizada máxima de 0,019%. O filtro da tabela administrativa também foi exercitado.

As três imagens do README foram capturadas na aplicação atual com dados demonstrativos. Os links internos foram conferidos, incluindo as âncoras da documentação e da skill. Os dois diagramas foram renderizados pelo Mermaid CLI.

## Gráficos e análise de dados (Fase 8.1)

```bash
npm test
node tests/analytics-blocks.browser.mjs
```

A suíte `Fase 8.1` em [tests/phase3.test.ts](../tests/phase3.test.ts) valida o registro da categoria **Gráficos e análise** (5 novos blocos, totalizando 25 no catálogo), os utilitários de formatação `pt-BR` e sanitização de IDs SVG em [chart-utils.ts](../app/puck/components/chart-utils.ts), o isolamento seletivo de dependências no exportador (projetos sem gráficos não incluem `recharts`, `chart.tsx` nem `chart-utils.ts`) e o determinismo do ZIP em cada bloco individual.

O script [tests/analytics-blocks.browser.mjs](../tests/analytics-blocks.browser.mjs) executa no Chromium headless via CDP contra o servidor de produção (`react-router-serve`) e o frontend React extraído de forma independente (`npm install`, `typecheck`, `build` e `vite preview`):

- Validação de estados vazios (`data: []`), séries zeradas (`0`), múltiplas instâncias simultâneas (`AreaChart` e `SparklineCard`) e ausência de colisão de IDs internos de SVG (`defs [id]` e `[data-chart]`).
- Validação em **Experimentar** (Claro/Escuro com troca de presets e densidade no iframe), **Editar** (categoria `Gráficos e análise` no Puck), **Apresentar** (Desktop `1440x900` e Mobile `390x844` sem overflow) e **frontend exportado** (renderização com 6 superfícies `svg.recharts-surface` ativas, 0 erros de console/página, 0 warnings `width(-1)` e paridade visual/DOM idêntica entre Apresentar e o pacote exportado).
- Capturas registradas em [docs/screenshots/](../docs/screenshots/): `analytics-composition-light.png`, `analytics-composition-dark.png`, `analytics-exported-frontend.png` e `analytics-mobile.png`.

## Informações e atividades (Fase 8.2)

```bash
npx impeccable detect app/components/ui/fallback-avatar.tsx app/components/ui/copy-button.tsx app/puck/config/components/activity-timeline/activity-timeline.tsx app/puck/config/components/record-list/record-list.tsx app/puck/config/components/progress-card/progress-card.tsx app/puck/config/components/agenda-card/agenda-card.tsx app/puck/config/components/notification-list/notification-list.tsx --json
npm test && npm run typecheck && npm run build
node tests/information-blocks.browser.mjs
```

- A suíte unitária cobre o catálogo com 30 blocos, contratos TokenBridge, empacotamento seletivo dos primitivos Spell UI (`fallback-avatar.tsx`, `copy-button.tsx`) e de `licenses/LICENSE-SPELLUI-MIT.txt` apenas quando o projeto usa `RecordList` ou `NotificationList`, além da ausência de `recharts` fora da categoria de gráficos (17/17 testes).
- A verificação real no navegador valida estados vazios, estados real/erro e sucesso no `CopyButton` (`data-copy-status`), strings longas sem quebra em `390x844` sem overflow horizontal, Modo Experimentar (Ocean Breeze Dark + densidades Compacto/Padrão/Confortável), categoria no Editor Puck com edição ao vivo de propriedades, Modo Apresentar com alternância interativa de leitura no `NotificationList`, build + execução do frontend React exportado e paridade DOM/visual em desktop (`1440x900`), tablet (`768x1024`) e mobile (`390x844`).
- Capturas registradas em [docs/screenshots/](../docs/screenshots/): `information-composition-light.png`, `information-composition-dark.png`, `information-exported-frontend.png` e `information-mobile.png`.
