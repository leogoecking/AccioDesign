# Arquitetura do AccioDesign

[Voltar ao README](../README.md)

## Aplicação local

O AccioDesign usa React 19, React Router 7 em modo framework com SSR, TypeScript 5.8 e Vite 6. A interface usa Tailwind CSS v4, shadcn/ui (radix-rhea), Radix UI, Recharts 3 e Lucide. O editor usa Puck 0.24 e os temas vêm de módulos adaptados do Tweakcn. Os módulos de origem e suas licenças estão nos [avisos de terceiros](../THIRD_PARTY_NOTICES.md).

| Área | Entrada |
| --- | --- |
| Galeria e projetos locais | [Rota inicial](../app/routes/_index.tsx) e [templates](../app/templates/index.ts) |
| Editor visual | [Configuração Puck](../app/puck/index.tsx) |
| Prévia de Experimentar | [Preview em iframe](../app/components/playground/preview-frame.tsx) |
| Validação de temas | [Esquema de temas](../app/theme/schema.ts) |
| Layout e CSS compartilhados | [RootLayout](../app/puck/components/root/root-layout.tsx) e [visual-contract.css](../app/theme/visual-contract.css) |
| Empacotamento | [Exportador do ZIP](../app/export/design-export.server.ts), [gerador React](../app/export/react-export.server.ts) e [catálogo de fontes](../app/export/frontend-sources.server.ts) |
| Renderização do frontend exportado | [Runtime React](../app/export/frontend/runtime.tsx) |

As rotas legadas de edição e apresentação continuam disponíveis. O preview do modo Experimentar chama o mesmo renderizador de blocos da apresentação por um portal React em um iframe. As folhas de estilo e o tema são aplicados dentro do documento do iframe, isolando a identidade visual do projeto da interface da ferramenta. As dimensões da prévia acionam media queries e consultas de contêiner reais.

### Catálogo e temas

| Categoria | Blocos |
| --- | --- |
| Navegação | `Header`, `AppSidebar`, `BreadcrumbNav`, `Footer` |
| Layout | `PageHeader`, `DashboardGrid`, `TabsSection`, `Bento`, `KanbanBoard`, `Divider` |
| Cards | `DashboardCard`, `CardGrid`, `UserSummaryCard` |
| Indicadores | `Stats`, `KpiCard`, `StatusBadgeGroup` |
| Tabelas | `DataTable` com busca local, `KeyValueTable` |
| Formulários | `FormBlock`, `FilterBar` |
| Gráficos e análise | `AreaChart`, `BarChart`, `LineChart`, `DonutChart`, `SparklineCard` |
| Informações e atividades | `ActivityTimeline`, `RecordList`, `ProgressCard`, `AgendaCard`, `NotificationList` |

O documento Puck guarda tema, modo de navegação, densidade e largura em `root.props`. Alterar uma dessas propriedades mantém os blocos, seus slots e seus dados. O modo Experimentar oferece 43 identidades visuais, Claro/Escuro, tipografia, densidade, cantos e navegação. Edição de cores e sombras individuais e importação/exportação de tema CSS/JSON ficam na aba **Tema** em Editar. Os controles de navegação aparecem quando há um bloco `AppSidebar` compatível com os modos Sidebar, Rail compacto ou Topo.

### Layout responsivo

A largura é configurada em **Estrutura e estilo** no modo Experimentar ou nas propriedades da raiz em Editar. A escolha acompanha o projeto em `root.props.layoutWidth` e o exportador a registra no `DESIGN.md`.

- **Fluida**, padrão dos novos projetos. A página e o shell principal ocupam a altura disponível, mantêm o espaçamento interno e crescem verticalmente com o conteúdo.
- **Centralizada**. O conteúdo é centralizado com largura máxima de 1440 px.
- **Personalizada**. A largura máxima pode ser escolhida entre 320 e 3840 px, respeitando o espaço disponível.
- **Layout anterior**. Projetos sem a propriedade mantêm a largura anterior até que o usuário salve um modo.

O CSS compartilhado varia grids e navegação segundo a largura de seus contêineres. Formulários e blocos de leitura mantêm seus limites locais e tabelas podem rolar em uma região própria.

## Persistência, segurança e limites de uso

- [database.json](../database.json) é a base demonstrativa versionada e fica em somente leitura para o app. Projetos de trabalho e páginas legadas são armazenados em `.accio-data/projects.json` e `.accio-data/legacy-pages.json`, ignorados pelo Git. O primeiro carregamento do armazenamento de projetos pode migrar páginas personalizadas da base anterior.
- A aplicação é voltada para uso local e individual. A persistência usa arquivos JSON, sem autenticação, banco externo ou coordenação de concorrência multiusuário.
- Temas importados passam por uma lista de tokens permitidos e pela validação de valores CSS. Arquivos de ambiente e outros projetos ficam fora do ZIP. A exportação rejeita campos e padrões de credenciais comuns. Revise o conteúdo do projeto antes de compartilhar, pois texto livre ainda pode conter informação sensível.
- O servidor funciona localmente após instalar as dependências. Fontes externas e URLs inseridas no projeto podem exigir rede. A exportação é realizada pelo servidor local e independe de uma chamada a um modelo de IA.

## Contrato visual e frontend exportado

O ZIP é gerado a partir do estado salvo e usa caminhos e metadados fixos. Se houver alterações pendentes, a interface pede para salvar antes de exportar. Se o salvamento falhar ou uma edição ocorrer durante a operação, o download é interrompido.

O exportador adapta o formato TokenBridge para preservar os tokens efetivos de Light e Dark. Valores de cores seguem o documento original, e sombras compostas seguem o mesmo cálculo da prévia. Cores de sucesso, aviso e informação, escalas e configurações ausentes são registradas como não mapeadas. Consulte a [proveniência do adaptador TokenBridge](../THIRD_PARTY_NOTICES.md#5-tokenbridge).

O `theme.css` exportado incorpora regras visuais compartilhadas, tipografia e bindings de tokens. Se você integrar o CSS em outra stack Vite/Tailwind, mantenha Tailwind CSS v4, `tw-animate-css`, `shadcn/tailwind.css` e `@fontsource-variable/inter` disponíveis. O README do frontend indica as fontes fornecidas por dependências Fontsource e as famílias adicionais que o destino precisa disponibilizar. URLs de fontes, imagens e links do documento podem continuar externas. Para alternar o tema no destino, mantenha alinhados a classe `.dark`, o `color-scheme` e o modo passado a `DesignView`. O modo salvo consta no manifesto.

O exportador percorre os slots declarados e inclui apenas as views usadas, inclusive as aninhadas, mais as dependências autorizadas. Os 30 blocos do catálogo são suportados. Projetos que não utilizam blocos de **Gráficos e análise** não recebem `recharts`, `components/ui/chart.tsx` nem `puck/components/chart-utils.ts` no frontend exportado, e projetos que não usam `RecordList` nem `NotificationList` não recebem `components/ui/fallback-avatar.tsx`, `components/ui/copy-button.tsx` nem `licenses/LICENSE-SPELLUI-MIT.txt`. Tipos de bloco desconhecidos ou slots malformados interrompem a exportação. Zonas legadas sem consumidor no catálogo ficam preservadas no JSON. O inventário descreve dependências diretas conhecidas e pode citar caminhos do repositório original.

O frontend usa as mesmas views da apresentação e executa separadamente do servidor do AccioDesign e do Puck. O ponto de entrada `frontend/src/main.tsx` registra as views. Conecte dados reais por props, callbacks ou adaptadores e trate os dados de `frontend/src/design.json` como demonstração. Integrações com APIs e regras de negócio pertencem ao projeto de destino. Mantenha os [avisos e licenças das views reutilizadas](../THIRD_PARTY_NOTICES.md#2-puck--puck-configs-shadcn-twblocks).

### Identidade dos slots React

Antes da estabilização do runtime, atualizar o documento recriava funções de componentes de slot. O React remontava as subárvores, perdendo o campo focado e a aba ativa. O runtime mantém um tipo React por endereço do slot. Em arrays, usa o ID do item quando disponível e a posição como alternativa. O tipo recebe o conteúdo atual por contexto. Chaves por ID preservam blocos que permanecem no mesmo slot, e tipos sem uso são descartados após a atualização. Os [testes de regressão](./validacao.md#runtime-react) reproduzem essa transição.

### Distribuição da skill

A fonte canônica fica em [skills/acciodesign/](../skills/acciodesign/). O [empacotador](../app/export/agent-skill.server.ts) importa os cinco arquivos dessa pasta e inclui seu conteúdo em `skills/acciodesign/` no ZIP. A entrada legada `SKILL.md` é gerada da mesma fonte, com o nome `acciodesign-design` e links relativos à raiz. Instalação e descoberta pertencem ao ambiente do agente. O [README](../README.md#agent-skill) explica o fluxo recomendado.
