# Preservar o contrato visual

## Requisitos

- Reutilize as views React fornecidas e componha sobre os componentes compatíveis que já existem no destino. Estenda props ou callbacks se a tarefa pedir novos dados ou interações. Crie uma nova view somente quando houver uma lacuna concreta.
- Consulte `DESIGN.md` para as escolhas registradas, `tokens.json` para os valores por modo e `theme.css` para as variáveis e regras compartilhadas. Preserve tipografia, cores, espaçamentos, sombras e bordas. Use o token equivalente quando existir e mantenha os valores CSS aprovados.
- Preserve hierarquia, navegação, largura configurada em `root.props.layoutWidth`, densidade, limites locais, responsividade e estados Light/Dark. Confira o modo ativo e a aplicação das fontes. O `frontend/README.md` indica famílias que o destino precisa fornecer.
- Preserve IDs e chaves dos blocos durante atualizações. Mantenha os tipos de componente dos slots estáveis e faça-os receber os dados atuais. Uma atualização de props, uma consulta ou um redimensionamento deve preservar foco, conteúdo digitado e seleção de abas quando os blocos permanecem montados.
- Aplique mudanças visuais explícitas do usuário ao trecho solicitado. Use Impeccable, Taste Skill ou ferramentas equivalentes para identificar problemas e validar a integração dentro do contrato visual aprovado.

## Referências no pacote

`design.json` descreve a ordem e a composição do documento. Leia `components.md` quando precisar encontrar um bloco ou slot. Para mudanças no tema, confira também o escopo `[data-accio-theme]` e a classe `dark`. Para mudanças nos slots, comece em `frontend/src/export/frontend/runtime.tsx`.
