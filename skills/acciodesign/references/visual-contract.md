# Preservar o contrato visual

## Inventário do fluxo

Antes de editar, liste os campos, indicadores, ações e componentes relevantes. Identifique cada um por rótulo e por ID, slot ou caminho quando disponível. Marque se deve permanecer, ser conectado a uma funcionalidade solicitada ou mudar por um motivo explícito. Use o pedido para decidir quais ações demonstrativas precisam funcionar.

Compare o inventário com o que a aplicação renderiza após conectar os dados. Verifique presença, posição e hierarquia dos elementos nos estados afetados. Os arquivos `design.json`, `tokens.json` e `theme.css` servem de referência para essa comparação. Registre cada remoção ou substituição necessária, o elemento afetado e a justificativa. Sem justificativa, preserve o elemento relevante.

## Requisitos

- Reutilize as views React fornecidas e componha sobre os componentes compatíveis que já existem no destino. Estenda props ou callbacks se a tarefa pedir novos dados ou interações. Crie uma nova view somente quando houver uma lacuna concreta.
- Consulte `DESIGN.md` para as escolhas registradas, `tokens.json` para os valores por modo e `theme.css` para as variáveis e regras compartilhadas. Preserve tipografia, cores, espaçamentos, sombras e bordas. Use o token equivalente quando existir e mantenha os valores CSS aprovados.
- Preserve navegação, largura do conteúdo configurada em `root.props.layoutWidth`, densidade, limites locais, responsividade e estados Light/Dark. Confira o modo ativo e a aplicação das fontes. O `frontend/README.md` indica famílias que o destino precisa fornecer.
- Preserve IDs e chaves dos blocos durante atualizações. Mantenha os tipos de componente dos slots estáveis e faça-os receber os dados atuais.
- Use Impeccable, Taste Skill ou ferramentas equivalentes para identificar problemas e validar a integração dentro do contrato visual aprovado.

## Referências no pacote

`design.json` descreve a ordem e a composição do documento. Leia `components.md` quando precisar encontrar um bloco ou slot. Para mudanças no tema, confira também o escopo `[data-accio-theme]` e a classe `dark`. Para mudanças nos slots, comece em `frontend/src/export/frontend/runtime.tsx`.
